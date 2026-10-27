from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.core.database import get_db
from app.models.models import Idea, Reference, User
from app.schemas.schemas import ReferenceCreate, ReferenceResponse
from app.api.deps import get_current_user
from app.services.scraper_service import scraper_service

router = APIRouter(prefix="/ideas/{idea_id}/references", tags=["References"])

def verify_idea_owner(idea_id: str, user_id: str, db: Session) -> Idea:
    idea = db.query(Idea).filter(Idea.id == idea_id, Idea.user_id == user_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found.")
    return idea

@router.post("", response_model=ReferenceResponse, status_code=status.HTTP_201_CREATED)
async def create_reference(
    idea_id: str,
    ref_in: ReferenceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    idea = verify_idea_owner(idea_id, current_user.id, db)
    url = ref_in.url.strip()

    # Safely fetch metadata
    meta = await scraper_service.fetch_metadata(url)

    ref = Reference(
        idea_id=idea.id,
        url=url,
        title=meta.get("title") or url,
        description=meta.get("description"),
        domain=meta.get("domain"),
        thumbnail_url=meta.get("thumbnail_url")
    )
    db.add(ref)
    idea.last_interacted_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(ref)
    return ReferenceResponse.model_validate(ref)

@router.delete("/{reference_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reference(
    idea_id: str,
    reference_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    idea = verify_idea_owner(idea_id, current_user.id, db)
    ref = db.query(Reference).filter(Reference.id == reference_id, Reference.idea_id == idea.id).first()
    if not ref:
        raise HTTPException(status_code=404, detail="Reference not found.")

    db.delete(ref)
    idea.last_interacted_at = datetime.now(timezone.utc)
    db.commit()
    return None
