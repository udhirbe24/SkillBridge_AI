from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db
from app.core.config import settings
from datetime import datetime, timezone

router = APIRouter(prefix="/health", tags=["Health & System Status"])

@router.get("", summary="Get system health status")
def check_health(db: Session = Depends(get_db)):
    """
    Checks operational status of API gateway and relational database connectivity.
    """
    db_status = "healthy"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "services": {
            "database": db_status,
            "api_gateway": "healthy"
        }
    }

