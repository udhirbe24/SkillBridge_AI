from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User, StudentProfile, UserRole
from app.models.job import JobPosting
from app.schemas.job import (
    JobCreateRequest,
    JobUpdateRequest,
    JobResponse,
    JobRecommendationResponse,
    JobMatchExplanation
)
from app.services.job_engine import seed_default_jobs_if_empty, calculate_job_match
from app.api.v1.auth import get_current_active_user
from app.api.deps import RoleChecker

router = APIRouter(prefix="/jobs", tags=["Jobs & Internship Recommendations"])

def serialize_job(job: JobPosting) -> JobResponse:
    return JobResponse(
        id=job.id,
        recruiter_id=job.recruiter_id,
        title=job.title,
        company_name=job.company_name,
        company_logo=job.company_logo,
        location=job.location,
        job_type=job.job_type,
        experience_level=job.experience_level,
        required_skills=job.required_skills or [],
        optional_skills=job.optional_skills or [],
        description=job.description,
        salary_range=job.salary_range,
        is_active=job.is_active,
        created_at=job.created_at.isoformat()
    )

@router.get("", response_model=List[JobResponse])
def list_jobs(
    search: Optional[str] = Query(None, description="Search by title or company"),
    location: Optional[str] = Query(None, description="Filter by location"),
    job_type: Optional[str] = Query(None, description="Filter by job type (full_time, internship, contract)"),
    experience_level: Optional[str] = Query(None, description="Filter by experience level (entry, mid, senior)"),
    db: Session = Depends(get_db)
):
    """
    Lists active job postings with optional query filtering.
    """
    seed_default_jobs_if_empty(db)
    query = db.query(JobPosting).filter(JobPosting.is_active == True)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter((JobPosting.title.ilike(search_pattern)) | (JobPosting.company_name.ilike(search_pattern)))
    if location:
        query = query.filter(JobPosting.location.ilike(f"%{location}%"))
    if job_type:
        query = query.filter(JobPosting.job_type.ilike(job_type))
    if experience_level:
        query = query.filter(JobPosting.experience_level.ilike(experience_level))

    jobs = query.order_by(JobPosting.created_at.desc()).all()
    return [serialize_job(j) for j in jobs]

@router.get("/recommendations", response_model=List[JobRecommendationResponse])
def get_job_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Computes personalized job recommendations ranked by match score for logged in candidate.
    """
    seed_default_jobs_if_empty(db)
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    user_skills = profile.skills if profile and profile.skills else []

    jobs = db.query(JobPosting).filter(JobPosting.is_active == True).all()

    recommendations = []
    for job in jobs:
        match_res = calculate_job_match(
            user_skills=user_skills,
            required_skills=job.required_skills or [],
            optional_skills=job.optional_skills or []
        )
        recommendations.append(
            JobRecommendationResponse(
                job=serialize_job(job),
                match_score=match_res["match_score"],
                explanation=JobMatchExplanation(**match_res["explanation"])
            )
        )

    # Sort by highest match score
    recommendations.sort(key=lambda x: x.match_score, reverse=True)
    return recommendations

@router.get("/{job_id}", response_model=JobResponse)
def get_job_detail(
    job_id: str,
    db: Session = Depends(get_db)
):
    """
    Retrieves detailed view for a specific job posting.
    """
    seed_default_jobs_if_empty(db)
    job = db.query(JobPosting).filter(JobPosting.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job posting not found"
        )
    return serialize_job(job)

@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    payload: JobCreateRequest,
    current_user: User = Depends(RoleChecker([UserRole.RECRUITER, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """
    Recruiter & Admin endpoint: Creates a new job posting.
    """
    job = JobPosting(
        recruiter_id=current_user.id,
        title=payload.title,
        company_name=payload.company_name,
        company_logo=payload.company_logo,
        location=payload.location,
        job_type=payload.job_type,
        experience_level=payload.experience_level,
        required_skills=payload.required_skills,
        optional_skills=payload.optional_skills or [],
        description=payload.description,
        salary_range=payload.salary_range,
        is_active=True
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return serialize_job(job)

@router.put("/{job_id}", response_model=JobResponse)
def update_job(
    job_id: str,
    payload: JobUpdateRequest,
    current_user: User = Depends(RoleChecker([UserRole.RECRUITER, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """
    Recruiter & Admin endpoint: Updates an existing job posting.
    """
    job = db.query(JobPosting).filter(JobPosting.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job posting not found"
        )

    # Allow update if user is admin or job owner
    if current_user.role != UserRole.ADMIN and job.recruiter_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied. You can only update your own job postings."
        )

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(job, field, value)

    db.commit()
    db.refresh(job)
    return serialize_job(job)

@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(
    job_id: str,
    current_user: User = Depends(RoleChecker([UserRole.RECRUITER, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """
    Recruiter & Admin endpoint: Deletes a job posting.
    """
    job = db.query(JobPosting).filter(JobPosting.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job posting not found"
        )

    if current_user.role != UserRole.ADMIN and job.recruiter_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied. You can only delete your own job postings."
        )

    db.delete(job)
    db.commit()
    return None
