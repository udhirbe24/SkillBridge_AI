from pydantic import BaseModel, Field
from typing import List, Optional

class InterviewStartRequest(BaseModel):
    target_role: str = Field(..., examples=["Backend Engineer"])
    difficulty: str = Field("mid", examples=["mid"])
    total_questions: Optional[int] = Field(3, ge=1, le=10)

class InterviewExchangeResponse(BaseModel):
    id: str
    question_number: int
    category: str
    question_text: str
    user_response: Optional[str] = None
    score: Optional[float] = None
    feedback: Optional[str] = None
    key_improvements: Optional[List[str]] = None

class InterviewSessionResponse(BaseModel):
    id: str
    user_id: str
    target_role: str
    difficulty: str
    status: str # in_progress, completed
    total_questions: int
    current_question_number: int
    overall_score: Optional[float] = 0.0
    summary_feedback: Optional[str] = None
    created_at: str
    completed_at: Optional[str] = None
    exchanges: List[InterviewExchangeResponse]

class InterviewRespondRequest(BaseModel):
    response_text: str = Field(..., examples=["I design APIs using FastAPI with async handlers and Pydantic schemas..."])

class InterviewRespondResponse(BaseModel):
    current_exchange: InterviewExchangeResponse
    is_completed: bool
    next_question: Optional[InterviewExchangeResponse] = None
    overall_score: Optional[float] = None
    summary_feedback: Optional[str] = None

class InterviewAnalyticsResponse(BaseModel):
    total_interviews: int
    completed_interviews: int
    average_score: float
    best_performing_category: str
    recommended_focus_area: str
