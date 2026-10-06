from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class TestCaseSchema(BaseModel):
    input: Any
    expected: Any

class AssessmentQuestionListItem(BaseModel):
    id: str
    title: str
    difficulty: str
    category: str
    skill_tag: str
    created_at: str

class AssessmentQuestionDetail(AssessmentQuestionListItem):
    description: str
    starter_code: str
    test_cases_count: int

class AssessmentSubmitRequest(BaseModel):
    code: str = Field(..., examples=["def solution(nums, target):\n    pass"])
    language: str = Field("python", examples=["python"])

class AssessmentSubmissionResponse(BaseModel):
    id: str
    question_id: str
    status: str  # passed, failed, error
    score: float
    passed_test_cases: int
    total_test_cases: int
    execution_time_ms: float
    output_logs: Optional[str] = None
    created_at: str

class AssessmentAnalyticsResponse(BaseModel):
    total_attempted: int
    total_passed: int
    pass_rate: float
    average_score: float
    breakdown_by_difficulty: Dict[str, int]
