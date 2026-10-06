from pydantic import BaseModel, Field
from typing import List, Optional

class RoadmapItemBase(BaseModel):
    title: str
    description: str
    skill_name: str
    estimated_hours: int = 10
    order: int
    status: str = "pending" # pending, in_progress, completed
    resource_url: Optional[str] = None

class RoadmapItemResponse(RoadmapItemBase):
    id: str

class RoadmapGenerateRequest(BaseModel):
    target_role: str = Field(..., examples=["Backend Developer"])
    target_months: Optional[int] = Field(3, ge=1, le=12)

class RoadmapResponse(BaseModel):
    id: str
    user_id: str
    target_role: str
    overall_readiness: float
    total_estimated_hours: int
    created_at: str
    items: List[RoadmapItemResponse]

class RoadmapItemUpdate(BaseModel):
    status: str = Field(..., examples=["completed"])

