from pydantic import BaseModel, Field
from typing import List, Optional

class JobCreateRequest(BaseModel):
    title: str = Field(..., examples=["Backend Engineer"])
    company_name: str = Field(..., examples=["TechCorp Innovations"])
    company_logo: Optional[str] = Field(None, examples=["https://techcorp.com/logo.png"])
    location: str = Field("Remote", examples=["Remote"])
    job_type: str = Field("full_time", examples=["full_time"])  # full_time, internship, contract
    experience_level: str = Field("entry", examples=["entry"]) # entry, mid, senior
    required_skills: List[str] = Field(..., examples=[["Python", "FastAPI", "PostgreSQL"]])
    optional_skills: Optional[List[str]] = Field([], examples=[["Docker", "Redis"]])
    description: str = Field(..., examples=["Looking for a backend engineer to scale our FastAPI microservices."])
    salary_range: Optional[str] = Field(None, examples=["$90,000 - $120,000"])

class JobUpdateRequest(BaseModel):
    title: Optional[str] = None
    company_name: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    experience_level: Optional[str] = None
    required_skills: Optional[List[str]] = None
    optional_skills: Optional[List[str]] = None
    description: Optional[str] = None
    salary_range: Optional[str] = None
    is_active: Optional[bool] = None

class JobResponse(BaseModel):
    id: str
    recruiter_id: Optional[str] = None
    title: str
    company_name: str
    company_logo: Optional[str] = None
    location: str
    job_type: str
    experience_level: str
    required_skills: List[str]
    optional_skills: List[str]
    description: str
    salary_range: Optional[str] = None
    is_active: bool
    created_at: str

class JobMatchExplanation(BaseModel):
    matching_skills: List[str]
    missing_required_skills: List[str]
    missing_optional_skills: List[str]
    explanation: str

class JobRecommendationResponse(BaseModel):
    job: JobResponse
    match_score: float
    explanation: JobMatchExplanation
