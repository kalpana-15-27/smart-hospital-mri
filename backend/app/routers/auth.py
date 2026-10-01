from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, AuditLog
from ..schemas import UserLogin, TokenResponse, UserResponse, UserCreate
from ..auth import verify_password, hash_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication & Access Control"])

@router.post("/login", response_model=TokenResponse)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == login_data.username).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        # Record security audit log
        audit = AuditLog(
            username=login_data.username,
            action="LOGIN_FAILED",
            ip_address="192.168.10.10",
            details="Invalid username or password attempt.",
            status="DENIED"
        )
        db.add(audit)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user account")
    
    # Audit successful login
    audit = AuditLog(
        user_id=user.id,
        username=user.username,
        action="LOGIN_SUCCESS",
        ip_address="192.168.10.10" if user.role in ["DOCTOR", "ADMIN"] else "192.168.20.10",
        details=f"User authenticated with role: {user.role} in department: {user.department}",
        status="SUCCESS"
    )
    db.add(audit)
    db.commit()

    access_token = create_access_token(data={"sub": user.username, "role": user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/users", response_model=list[UserResponse])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).all()
