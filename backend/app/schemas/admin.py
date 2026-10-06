from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class UserStatusUpdateRequest(BaseModel):
    is_active: bool

class AuditLogResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    action: str
    resource: str
    ip_address: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    timestamp: str

class SystemStatsResponse(BaseModel):
    total_users: int
    total_students: int
    total_recruiters: int
    total_resumes_parsed: int
    total_assessments_completed: int
    total_interviews_completed: int
    total_active_jobs: int
