from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, AuditLog
from ..schemas import (
    UserLogin, 
    TokenResponse, 
    UserResponse, 
    ChangePasswordRequest, 
    ChangePasswordResponse
)
from ..auth import (
    verify_password, 
    hash_password, 
    create_access_token, 
    get_current_user,
    get_current_user_for_password_change,
    oauth2_scheme
)

router = APIRouter(prefix="/auth", tags=["Authentication & Access Control"])

@router.post("/login", response_model=TokenResponse)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """
    User Login with Temporary Password Check & RBAC Access Control.
    If requires_password_change is True:
    Returns HTTP 403 Forbidden with a temporary token restricted strictly to password reset.
    """
    user = db.query(User).filter(User.username == login_data.username).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        # Record security audit log with strict UTC timestamp
        audit = AuditLog(
            username=login_data.username,
            action="LOGIN_FAILED",
            ip_address="192.168.10.10",
            details="Invalid username or password attempt.",
            status="DENIED",
            timestamp=datetime.now(timezone.utc)
        )
        db.add(audit)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Inactive user account")

    # TASK 1: Check if user requires initial password change
    if user.requires_password_change:
        # Generate temporary token restricted strictly to password change (15-min TTL)
        temp_token = create_access_token(
            data={"sub": user.username, "role": user.role, "scope": "password_change_only"},
            expires_delta=timedelta(minutes=15)
        )
        
        audit = AuditLog(
            user_id=user.id,
            username=user.username,
            action="LOGIN_PASSWORD_CHANGE_REQUIRED",
            ip_address="192.168.10.10" if user.role in ["DOCTOR", "ADMIN"] else "192.168.20.10",
            details="User authenticated with temporary password. Password change is strictly required before accessing system.",
            status="WARNING",
            timestamp=datetime.now(timezone.utc)
        )
        db.add(audit)
        db.commit()

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "Password change required",
                "message": "Temporary password detected. You must change your password before full clinical system access is granted.",
                "requires_password_change": True,
                "temporary_token": temp_token,
                "token_type": "bearer"
            }
        )
    
    # Audit successful standard login
    audit = AuditLog(
        user_id=user.id,
        username=user.username,
        action="LOGIN_SUCCESS",
        ip_address="192.168.10.10" if user.role in ["DOCTOR", "ADMIN"] else "192.168.20.10",
        details=f"User authenticated with role: {user.role} in department: {user.department}",
        status="SUCCESS",
        timestamp=datetime.now(timezone.utc)
    )
    db.add(audit)
    db.commit()

    access_token = create_access_token(data={"sub": user.username, "role": user.role, "scope": "full_access"})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "requires_password_change": False,
        "user": user
    }

@router.post("/change-password", response_model=ChangePasswordResponse)
def change_password(
    data: ChangePasswordRequest,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """
    Change Password Endpoint:
    Accepts old password, validates it, hashes the new password with bcrypt,
    and sets requires_password_change = False.
    Accepts both standard tokens and temporary 'password_change_only' tokens.
    """
    user = get_current_user_for_password_change(token, db)
    
    # Fallback to username lookup if token subject not extracted
    if not user and data.username:
        user = db.query(User).filter(User.username == data.username).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unable to identify user session. Please log in or provide valid credentials."
        )

    # Verify old password
    if not verify_password(data.old_password, user.hashed_password):
        audit = AuditLog(
            user_id=user.id,
            username=user.username,
            action="PASSWORD_CHANGE_FAILED",
            ip_address="192.168.10.10",
            details="Failed password change attempt: Incorrect current password.",
            status="DENIED",
            timestamp=datetime.now(timezone.utc)
        )
        db.add(audit)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )

    if data.new_password == data.old_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from the temporary/old password."
        )

    # Hash new password with bcrypt
    user.hashed_password = hash_password(data.new_password)
    user.requires_password_change = False
    db.commit()
    db.refresh(user)

    # Audit password change event with strict UTC timestamp
    audit = AuditLog(
        user_id=user.id,
        username=user.username,
        action="PASSWORD_CHANGED_SUCCESS",
        ip_address="192.168.10.10",
        details=f"User {user.username} successfully updated their password and cleared required_password_change flag.",
        status="SUCCESS",
        timestamp=datetime.now(timezone.utc)
    )
    db.add(audit)
    db.commit()

    # Issue a fresh, unrestricted access token
    new_access_token = create_access_token(
        data={"sub": user.username, "role": user.role, "scope": "full_access"}
    )

    return {
        "status": "success",
        "message": "Password updated successfully. Full clinical access granted.",
        "access_token": new_access_token,
        "token_type": "bearer",
        "requires_password_change": False,
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/users", response_model=list[UserResponse])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).all()
