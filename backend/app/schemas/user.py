from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime
from app.models.user import UserRole

# Student Profile Schemas
class StudentProfileBase(BaseModel):
    headline: Optional[str] = "Aspiring Software Engineer"
    target_role: Optional[str] = "Fullstack Developer"
    bio: Optional[str] = None
    skills: List[str] = []

class StudentProfileCreate(StudentProfileBase):
    pass

class StudentProfileUpdate(BaseModel):
    headline: Optional[str] = None
    target_role: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[List[str]] = None

class StudentProfileResponse(StudentProfileBase):
    id: str
    user_id: str
    readiness_score: float
    resume_url: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Recruiter Profile Schemas
class RecruiterProfileBase(BaseModel):
    company_name: str
    company_website: Optional[str] = None
    industry: Optional[str] = None

class RecruiterProfileCreate(RecruiterProfileBase):
    pass

class RecruiterProfileResponse(RecruiterProfileBase):
    id: str
    user_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    role: UserRole = UserRole.STUDENT
    # Optional nested details based on role
    student_profile: Optional[StudentProfileCreate] = None
    recruiter_profile: Optional[RecruiterProfileCreate] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None

class UserResponse(UserBase):
    id: str
    role: UserRole
    is_active: bool
    is_verified: bool
    created_at: datetime
    student_profile: Optional[StudentProfileResponse] = None
    recruiter_profile: Optional[RecruiterProfileResponse] = None

    model_config = ConfigDict(from_attributes=True)

