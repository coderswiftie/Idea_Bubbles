from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.core.database import get_db
from app.models.models import Idea, Attachment, User
from app.schemas.schemas import AttachmentResponse
from app.api.deps import get_current_user
from app.services.storage_service import storage_service

router = APIRouter(prefix="/ideas/{idea_id}/attachments", tags=["Attachments"])

def verify_idea_owner(idea_id: str, user_id: str, db: Session) -> Idea:
    idea = db.query(Idea).filter(Idea.id == idea_id, Idea.user_id == user_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found.")
    return idea

@router.post("", response_model=AttachmentResponse, status_code=status.HTTP_201_CREATED)
async def upload_attachment(
    idea_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    idea = verify_idea_owner(idea_id, current_user.id, db)
    file_name, file_path, file_size = await storage_service.save_file(file)

    attachment = Attachment(
        idea_id=idea.id,
        file_name=file_name,
        file_path=file_path,
        mime_type=file.content_type or "application/octet-stream",
        file_size=file_size
    )
    db.add(attachment)
    idea.last_interacted_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(attachment)
    return AttachmentResponse.model_validate(attachment)

@router.delete("/{attachment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_attachment(
    idea_id: str,
    attachment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    idea = verify_idea_owner(idea_id, current_user.id, db)
    attachment = db.query(Attachment).filter(
        Attachment.id == attachment_id,
        Attachment.idea_id == idea.id
    ).first()
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found.")

    storage_service.delete_file(attachment.file_path)
    db.delete(attachment)
    idea.last_interacted_at = datetime.now(timezone.utc)
    db.commit()
    return None
