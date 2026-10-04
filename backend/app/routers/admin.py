from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, AuditLog, AccessRequest
from ..schemas import (
    AdminCreateDoctorRequest, 
    UserResponse,
    AccessRequestCreate,
    AccessRequestResponse,
    AccessRequestAction
)
from ..auth import hash_password, require_roles

router = APIRouter(prefix="/admin", tags=["Admin Governance & Doctor Provisioning"])

@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_doctor_account(
    doctor_in: AdminCreateDoctorRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_roles(["ADMIN"]))
):
    """
    Admin-Only Endpoint:
    Provisions a new Doctor account with an initial temporary password.
    Hashes the password securely with bcrypt and sets requires_password_change = True.
    """
    # Check if username is already registered
    existing_user = db.query(User).filter(User.username == doctor_in.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Username '{doctor_in.username}' is already registered in the hospital directory."
        )

    # Hash the temporary password with bcrypt
    hashed_temp_password = hash_password(doctor_in.password)

    # Create the new Doctor user
    new_doctor = User(
        username=doctor_in.username,
        hashed_password=hashed_temp_password,
        role="DOCTOR",
        full_name=doctor_in.full_name,
        department=doctor_in.department,
        is_active=True,
        requires_password_change=True,
        created_at=datetime.now(timezone.utc)
    )
    db.add(new_doctor)
    db.commit()
    db.refresh(new_doctor)

    # Record administrative audit trail with strict UTC timestamp
    audit = AuditLog(
        user_id=current_admin.id,
        username=current_admin.username,
        action="DOCTOR_ACCOUNT_PROVISIONED",
        ip_address="192.168.40.10",  # Admin subnet VLAN 40
        details=(
            f"Admin {current_admin.username} provisioned new Doctor account '{new_doctor.username}' "
            f"({new_doctor.full_name}, {new_doctor.department}). "
            f"Bcrypt hash generated; requires_password_change=True enforced."
        ),
        status="SUCCESS",
        timestamp=datetime.now(timezone.utc)
    )
    db.add(audit)
    db.commit()

    return new_doctor


@router.post("/access-requests", response_model=AccessRequestResponse, status_code=status.HTTP_201_CREATED)
def submit_access_request(
    request_in: AccessRequestCreate,
    db: Session = Depends(get_db)
):
    """
    Publicly Accessible:
    Prospective clinicians/doctors submit access requests to Hospital Administration.
    """
    new_req = AccessRequest(
        full_name=request_in.full_name,
        department=request_in.department,
        email=request_in.email,
        staff_id=request_in.staff_id,
        status="PENDING",
        created_at=datetime.now(timezone.utc)
    )
    db.add(new_req)
    db.commit()
    db.refresh(new_req)

    # Log submission to audit trail
    audit = AuditLog(
        username=request_in.full_name,
        action="ACCESS_REQUEST_SUBMITTED",
        ip_address="192.168.20.50",
        details=f"Access request submitted by {request_in.full_name} ({request_in.department}, Staff ID: {request_in.staff_id})",
        status="WARNING",
        timestamp=datetime.now(timezone.utc)
    )
    db.add(audit)
    db.commit()

    return new_req


@router.get("/access-requests", response_model=list[AccessRequestResponse])
def get_access_requests(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_roles(["ADMIN"]))
):
    """
    Admin-Only Endpoint:
    Retrieve all clinical credential access requests.
    """
    return db.query(AccessRequest).order_by(AccessRequest.created_at.desc()).all()


@router.post("/access-requests/{request_id}/action", response_model=AccessRequestResponse)
def review_access_request(
    request_id: int,
    action_in: AccessRequestAction,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_roles(["ADMIN"]))
):
    """
    Admin-Only Endpoint:
    Accept or Reject a pending clinical access request.
    """
    req = db.query(AccessRequest).filter(AccessRequest.id == request_id).first()
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Access request #{request_id} not found."
        )

    req.status = "APPROVED" if action_in.action.upper() == "APPROVE" else "REJECTED"
    req.reviewed_at = datetime.now(timezone.utc)
    req.reviewed_by = current_admin.username
    req.notes = action_in.notes or ("Approved for clinical onboarding" if req.status == "APPROVED" else "Request declined by administration")

    # Record administrative audit entry
    audit = AuditLog(
        user_id=current_admin.id,
        username=current_admin.username,
        action=f"ACCESS_REQUEST_{req.status}",
        ip_address="192.168.40.10",
        details=f"Admin {current_admin.username} marked access request #{req.id} for {req.full_name} as {req.status}. Notes: {req.notes}",
        status="SUCCESS" if req.status == "APPROVED" else "ALERT",
        timestamp=datetime.now(timezone.utc)
    )
    db.add(audit)
    db.commit()
    db.refresh(req)

    return req
