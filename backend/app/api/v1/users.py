from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User, StudentProfile, RecruiterProfile, UserRole
from app.schemas.user import UserResponse, UserUpdate, StudentProfileUpdate, StudentProfileResponse
from app.api.deps import get_current_active_user, RoleChecker

router = APIRouter(prefix="/users", tags=["Users & Profiles"])

@router.put("/profile/student", response_model=StudentProfileResponse)
def update_student_profile(
    profile_in: StudentProfileUpdate,
    current_user: User = Depends(RoleChecker([UserRole.STUDENT])),
    db: Session = Depends(get_db)
):
    """
    Updates authenticated Student's profile (headline, target role, bio, skills).
    """
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        profile = StudentProfile(user_id=current_user.id)
        db.add(profile)

    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile

@router.get("/candidates", response_model=List[UserResponse])
def list_candidates(
    target_role: Optional[str] = None,
    min_readiness: Optional[float] = None,
    current_user: User = Depends(RoleChecker([UserRole.RECRUITER, UserRole.ADMIN, UserRole.EVALUATOR])),
    db: Session = Depends(get_db)
):
    """
    Recruiter & Admin endpoint: Lists candidate profiles filtered by role or readiness score.
    """
    query = db.query(User).filter(User.role == UserRole.STUDENT, User.is_active == True)
    
    if target_role:
        query = query.join(StudentProfile).filter(StudentProfile.target_role.ilike(f"%{target_role}%"))
    if min_readiness is not None:
        query = query.join(StudentProfile).filter(StudentProfile.readiness_score >= min_readiness)

    candidates = query.all()
    return candidates
