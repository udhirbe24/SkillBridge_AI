import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class RoleBenchmark(Base):
    __tablename__ = "role_benchmarks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    role_name = Column(String(255), unique=True, index=True, nullable=False)
    category = Column(String(100), nullable=False)
    required_skills = Column(JSON, default=list, nullable=False)
    optional_skills = Column(JSON, default=list, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

class SkillGapAnalysis(Base):
    __tablename__ = "skill_gap_analyses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    target_role = Column(String(255), nullable=False)
    matching_skills = Column(JSON, default=list, nullable=False)
    missing_required_skills = Column(JSON, default=list, nullable=False)
    missing_optional_skills = Column(JSON, default=list, nullable=False)
    readiness_score = Column(Float, nullable=False)
    analysis_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", backref="skill_gap_analyses")
