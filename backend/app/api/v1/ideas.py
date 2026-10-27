import random
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc

from app.core.database import get_db, SessionLocal
from app.models.models import Idea, Category, Tag, User, IdeaNote, IdeaTask, Reference, Attachment
from app.schemas.schemas import (
    IdeaCreate, IdeaUpdate, IdeaListResponse, IdeaDetailResponse, CategoryResponse
)
from app.api.deps import get_current_user
from app.services.ai_service import ai_service

router = APIRouter(prefix="/ideas", tags=["Ideas"])

def get_or_create_tag(db: Session, user_id: str, tag_name: str) -> Tag:
    cleaned = tag_name.strip().lower()
    tag = db.query(Tag).filter(Tag.user_id == user_id, Tag.name == cleaned).first()
    if not tag:
        tag = Tag(user_id=user_id, name=cleaned)
        db.add(tag)
        db.flush()
    return tag

async def async_enrich_idea(idea_id: str, user_id: str, raw_thought: str):
    """Background task to enrich idea with AI title, summary, category, and tags."""
    enrichment = await ai_service.quick_enrich(raw_thought)
    db = SessionLocal()
    try:
        idea = db.query(Idea).filter(Idea.id == idea_id, Idea.user_id == user_id).first()
        if idea:
            # Only update if still untitled/default
            if idea.title == "Untitled Spark" or not idea.title:
                idea.title = enrichment["title"]
            if not idea.ai_summary:
                idea.ai_summary = enrichment["summary"]
            
            # If no category, match suggested category
            if not idea.category_id and enrichment.get("category"):
                cat = db.query(Category).filter(
                    (Category.user_id == user_id) | (Category.is_default == True),
                    Category.name == enrichment["category"]
                ).first()
                if cat:
                    idea.category_id = cat.id

            # Add suggested tags
            for tag_name in enrichment.get("tags", []):
                tag = get_or_create_tag(db, user_id, tag_name)
                if tag not in idea.tags:
                    idea.tags.append(tag)

            db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()

@router.get("", response_model=List[IdeaListResponse])
def get_ideas(
    search: Optional[str] = None,
    category_id: Optional[str] = None,
    status: Optional[str] = None,
    include_archived: bool = False,
    sort_by: str = Query("last_interacted_at", enum=["last_interacted_at", "created_at", "updated_at", "importance", "title"]),
    sort_order: str = Query("desc", enum=["asc", "desc"]),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Idea).filter(Idea.user_id == current_user.id)

    if not include_archived:
        query = query.filter(Idea.is_archived == False)

    if category_id:
        query = query.filter(Idea.category_id == category_id)

    if status:
        query = query.filter(Idea.status == status.upper())

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Idea.title.ilike(search_term),
                Idea.raw_thought.ilike(search_term),
                Idea.ai_summary.ilike(search_term)
            )
        )

    # Sort
    col = getattr(Idea, sort_by, Idea.last_interacted_at)
    query = query.order_by(desc(col) if sort_order == "desc" else asc(col))

    ideas = query.all()

    # Build response with counts
    results = []
    for idea in ideas:
        notes_count = len(idea.notes)
        tasks_count = len(idea.tasks)
        completed_tasks_count = sum(1 for t in idea.tasks if t.is_completed)

        res = IdeaListResponse.model_validate(idea)
        res.notes_count = notes_count
        res.tasks_count = tasks_count
        res.completed_tasks_count = completed_tasks_count
        results.append(res)

    return results

@router.post("", response_model=IdeaListResponse, status_code=status.HTTP_201_CREATED)
def create_idea(
    idea_in: IdeaCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Determine title
    title = idea_in.title
    if not title or not title.strip():
        # Fast local heuristic title
        title = ai_service._heuristic_title(idea_in.raw_thought)

    # Random initial coordinates around center if not given
    canvas_x = idea_in.canvas_x if idea_in.canvas_x is not None else random.uniform(-250, 250)
    canvas_y = idea_in.canvas_y if idea_in.canvas_y is not None else random.uniform(-250, 250)

    # Create idea record immediately
    idea = Idea(
        user_id=current_user.id,
        category_id=idea_in.category_id,
        title=title,
        raw_thought=idea_in.raw_thought.strip(),
        status=idea_in.status or "SPARK",
        importance=idea_in.importance or 3,
        canvas_x=canvas_x,
        canvas_y=canvas_y,
        is_archived=False,
        last_interacted_at=datetime.now(timezone.utc)
    )

    # Associate provided tags
    if idea_in.tags:
        for tag_name in idea_in.tags:
            tag = get_or_create_tag(db, current_user.id, tag_name)
            idea.tags.append(tag)

    db.add(idea)
    db.commit()
    db.refresh(idea)

    # Trigger background AI enrichment (async)
    background_tasks.add_task(async_enrich_idea, idea.id, current_user.id, idea.raw_thought)

    res = IdeaListResponse.model_validate(idea)
    res.notes_count = 0
    res.tasks_count = 0
    res.completed_tasks_count = 0
    return res

@router.get("/{idea_id}", response_model=IdeaDetailResponse)
def get_idea(
    idea_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    idea = db.query(Idea).filter(
        Idea.id == idea_id,
        Idea.user_id == current_user.id
    ).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found.")

    # Update interaction timestamp
    idea.last_interacted_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(idea)

    return IdeaDetailResponse.model_validate(idea)

@router.patch("/{idea_id}", response_model=IdeaDetailResponse)
def update_idea(
    idea_id: str,
    idea_in: IdeaUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    idea = db.query(Idea).filter(
        Idea.id == idea_id,
        Idea.user_id == current_user.id
    ).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found.")

    if idea_in.title is not None:
        idea.title = idea_in.title
    if idea_in.raw_thought is not None:
        idea.raw_thought = idea_in.raw_thought
    if idea_in.ai_summary is not None:
        idea.ai_summary = idea_in.ai_summary
    if idea_in.category_id is not None:
        idea.category_id = idea_in.category_id or None
    if idea_in.status is not None:
        idea.status = idea_in.status.upper()
    if idea_in.importance is not None:
        idea.importance = idea_in.importance
    if idea_in.canvas_x is not None:
        idea.canvas_x = idea_in.canvas_x
    if idea_in.canvas_y is not None:
        idea.canvas_y = idea_in.canvas_y
    if idea_in.canvas_fixed is not None:
        idea.canvas_fixed = idea_in.canvas_fixed
    if idea_in.is_archived is not None:
        idea.is_archived = idea_in.is_archived

    if idea_in.tags is not None:
        idea.tags = [get_or_create_tag(db, current_user.id, t) for t in idea_in.tags]

    idea.updated_at = datetime.now(timezone.utc)
    idea.last_interacted_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(idea)

    return IdeaDetailResponse.model_validate(idea)

@router.delete("/{idea_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_idea(
    idea_id: str,
    permanent: bool = Query(False, description="Set true for permanent delete, false for soft archive"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    idea = db.query(Idea).filter(
        Idea.id == idea_id,
        Idea.user_id == current_user.id
    ).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found.")

    if permanent:
        db.delete(idea)
    else:
        idea.is_archived = True
        idea.status = "ARCHIVED"

    db.commit()
    return None
