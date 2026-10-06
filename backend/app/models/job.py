import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text, JSON, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class JobPosting(Base):
    __tablename__ = "job_postings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    recruiter_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    company_name = Column(String(255), nullable=False)
    company_logo = Column(String(500), nullable=True)
    location = Column(String(255), nullable=False, default="Remote")
    job_type = Column(String(50), nullable=False, default="full_time")  # full_time, internship, contract
    experience_level = Column(String(50), nullable=False, default="entry")  # entry, mid, senior
    required_skills = Column(JSON, default=list, nullable=False)
    optional_skills = Column(JSON, default=list, nullable=False)
    description = Column(Text, nullable=False)
    salary_range = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    recruiter = relationship("User", backref="job_postings")
