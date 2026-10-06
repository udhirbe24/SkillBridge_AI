from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User, StudentProfile, AuditLog
from app.models.skills import RoleBenchmark, SkillGapAnalysis
from app.schemas.skills import RoleBenchmarkResponse, SkillGapRequest, SkillGapResponse, ReadinessSummaryResponse
from app.api.deps import get_current_active_user
from app.services.skill_engine import seed_role_benchmarks_if_empty, calculate_skill_gap

router = APIRouter(prefix="/skills", tags=["Skill Gap Engine & Readiness Score"])

@router.get("/benchmarks", response_model=List[RoleBenchmarkResponse])
def get_role_benchmarks(db: Session = Depends(get_db)):
    """
    Retrieves all available industry role benchmarks and required skills.
    Automatically seeds default benchmarks if table is empty.
    """
    seed_role_benchmarks_if_empty(db)
    benchmarks = db.query(RoleBenchmark).all()
    return benchmarks

@router.post("/gap-analysis", response_model=SkillGapResponse, status_code=status.HTTP_201_CREATED)
def run_skill_gap_analysis(
    request: SkillGapRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Runs Skill Gap Engine analyzing student's acquired skills against target role benchmarks.
    Persists analysis record and updates StudentProfile readiness score.
    """
    seed_role_benchmarks_if_empty(db)

    # Fetch benchmark for target role
    benchmark = db.query(RoleBenchmark).filter(
        RoleBenchmark.role_name.ilike(request.target_role)
    ).first()

    if not benchmark:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Target role benchmark '{request.target_role}' not found. Check /api/v1/skills/benchmarks for available roles."
        )

    # Fetch student's acquired skills
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    acquired_skills = profile.skills if profile and profile.skills else []

    # Compute skill gap & readiness score
    gap_result = calculate_skill_gap(
        user_skills=acquired_skills,
        required_skills=benchmark.required_skills,
        optional_skills=benchmark.optional_skills
    )

    # Save SkillGapAnalysis entity
    analysis = SkillGapAnalysis(
        user_id=current_user.id,
        target_role=benchmark.role_name,
        matching_skills=gap_result["matching_skills"],
        missing_required_skills=gap_result["missing_required_skills"],
        missing_optional_skills=gap_result["missing_optional_skills"],
        readiness_score=gap_result["readiness_score"],
        analysis_summary=gap_result["analysis_summary"]
    )
    db.add(analysis)

    # Update StudentProfile readiness score & target role
    if profile:
        profile.readiness_score = gap_result["readiness_score"]
        profile.target_role = benchmark.role_name

    # Audit Log
    audit = AuditLog(
        user_id=current_user.id,
        action="SKILL_GAP_ANALYZED",
        resource=f"target_role:{benchmark.role_name}",
        details={"readiness_score": gap_result["readiness_score"]}
    )
    db.add(audit)

    db.commit()
    db.refresh(analysis)
    return analysis

@router.get("/readiness", response_model=ReadinessSummaryResponse)
def get_readiness_score(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Returns current student's career readiness score and target role.
    """
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found."
        )

    last_analysis = db.query(SkillGapAnalysis)\
        .filter(SkillGapAnalysis.user_id == current_user.id)\
        .order_by(SkillGapAnalysis.created_at.desc())\
        .first()

    return ReadinessSummaryResponse(
        user_id=current_user.id,
        readiness_score=profile.readiness_score,
        target_role=profile.target_role or "Unassigned",
        acquired_skills=profile.skills or [],
        last_analyzed_at=last_analysis.created_at if last_analysis else None
    )
