from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.core.database import get_db
from app.models.models import Idea, IdeaTask, User
from app.schemas.schemas import TaskCreate, TaskUpdate, TaskResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/ideas/{idea_id}/tasks", tags=["Tasks"])

def verify_idea_owner(idea_id: str, user_id: str, db: Session) -> Idea:
    idea = db.query(Idea).filter(Idea.id == idea_id, Idea.user_id == user_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found.")
    return idea

@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    idea_id: str,
    task_in: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    idea = verify_idea_owner(idea_id, current_user.id, db)
    max_pos = db.query(IdeaTask).filter(IdeaTask.idea_id == idea.id).count()
    task = IdeaTask(
        idea_id=idea.id,
        title=task_in.title.strip(),
        is_completed=False,
        position=task_in.position if task_in.position is not None else max_pos
    )
    db.add(task)
    idea.last_interacted_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(task)
    return TaskResponse.model_validate(task)

@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(
    idea_id: str,
    task_id: str,
    task_in: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    idea = verify_idea_owner(idea_id, current_user.id, db)
    task = db.query(IdeaTask).filter(IdeaTask.id == task_id, IdeaTask.idea_id == idea.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")

    if task_in.title is not None:
        task.title = task_in.title.strip()
    if task_in.is_completed is not None:
        task.is_completed = task_in.is_completed
    if task_in.position is not None:
        task.position = task_in.position

    idea.last_interacted_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(task)
    return TaskResponse.model_validate(task)

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    idea_id: str,
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    idea = verify_idea_owner(idea_id, current_user.id, db)
    task = db.query(IdeaTask).filter(IdeaTask.id == task_id, IdeaTask.idea_id == idea.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")

    db.delete(task)
    idea.last_interacted_at = datetime.now(timezone.utc)
    db.commit()
    return None
