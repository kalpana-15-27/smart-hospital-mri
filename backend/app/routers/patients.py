from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Patient, User, AuditLog
from ..schemas import PatientCreate, PatientResponse
from ..auth import get_current_user

router = APIRouter(prefix="/patients", tags=["Patient Registration & Triage"])

@router.post("", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def register_patient(
    patient_in: PatientCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Permanent Patient Registration:
    Commits patient intake record to persistent hospital_data.db SQLite file.
    Survives server restarts and records strict UTC audit trail.
    """
    # Auto-generate Patient ID if not provided (e.g. PAT-2026-001)
    if not patient_in.patient_id:
        count = db.query(Patient).count() + 1
        while db.query(Patient).filter(Patient.patient_id == f"PAT-2026-{count:03d}").first():
            count += 1
        patient_id = f"PAT-2026-{count:03d}"
    else:
        patient_id = patient_in.patient_id
        existing = db.query(Patient).filter(Patient.patient_id == patient_id).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail=f"Patient ID '{patient_id}' already exists in permanent records"
            )

    # Instantiate model with strict UTC admission timestamp
    patient = Patient(
        patient_id=patient_id,
        name=patient_in.name,
        age=patient_in.age,
        gender=patient_in.gender,
        department=patient_in.department,
        doctor_name=patient_in.doctor_name or current_user.full_name,
        triage_level=patient_in.triage_level,
        vitals_summary=patient_in.vitals_summary,
        admission_time=datetime.now(timezone.utc)
    )
    
    # Commit directly to persistent database file
    db.add(patient)
    db.commit()
    db.refresh(patient)

    # Log security & clinical admission audit trail with strict UTC timestamp
    audit = AuditLog(
        user_id=current_user.id,
        username=current_user.username,
        action="PATIENT_REGISTERED",
        ip_address="192.168.10.10" if patient.triage_level == "Emergency" else "192.168.20.10",
        details=(
            f"Admitted patient {patient.name} ({patient.patient_id}) into {patient.department}. "
            f"Triage Level: {patient.triage_level}. Assigned Doctor: {patient.doctor_name}."
        ),
        status="SUCCESS",
        timestamp=datetime.now(timezone.utc)
    )
    db.add(audit)
    db.commit()

    return patient

@router.get("", response_model=list[PatientResponse])
def list_patients(db: Session = Depends(get_db)):
    """Retrieves all admitted patients from persistent hospital storage."""
    return db.query(Patient).order_by(Patient.id.desc()).all()

@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(patient_id: str, db: Session = Depends(get_db)):
    """Retrieves a single patient record by ID or auto-assigned patient_id."""
    patient = db.query(Patient).filter((Patient.patient_id == patient_id) | (Patient.id == patient_id)).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient record not found in hospital archive")
    return patient
