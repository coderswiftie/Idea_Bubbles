from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.core.database import get_db
from app.models.models import Idea, IdeaNote, User
from app.schemas.schemas import NoteCreate, NoteUpdate, NoteResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/ideas/{idea_id}/notes", tags=["Notes"])

def verify_idea_owner(idea_id: str, user_id: str, db: Session) -> Idea:
    idea = db.query(Idea).filter(Idea.id == idea_id, Idea.user_id == user_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found.")
    return idea

@router.post("", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(
    idea_id: str,
    note_in: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    idea = verify_idea_owner(idea_id, current_user.id, db)
    note = IdeaNote(
        idea_id=idea.id,
        content=note_in.content.strip()
    )
    db.add(note)
    idea.updated_at = datetime.now(timezone.utc)
    idea.last_interacted_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(note)
    return NoteResponse.model_validate(note)

@router.patch("/{note_id}", response_model=NoteResponse)
def update_note(
    idea_id: str,
    note_id: str,
    note_in: NoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    idea = verify_idea_owner(idea_id, current_user.id, db)
    note = db.query(IdeaNote).filter(IdeaNote.id == note_id, IdeaNote.idea_id == idea.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found.")

    note.content = note_in.content.strip()
    note.updated_at = datetime.now(timezone.utc)
    idea.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(note)
    return NoteResponse.model_validate(note)

@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    idea_id: str,
    note_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    idea = verify_idea_owner(idea_id, current_user.id, db)
    note = db.query(IdeaNote).filter(IdeaNote.id == note_id, IdeaNote.idea_id == idea.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found.")

    db.delete(note)
    idea.updated_at = datetime.now(timezone.utc)
    db.commit()
    return None
