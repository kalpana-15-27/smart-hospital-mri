import random
from datetime import datetime
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
    # Auto-generate Patient ID if not provided
    if not patient_in.patient_id:
        count = db.query(Patient).count() + 1
        patient_id = f"PAT-2026-{count:03d}"
    else:
        patient_id = patient_in.patient_id
        existing = db.query(Patient).filter(Patient.patient_id == patient_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Patient ID already exists")

    patient = Patient(
        patient_id=patient_id,
        name=patient_in.name,
        age=patient_in.age,
        gender=patient_in.gender,
        department=patient_in.department,
        doctor_name=patient_in.doctor_name or current_user.full_name,
        triage_level=patient_in.triage_level,
        vitals_summary=patient_in.vitals_summary,
        admission_time=datetime.utcnow()
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)

    # Log audit
    audit = AuditLog(
        user_id=current_user.id,
        username=current_user.username,
        action="PATIENT_REGISTERED",
        ip_address="192.168.10.10" if patient.triage_level == "Emergency" else "192.168.20.10",
        details=f"Registered patient {patient.name} ({patient.patient_id}) under department {patient.department}.",
        status="SUCCESS"
    )
    db.add(audit)
    db.commit()

    return patient

@router.get("", response_model=list[PatientResponse])
def list_patients(db: Session = Depends(get_db)):
    return db.query(Patient).order_by(Patient.id.desc()).all()

@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(patient_id: str, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter((Patient.patient_id == patient_id) | (Patient.id == patient_id)).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient
