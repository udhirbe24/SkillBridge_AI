from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.roadmap import CareerRoadmap, RoadmapItem
from app.models.skills import SkillGapAnalysis
from app.services.skill_engine import perform_skill_gap_analysis
from app.services.vector_store import hybrid_rrf_search

def generate_user_roadmap(db: Session, user_id: str, target_role: str) -> CareerRoadmap:
    """
    Generates a personalized career roadmap by combining Skill Gap Analysis with RAG Vector Search curriculum retrieval.
    """
    # 1. Run Skill Gap Analysis
    gap_result = perform_skill_gap_analysis(db, user_id, target_role)
    
    missing_required = gap_result.get("missing_required_skills", [])
    missing_optional = gap_result.get("missing_optional_skills", [])
    readiness_score = gap_result.get("readiness_score", 0.0)

    # Combine missing skills prioritized by required first then optional
    skills_to_learn = missing_required + [s for s in missing_optional if s not in missing_required]

    if not skills_to_learn:
        skills_to_learn = ["Advanced Mastery & System Architecture", "Production Performance Tuning"]

    # 2. Build Roadmap DB Record
    roadmap = CareerRoadmap(
        user_id=user_id,
        target_role=target_role,
        overall_readiness=readiness_score,
        total_estimated_hours=0
    )
    db.add(roadmap)
    db.flush()

    total_hours = 0
    order_counter = 1

    # 3. For each missing skill, query RAG Vector Store to pull relevant curriculum learning modules
    for skill in skills_to_learn:
        search_results = hybrid_rrf_search(query=f"{target_role} {skill}", top_k=2)
        
        if search_results:
            top_resource = search_results[0]
            title = f"Master {skill}: {top_resource['title']}"
            description = top_resource['content']
            hours = 15
        else:
            title = f"Skill Acquisition: {skill}"
            description = f"Comprehensive training program focusing on core mechanics, practical exercises, and project implementation for {skill}."
            hours = 10

        item = RoadmapItem(
            roadmap_id=roadmap.id,
            title=title,
            description=description,
            skill_name=skill,
            estimated_hours=hours,
            item_order=order_counter,
            status="pending"
        )
        db.add(item)
        total_hours += hours
        order_counter += 1

    roadmap.total_estimated_hours = total_hours
    db.commit()
    db.refresh(roadmap)
    return roadmap
