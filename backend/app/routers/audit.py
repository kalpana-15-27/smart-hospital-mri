from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import AuditLog
from ..schemas import AuditLogResponse

router = APIRouter(prefix="/audit", tags=["Security & Compliance Audit Trail"])

@router.get("/logs", response_model=List[AuditLogResponse])
def get_audit_logs(limit: int = Query(100, ge=1, le=500), db: Session = Depends(get_db)):
    return db.query(AuditLog).order_by(AuditLog.id.desc()).limit(limit).all()
