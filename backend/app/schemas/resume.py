from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from app.models.resume import IngestionStatus

class ParsedResumeData(BaseModel):
    extracted_email: Optional[str] = None
    skills: List[str] = []
    skills_by_category: Dict[str, List[str]] = {}
    total_skills_count: int = 0
    experience_years: int = 1

class ResumeDocumentResponse(BaseModel):
    id: str
    user_id: str
    filename: str
    file_size: int
    mime_type: str
    status: IngestionStatus
    parsed_data: Dict[str, Any] = {}
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
