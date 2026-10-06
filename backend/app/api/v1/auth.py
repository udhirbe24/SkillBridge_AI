from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token, decode_token
from app.core.config import settings
from app.models.user import User, StudentProfile, RecruiterProfile, RefreshToken, UserRole, AuditLog
from app.schemas.user import UserCreate, UserResponse
from app.schemas.auth import LoginRequest, TokenResponse, RefreshTokenRequest
from app.api.deps import get_current_active_user

router = APIRouter(prefix="/auth", tags=["Authentication & Access Control"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):

    """
    Registers a new user (Student or Recruiter) and automatically creates the associated profile.
    """
    # Check duplicate email
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    # Create User Entity
    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role,
        is_active=True,
        is_verified=False
    )
    db.add(user)
    db.flush() # Populate user.id

    # Attach Role Profile
    if user_in.role == UserRole.STUDENT:
        student_data = user_in.student_profile.model_dump() if user_in.student_profile else {}
        student_profile = StudentProfile(
            user_id=user.id,
            headline=student_data.get("headline", "Aspiring Software Engineer"),
            target_role=student_data.get("target_role", "Fullstack Developer"),
            bio=student_data.get("bio"),
            skills=student_data.get("skills", []),
            readiness_score=0.0
        )
        db.add(student_profile)

    elif user_in.role == UserRole.RECRUITER:
        recruiter_data = user_in.recruiter_profile.model_dump() if user_in.recruiter_profile else {}
        recruiter_profile = RecruiterProfile(
            user_id=user.id,
            company_name=recruiter_data.get("company_name", "SkillBridge Partner Company"),
            company_website=recruiter_data.get("company_website", "https://example.com"),
            industry=recruiter_data.get("industry", "Technology")
        )
        db.add(recruiter_profile)

    # Record Audit Log
    audit = AuditLog(
        user_id=user.id,
        action="USER_REGISTERED",
        resource=f"user:{user.id}",
        details={"role": user.role.value, "email": user.email}
    )
    db.add(audit)
    
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=TokenResponse)
def login(login_in: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticates user with email & password, issuing Access & Refresh JWT Tokens.
    """
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is deactivated."
        )

    # Generate JWT Tokens
    access_token = create_access_token(subject=user.id, role=user.role.value)
    refresh_token = create_refresh_token(subject=user.id)

    # Store Refresh Token in DB
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    db_refresh_token = RefreshToken(
        user_id=user.id,
        token=refresh_token,
        expires_at=expires_at,
        is_revoked=False
    )
    db.add(db_refresh_token)

    # Record Audit Log
    audit = AuditLog(
        user_id=user.id,
        action="USER_LOGIN_SUCCESS",
        resource=f"user:{user.id}"
    )
    db.add(audit)
    db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=user
    )

@router.post("/refresh")
def refresh_token(token_in: RefreshTokenRequest, db: Session = Depends(get_db)):
    """
    Exchanges valid Refresh Token for a fresh Access Token.
    """
    payload = decode_token(token_in.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )

    user_id = payload.get("sub")
    db_token = db.query(RefreshToken).filter(
        RefreshToken.token == token_in.refresh_token,
        RefreshToken.is_revoked == False
    ).first()

    if not db_token or db_token.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has been revoked or is invalid"
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account unavailable"
        )

    new_access_token = create_access_token(subject=user.id, role=user.role.value)
    return {
        "access_token": new_access_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_active_user)):
    """
    Returns currently authenticated user profile and nested role attributes.
    """
    return current_user
