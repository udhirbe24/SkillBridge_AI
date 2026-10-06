from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.user import User, StudentProfile, AuditLog
from app.models.resume import ResumeDocument
from app.models.skills import SkillGapAnalysis
from app.models.roadmap import CareerRoadmap, RoadmapItem
from app.models.assessment import AssessmentSubmission
from app.models.interview import InterviewSession

def compute_career_readiness(db: Session, user: User) -> Dict[str, Any]:
    """
    Aggregates metrics from Resumes, Skill Gap, Coding Assessments, and Mock Interviews to compute composite career readiness score.
    """
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    target_role = profile.target_role if profile and profile.target_role else "Unassigned"
    acquired_skills_count = len(profile.skills) if profile and profile.skills else 0

    # 1. Skill Gap Score (35% weight)
    last_gap = db.query(SkillGapAnalysis)\
        .filter(SkillGapAnalysis.user_id == user.id)\
        .order_by(SkillGapAnalysis.created_at.desc())\
        .first()
    skill_gap_score = last_gap.readiness_score if last_gap else (profile.readiness_score if profile else 0.0)

    # 2. Resume Quality Score (20% weight)
    latest_resume = db.query(ResumeDocument)\
        .filter(ResumeDocument.user_id == user.id)\
        .order_by(ResumeDocument.created_at.desc())\
        .first()
    resume_score = 75.0 if latest_resume else 0.0

    # 3. Assessment Coding Score (25% weight)
    submissions = db.query(AssessmentSubmission).filter(AssessmentSubmission.user_id == user.id).all()
    if submissions:
        assessment_score = round(sum(s.score for s in submissions) / len(submissions), 1)
    else:
        assessment_score = 0.0

    # 4. Mock Interview Score (20% weight)
    interviews = db.query(InterviewSession).filter(
        InterviewSession.user_id == user.id,
        InterviewSession.status == "completed"
    ).all()
    if interviews:
        interview_score = round(sum(i.overall_score for i in interviews) / len(interviews), 1)
    else:
        interview_score = 0.0

    # Weighted Composite Calculation
    composite_score = round(
        (skill_gap_score * 0.35) +
        (resume_score * 0.20) +
        (assessment_score * 0.25) +
        (interview_score * 0.20),
        1
    )

    # Roadmap Completion Rate
    roadmap = db.query(CareerRoadmap).filter(CareerRoadmap.user_id == user.id).order_by(CareerRoadmap.created_at.desc()).first()
    if roadmap and roadmap.items:
        completed_items = sum(1 for item in roadmap.items if item.status == "completed")
        completion_rate = round((completed_items / len(roadmap.items)) * 100, 1)
    else:
        completion_rate = 0.0

    # Determine Smart Next Action
    if resume_score == 0.0:
        next_action = {
            "title": "Upload your Resume for ATS Analysis",
            "category": "resume",
            "description": "Upload your PDF/DOCX resume to extract skills and evaluate ATS keyword optimization.",
            "action_url": "/resumes/upload"
        }
    elif skill_gap_score < 60.0:
        next_action = {
            "title": "Run Target Role Skill Gap Analysis",
            "category": "skills",
            "description": f"Identify missing required skills for {target_role} and generate a learning curriculum.",
            "action_url": "/skills/gap-analysis"
        }
    elif completion_rate < 50.0 and roadmap:
        next_action = {
            "title": "Continue Career Roadmap Module",
            "category": "roadmap",
            "description": "Complete your pending roadmap learning items to boost target role readiness.",
            "action_url": f"/roadmaps/{roadmap.id}"
        }
    elif assessment_score < 70.0:
        next_action = {
            "title": "Complete a Coding Assessment",
            "category": "assessment",
            "description": "Attempt algorithmic and backend coding assessments to validate technical proficiency.",
            "action_url": "/assessments"
        }
    elif interview_score < 75.0:
        next_action = {
            "title": "Practice AI Mock Interview",
            "category": "interview",
            "description": "Start an AI mock interview session to refine technical depth and STAR behavioral responses.",
            "action_url": "/interviews/start"
        }
    else:
        next_action = {
            "title": "Explore Job & Internship Recommendations",
            "category": "jobs",
            "description": "Your readiness score is high! Review top matched job postings and submit applications.",
            "action_url": "/jobs/recommendations"
        }

    # Recent Audit Log Activity
    recent_logs = db.query(AuditLog)\
        .filter(AuditLog.user_id == user.id)\
        .order_by(AuditLog.timestamp.desc())\
        .limit(5)\
        .all()

    recent_activity = [
        {
            "id": log.id,
            "type": log.action,
            "description": f"Performed {log.action.replace('_', ' ').title()} on {log.resource or 'platform'}",
            "timestamp": log.timestamp.isoformat()
        }
        for log in recent_logs
    ]


    return {
        "user_id": user.id,
        "full_name": user.full_name,
        "target_role": target_role,
        "career_readiness_score": composite_score,
        "breakdown": {
            "resume_score": resume_score,
            "skill_gap_score": skill_gap_score,
            "assessment_score": assessment_score,
            "interview_score": interview_score
        },
        "acquired_skills_count": acquired_skills_count,
        "roadmap_completion_rate": completion_rate,
        "next_action": next_action,
        "recent_activity": recent_activity
    }
