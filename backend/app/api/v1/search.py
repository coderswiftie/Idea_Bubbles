from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.core.database import get_db
from app.models.models import Idea, IdeaNote, Tag, User
from app.schemas.schemas import IdeaListResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/search", tags=["Search"])

@router.get("", response_model=List[IdeaListResponse])
def search_all(
    q: str = Query(..., min_length=1, description="Search query across all fields"),
    category_id: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    search_term = f"%{q.strip()}%"

    # Query matching ideas directly or via notes/tags
    ideas = db.query(Idea).filter(
        Idea.user_id == current_user.id,
        Idea.is_archived == False,
        or_(
            Idea.title.ilike(search_term),
            Idea.raw_thought.ilike(search_term),
            Idea.ai_summary.ilike(search_term),
            Idea.notes.any(IdeaNote.content.ilike(search_term)),
            Idea.tags.any(Tag.name.ilike(search_term))
        )
    )

    if category_id:
        ideas = ideas.filter(Idea.category_id == category_id)

    if status:
        ideas = ideas.filter(Idea.status == status.upper())

    results = ideas.all()

    response_list = []
    for idea in results:
        res = IdeaListResponse.model_validate(idea)
        res.notes_count = len(idea.notes)
        res.tasks_count = len(idea.tasks)
        res.completed_tasks_count = sum(1 for t in idea.tasks if t.is_completed)
        response_list.append(res)

    return response_list
