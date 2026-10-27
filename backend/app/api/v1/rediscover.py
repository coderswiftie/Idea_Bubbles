from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.core.database import get_db
from app.models.models import Idea, User
from app.schemas.schemas import RediscoverIdeaResponse, IdeaListResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/rediscover", tags=["Rediscover"])

@router.get("", response_model=List[RediscoverIdeaResponse])
def get_rediscover_ideas(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Intelligently surfaces dormant, forgotten, or quietly incubating ideas.
    Ranks ideas based on time elapsed since last interaction, notes count,
    and thematic potential, presenting gentle reasons for rediscovery.
    """
    now = datetime.now(timezone.utc)
    ideas = db.query(Idea).filter(
        Idea.user_id == current_user.id,
        Idea.is_archived == False
    ).order_by(desc(Idea.last_interacted_at)).all()

    if not ideas:
        return []

    recommendations = []

    for idea in ideas:
        # Calculate days dormant
        last_dt = idea.last_interacted_at or idea.created_at
        if last_dt.tzinfo is None:
            last_dt = last_dt.replace(tzinfo=timezone.utc)
        delta_days = (now - last_dt).days

        reason = ""
        action = "Revisit this spark and see if new inspiration has arrived."

        if idea.status == "SPARK" and delta_days >= 3:
            reason = f"Captured {delta_days} days ago as a fleeting spark and hasn't been developed yet."
            action = "Add a quick note or convert it into an experiment."
        elif idea.status in ("EXPLORING", "DEVELOPING") and len(idea.notes) > 0 and delta_days >= 2:
            reason = f"You started making progress with {len(idea.notes)} notes, but set it aside {delta_days} days ago."
            action = "Pick up where you left off or chat with the idea."
        elif len(idea.tasks) > 0 and any(not t.is_completed for t in idea.tasks):
            incomplete = sum(1 for t in idea.tasks if not t.is_completed)
            reason = f"Has {incomplete} pending milestone tasks waiting for your touch."
            action = "Check off a quick task or simplify the scope."
        elif idea.importance >= 4 and delta_days >= 1:
            reason = f"Marked with high importance ({idea.importance}/5). Is now the right time to nurture it?"
            action = "Review its references or brainstorm next steps."
        elif delta_days >= 5:
            reason = f"Quietly floating in your universe for {delta_days} days."
            action = "Give it a fresh look or let AI suggest possible directions."

        if reason:
            idea_resp = IdeaListResponse.model_validate(idea)
            idea_resp.notes_count = len(idea.notes)
            idea_resp.tasks_count = len(idea.tasks)
            idea_resp.completed_tasks_count = sum(1 for t in idea.tasks if t.is_completed)

            recommendations.append(
                RediscoverIdeaResponse(
                    idea=idea_resp,
                    reason=reason,
                    days_dormant=max(1, delta_days),
                    suggested_action=action
                )
            )

    # If all ideas are brand new (< 1 day old), surface the oldest 3
    if not recommendations and ideas:
        for idea in ideas[-3:]:
            idea_resp = IdeaListResponse.model_validate(idea)
            idea_resp.notes_count = len(idea.notes)
            idea_resp.tasks_count = len(idea.tasks)
            idea_resp.completed_tasks_count = sum(1 for t in idea.tasks if t.is_completed)
            recommendations.append(
                RediscoverIdeaResponse(
                    idea=idea_resp,
                    reason="A fresh thought in your cosmic constellation.",
                    days_dormant=0,
                    suggested_action="Explore this idea's potential or link it to other thoughts."
                )
            )

    # Return top 6 recommendations
    return recommendations[:6]
