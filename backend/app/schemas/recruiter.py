from pydantic import BaseModel, Field
from typing import List, Optional
from app.schemas.user import UserResponse

class ShortlistCreateRequest(BaseModel):
    student_id: str = Field(..., examples=["uuid-string"])
    notes: Optional[str] = Field(None, examples=["Strong candidate for backend systems."])

class ShortlistResponse(BaseModel):
    id: str
    recruiter_id: str
    student: UserResponse
    notes: Optional[str] = None
    created_at: str
