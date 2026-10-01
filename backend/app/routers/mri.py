from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import case
from ..database import get_db
from ..models import MRIRequest, Patient, User, AuditLog
from ..schemas import MRIRequestCreate, MRIRequestResponse, TransmitStudyRequest
from ..auth import get_current_user
from ..qos_engine import QoSEngine
from ..traffic_simulator import NetworkSimulator

router = APIRouter(prefix="/mri", tags=["MRI Ordering & QoS Prioritization"])

@router.post("/request", response_model=MRIRequestResponse, status_code=status.HTTP_201_CREATED)
def create_mri_request(
    request_in: MRIRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = db.query(Patient).filter(Patient.id == request_in.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient record not found")

    # Generate Unique Request ID
    count = db.query(MRIRequest).count() + 1
    req_id = f"MRI-REQ-2026-{count:03d}"

    # Determine Source IP based on Urgency or explicit input
    source_ip = request_in.source_ip or QoSEngine.resolve_source_ip(request_in.urgency)

    # Perform Layer 3 DiffServ Edge Classification and Security Validation
    qos_meta = QoSEngine.classify_and_mark(
        urgency=request_in.urgency,
        source_ip=source_ip,
        user_role=current_user.role,
        db=db,
        request_id=req_id
    )

    # Calculate initial baseline estimation
    img_size = request_in.image_size_mb or 250.0
    est_sec = round((img_size * 8.0) / (85.0 if qos_meta["dscp_value"] == 46 else 40.0), 2)

    mri_request = MRIRequest(
        request_id=req_id,
        patient_id=patient.id,
        mri_type=request_in.mri_type,
        clinical_reason=request_in.clinical_reason,
        urgency=qos_meta["urgency"],
        source_ip=qos_meta["source_ip"],
        dest_ip=qos_meta["dest_ip"],
        dscp_value=qos_meta["dscp_value"],
        dscp_name=qos_meta["dscp_name"],
        dscp_binary=qos_meta["dscp_binary"],
        ip_precedence=qos_meta["ip_precedence"],
        queue_assigned=qos_meta["queue_assigned"],
        image_size_mb=img_size,
        status="QUEUED",
        estimated_transfer_sec=est_sec,
        actual_transfer_sec=0.0,
        latency_ms=0.0,
        packet_loss_pct=0.0,
        throughput_mbps=0.0,
        created_by_user_id=current_user.id,
        created_at=datetime.utcnow()
    )
    db.add(mri_request)
    db.commit()
    db.refresh(mri_request)

    # Security & Clinical Audit
    audit = AuditLog(
        user_id=current_user.id,
        username=current_user.username,
        action="MRI_ORDER_SUBMITTED",
        ip_address=source_ip,
        details=f"Ordered {mri_request.mri_type} for patient {patient.name} ({patient.patient_id}). Urgency: {mri_request.urgency}, DSCP: {mri_request.dscp_name} ({mri_request.dscp_value}), Queue: {mri_request.queue_assigned}.",
        status="SUCCESS"
    )
    db.add(audit)
    db.commit()

    return mri_request

@router.get("/queue", response_model=list[MRIRequestResponse])
def get_mri_queue(db: Session = Depends(get_db)):
    """
    Returns MRI requests sorted by Priority Queue rules:
    1. EMERGENCY (DSCP 46 / EF)
    2. URGENT (DSCP 34 / AF41)
    3. NORMAL (DSCP 0 / CS0)
    Followed by creation timestamp.
    """
    urgency_order = case(
        (MRIRequest.urgency == 'EMERGENCY', 1),
        (MRIRequest.urgency == 'URGENT', 2),
        (MRIRequest.urgency == 'NORMAL', 3),
        else_=4
    )
    return db.query(MRIRequest).order_by(urgency_order, MRIRequest.created_at.desc()).all()

@router.get("/{request_id}", response_model=MRIRequestResponse)
def get_mri_request(request_id: str, db: Session = Depends(get_db)):
    req = db.query(MRIRequest).filter((MRIRequest.request_id == request_id) | (MRIRequest.id == request_id)).first()
    if not req:
        raise HTTPException(status_code=404, detail="MRI request not found")
    return req

@router.post("/{request_id}/transmit")
def transmit_mri_study(
    request_id: str,
    body: TransmitStudyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    req = db.query(MRIRequest).filter((MRIRequest.request_id == request_id) | (MRIRequest.id == request_id)).first()
    if not req:
        raise HTTPException(status_code=404, detail="MRI request not found")

    result = NetworkSimulator.execute_study_transfer(
        mri_request=req,
        background_traffic_mbps=body.background_traffic_mbps,
        enable_qos=body.enable_qos,
        db=db
    )
    return result

@router.post("/{request_id}/priority", response_model=MRIRequestResponse)
def update_mri_priority(
    request_id: str,
    urgency: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    req = db.query(MRIRequest).filter((MRIRequest.request_id == request_id) | (MRIRequest.id == request_id)).first()
    if not req:
        raise HTTPException(status_code=404, detail="MRI request not found")

    # Re-run classification
    qos_meta = QoSEngine.classify_and_mark(
        urgency=urgency,
        source_ip=req.source_ip,
        user_role=current_user.role,
        db=db,
        request_id=req.request_id
    )

    req.urgency = qos_meta["urgency"]
    req.dscp_value = qos_meta["dscp_value"]
    req.dscp_name = qos_meta["dscp_name"]
    req.dscp_binary = qos_meta["dscp_binary"]
    req.ip_precedence = qos_meta["ip_precedence"]
    req.queue_assigned = qos_meta["queue_assigned"]

    db.commit()
    db.refresh(req)
    return req
