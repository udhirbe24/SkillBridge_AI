from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User, StudentProfile, UserRole
from app.models.recruiter_shortlist import RecruiterShortlist
from app.schemas.user import UserResponse
from app.schemas.recruiter import ShortlistCreateRequest, ShortlistResponse
from app.api.v1.auth import get_current_active_user
from app.api.deps import RoleChecker

router = APIRouter(prefix="/recruiter", tags=["Recruiter Portal"])

@router.get("/candidates", response_model=List[UserResponse])
def search_candidates(
    target_role: Optional[str] = Query(None, description="Filter by target role"),
    min_readiness: Optional[float] = Query(None, description="Minimum career readiness score"),
    current_user: User = Depends(RoleChecker([UserRole.RECRUITER, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """
    Recruiter endpoint: Searches and filters student candidates based on target role or readiness threshold.
    """
    query = db.query(User).filter(User.role == UserRole.STUDENT, User.is_active == True)
    if target_role or min_readiness is not None:
        query = query.join(StudentProfile)
        if target_role:
            query = query.filter(StudentProfile.target_role.ilike(f"%{target_role}%"))
        if min_readiness is not None:
            query = query.filter(StudentProfile.readiness_score >= min_readiness)

    return query.all()

@router.get("/candidates/{candidate_id}", response_model=UserResponse)
def get_candidate_detail(
    candidate_id: str,
    current_user: User = Depends(RoleChecker([UserRole.RECRUITER, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """
    Recruiter endpoint: Retrieves full profile view for a specific student candidate.
    """
    candidate = db.query(User).filter(User.id == candidate_id, User.role == UserRole.STUDENT).first()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate student not found."
        )
    return candidate

@router.post("/shortlist", response_model=ShortlistResponse, status_code=status.HTTP_201_CREATED)
def shortlist_candidate(
    payload: ShortlistCreateRequest,
    current_user: User = Depends(RoleChecker([UserRole.RECRUITER, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """
    Recruiter endpoint: Adds a student candidate to recruiter shortlist.
    """
    candidate = db.query(User).filter(User.id == payload.student_id, User.role == UserRole.STUDENT).first()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate student not found."
        )

    # Check existing shortlist entry
    existing = db.query(RecruiterShortlist).filter(
        RecruiterShortlist.recruiter_id == current_user.id,
        RecruiterShortlist.student_id == payload.student_id
    ).first()

    if existing:
        existing.notes = payload.notes or existing.notes
        db.commit()
        db.refresh(existing)
        return ShortlistResponse(
            id=existing.id,
            recruiter_id=existing.recruiter_id,
            student=existing.student,
            notes=existing.notes,
            created_at=existing.created_at.isoformat()
        )

    entry = RecruiterShortlist(
        recruiter_id=current_user.id,
        student_id=payload.student_id,
        notes=payload.notes
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)

    return ShortlistResponse(
        id=entry.id,
        recruiter_id=entry.recruiter_id,
        student=entry.student,
        notes=entry.notes,
        created_at=entry.created_at.isoformat()
    )

@router.get("/shortlist", response_model=List[ShortlistResponse])
def get_recruiter_shortlist(
    current_user: User = Depends(RoleChecker([UserRole.RECRUITER, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """
    Recruiter endpoint: Retrieves all shortlisted candidates for the logged in recruiter.
    """
    entries = db.query(RecruiterShortlist).filter(RecruiterShortlist.recruiter_id == current_user.id).all()
    return [
        ShortlistResponse(
            id=e.id,
            recruiter_id=e.recruiter_id,
            student=e.student,
            notes=e.notes,
            created_at=e.created_at.isoformat()
        )
        for e in entries
    ]

@router.delete("/shortlist/{shortlist_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_shortlist(
    shortlist_id: str,
    current_user: User = Depends(RoleChecker([UserRole.RECRUITER, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """
    Recruiter endpoint: Removes a candidate entry from shortlist.
    """
    entry = db.query(RecruiterShortlist).filter(
        RecruiterShortlist.id == shortlist_id,
        RecruiterShortlist.recruiter_id == current_user.id
    ).first()

    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shortlist entry not found."
        )

    db.delete(entry)
    db.commit()
    return None
