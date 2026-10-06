from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.roadmap import CareerRoadmap, RoadmapItem
from app.schemas.roadmap import (
    RoadmapGenerateRequest,
    RoadmapResponse,
    RoadmapItemResponse,
    RoadmapItemUpdate
)
from app.services.roadmap import generate_user_roadmap
from app.api.v1.auth import get_current_active_user

router = APIRouter(prefix="/roadmaps", tags=["Career Roadmaps"])

def serialize_roadmap(roadmap: CareerRoadmap) -> RoadmapResponse:
    # Sort items by item_order
    sorted_items = sorted(roadmap.items, key=lambda x: x.item_order)
    return RoadmapResponse(
        id=roadmap.id,
        user_id=roadmap.user_id,
        target_role=roadmap.target_role,
        overall_readiness=roadmap.overall_readiness,
        total_estimated_hours=roadmap.total_estimated_hours,
        created_at=roadmap.created_at.isoformat(),
        items=[
            RoadmapItemResponse(
                id=item.id,
                title=item.title,
                description=item.description,
                skill_name=item.skill_name,
                estimated_hours=item.estimated_hours,
                order=item.item_order,
                status=item.status,
                resource_url=item.resource_url
            )
            for item in sorted_items
        ]
    )

@router.post("/generate", response_model=RoadmapResponse, status_code=status.HTTP_201_CREATED)
def generate_roadmap(
    payload: RoadmapGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Generates an AI + RAG-driven personalized career roadmap for the logged in user.
    """
    roadmap = generate_user_roadmap(db, current_user.id, payload.target_role)
    return serialize_roadmap(roadmap)

@router.get("/", response_model=List[RoadmapResponse])
def list_roadmaps(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Retrieves all roadmaps generated for the logged in user.
    """
    roadmaps = db.query(CareerRoadmap).filter(CareerRoadmap.user_id == current_user.id).all()
    return [serialize_roadmap(r) for r in roadmaps]

@router.get("/{roadmap_id}", response_model=RoadmapResponse)
def get_roadmap(
    roadmap_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Retrieves details for a specific career roadmap.
    """
    roadmap = db.query(CareerRoadmap).filter(
        CareerRoadmap.id == roadmap_id,
        CareerRoadmap.user_id == current_user.id
    ).first()
    if not roadmap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Career roadmap not found"
        )
    return serialize_roadmap(roadmap)

@router.patch("/{roadmap_id}/items/{item_id}", response_model=RoadmapItemResponse)
def update_roadmap_item_status(
    roadmap_id: str,
    item_id: str,
    payload: RoadmapItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Updates progress status for a specific roadmap item.
    """
    roadmap = db.query(CareerRoadmap).filter(
        CareerRoadmap.id == roadmap_id,
        CareerRoadmap.user_id == current_user.id
    ).first()
    if not roadmap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Career roadmap not found"
        )

    item = db.query(RoadmapItem).filter(
        RoadmapItem.id == item_id,
        RoadmapItem.roadmap_id == roadmap_id
    ).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Roadmap item not found"
        )

    if payload.status not in ["pending", "in_progress", "completed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status. Must be one of: pending, in_progress, completed"
        )

    item.status = payload.status
    db.commit()
    db.refresh(item)

    return RoadmapItemResponse(
        id=item.id,
        title=item.title,
        description=item.description,
        skill_name=item.skill_name,
        estimated_hours=item.estimated_hours,
        order=item.item_order,
        status=item.status,
        resource_url=item.resource_url
    )
