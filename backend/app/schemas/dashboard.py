from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ReadinessBreakdown(BaseModel):
    resume_score: float = Field(0.0, description="Resume quality score (20% weight)")
    skill_gap_score: float = Field(0.0, description="Target role skill gap alignment (35% weight)")
    assessment_score: float = Field(0.0, description="Coding assessment score (25% weight)")
    interview_score: float = Field(0.0, description="AI Mock interview score (20% weight)")

class NextActionRecommendation(BaseModel):
    title: str
    category: str  # resume, skills, roadmap, assessment, interview
    description: str
    action_url: str

class RecentActivityItem(BaseModel):
    id: str
    type: str  # RESUME_UPLOAD, SKILL_GAP_ANALYSIS, ROADMAP_GENERATED, ASSESSMENT_SUBMITTED, INTERVIEW_COMPLETED
    description: str
    timestamp: str

class DashboardSummaryResponse(BaseModel):
    user_id: str
    full_name: str
    target_role: str
    career_readiness_score: float
    breakdown: ReadinessBreakdown
    acquired_skills_count: int
    roadmap_completion_rate: float
    next_action: NextActionRecommendation
    recent_activity: List[RecentActivityItem]
