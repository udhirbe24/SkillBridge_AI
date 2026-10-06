from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class RoleBenchmarkResponse(BaseModel):
    id: str
    role_name: str
    category: str
    required_skills: List[str]
    optional_skills: List[str]
    description: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class SkillGapRequest(BaseModel):
    target_role: str

class SkillGapResponse(BaseModel):
    id: str
    user_id: str
    target_role: str
    matching_skills: List[str]
    missing_required_skills: List[str]
    missing_optional_skills: List[str]
    readiness_score: float
    analysis_summary: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ReadinessSummaryResponse(BaseModel):
    user_id: str
    readiness_score: float
    target_role: str
    acquired_skills: List[str]
    last_analyzed_at: Optional[datetime] = None
