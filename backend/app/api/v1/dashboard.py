from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.schemas.dashboard import DashboardSummaryResponse, ReadinessBreakdown, NextActionRecommendation
from app.services.dashboard import compute_career_readiness
from app.api.v1.auth import get_current_active_user

router = APIRouter(prefix="/dashboard", tags=["Analytics Dashboard & Career Readiness Engine"])

@router.get("", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Retrieves full career intelligence dashboard metrics, readiness score breakdown, and recommended next action.
    """
    data = compute_career_readiness(db, current_user)
    return DashboardSummaryResponse(**data)

@router.get("/readiness", response_model=ReadinessBreakdown)
def get_readiness_score_breakdown(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Retrieves detailed 4-pillar readiness breakdown (Resume, Skill Gap, Assessments, Mock Interviews).
    """
    data = compute_career_readiness(db, current_user)
    return ReadinessBreakdown(**data["breakdown"])

@router.get("/next-action", response_model=NextActionRecommendation)
def get_recommended_next_action(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Retrieves smart single highest-priority recommended next action.
    """
    data = compute_career_readiness(db, current_user)
    return NextActionRecommendation(**data["next_action"])
