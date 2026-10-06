from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User, AuditLog, UserRole
from app.models.resume import ResumeDocument
from app.models.assessment import AssessmentSubmission
from app.models.interview import InterviewSession
from app.models.job import JobPosting
from app.schemas.user import UserResponse
from app.schemas.admin import UserStatusUpdateRequest, AuditLogResponse, SystemStatsResponse
from app.api.deps import RoleChecker

router = APIRouter(prefix="/admin", tags=["Admin Control Panel"])

@router.get("/users", response_model=List[UserResponse])
def list_all_users(
    role: Optional[str] = Query(None, description="Filter by UserRole (STUDENT, RECRUITER, ADMIN)"),
    current_user: User = Depends(RoleChecker([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """
    Admin endpoint: Lists all registered platform users.
    """
    query = db.query(User)
    if role:
        query = query.filter(User.role == role.upper())
    return query.order_by(User.created_at.desc()).all()

@router.get("/users/{user_id}", response_model=UserResponse)
def get_user_by_id(
    user_id: str,
    current_user: User = Depends(RoleChecker([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """
    Admin endpoint: Gets detailed user profile by ID.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
    return user

@router.patch("/users/{user_id}", response_model=UserResponse)
def update_user_status(
    user_id: str,
    payload: UserStatusUpdateRequest,
    current_user: User = Depends(RoleChecker([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """
    Admin endpoint: Activates or deactivates a user account.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    user.is_active = payload.is_active
    db.commit()
    db.refresh(user)
    return user

@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(RoleChecker([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """
    Admin endpoint: Retrieves system-wide security audit logs.
    """
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return [
        AuditLogResponse(
            id=l.id,
            user_id=l.user_id,
            action=l.action,
            resource=l.resource,
            ip_address=l.ip_address,
            details=l.details,
            timestamp=l.timestamp.isoformat()
        )
        for l in logs
    ]

@router.get("/stats", response_model=SystemStatsResponse)
def get_system_stats(
    current_user: User = Depends(RoleChecker([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """
    Admin endpoint: Aggregates overall platform system operational metrics.
    """
    total_users = db.query(User).count()
    total_students = db.query(User).filter(User.role == UserRole.STUDENT).count()
    total_recruiters = db.query(User).filter(User.role == UserRole.RECRUITER).count()
    
    total_resumes = db.query(ResumeDocument).count()
    total_assessments = db.query(AssessmentSubmission).count()
    total_interviews = db.query(InterviewSession).filter(InterviewSession.status == "completed").count()
    total_active_jobs = db.query(JobPosting).filter(JobPosting.is_active == True).count()

    return SystemStatsResponse(
        total_users=total_users,
        total_students=total_students,
        total_recruiters=total_recruiters,
        total_resumes_parsed=total_resumes,
        total_assessments_completed=total_assessments,
        total_interviews_completed=total_interviews,
        total_active_jobs=total_active_jobs
    )
