from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.core.database import get_db
from app.models.models import Idea, AIConversation, AIMessage, User
from app.schemas.schemas import (
    AIChatRequest, AIMessageResponse, AISummarizeResponse, AIExpandResponse
)
from app.api.deps import get_current_user
from app.services.ai_service import ai_service
from app.core.config import settings

router = APIRouter(prefix="", tags=["AI Studio"])

def verify_idea_owner(idea_id: str, user_id: str, db: Session) -> Idea:
    idea = db.query(Idea).filter(Idea.id == idea_id, Idea.user_id == user_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found.")
    return idea

def get_idea_context_dict(idea: Idea) -> dict:
    return {
        "title": idea.title,
        "raw_thought": idea.raw_thought,
        "status": idea.status,
        "notes": [{"content": n.content} for n in idea.notes],
        "references": [{"title": r.title or "", "url": r.url} for r in idea.references],
        "tasks": [{"title": t.title, "completed": t.is_completed} for t in idea.tasks]
    }

@router.get("/ai/status")
def get_ai_status():
    return {
        "configured": ai_service.is_ai_configured,
        "provider": settings.AI_PROVIDER,
        "model": settings.GEMINI_MODEL if settings.AI_PROVIDER == "gemini" else settings.OPENAI_MODEL
    }

@router.post("/ideas/{idea_id}/ai/summarize", response_model=AISummarizeResponse)
async def summarize_idea(
    idea_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    idea = verify_idea_owner(idea_id, current_user.id, db)
    context = get_idea_context_dict(idea)
    summary_data = await ai_service.summarize(context)

    # Update idea's ai_summary field
    idea.ai_summary = summary_data.get("one_sentence_summary")
    idea.last_interacted_at = datetime.now(timezone.utc)
    db.commit()

    return AISummarizeResponse.model_validate(summary_data)

@router.post("/ideas/{idea_id}/ai/expand", response_model=AIExpandResponse)
async def expand_idea(
    idea_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    idea = verify_idea_owner(idea_id, current_user.id, db)
    context = get_idea_context_dict(idea)
    expansion_data = await ai_service.expand(context)
    idea.last_interacted_at = datetime.now(timezone.utc)
    db.commit()

    return AIExpandResponse.model_validate(expansion_data)

@router.get("/ideas/{idea_id}/ai/chat", response_model=List[AIMessageResponse])
def get_idea_chat_history(
    idea_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    idea = verify_idea_owner(idea_id, current_user.id, db)
    conversation = db.query(AIConversation).filter(AIConversation.idea_id == idea.id).first()
    if not conversation:
        return []
    return [AIMessageResponse.model_validate(m) for m in conversation.messages]

@router.post("/ideas/{idea_id}/ai/chat", response_model=AIMessageResponse)
async def chat_with_idea(
    idea_id: str,
    chat_in: AIChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    idea = verify_idea_owner(idea_id, current_user.id, db)

    # Get or create conversation container
    conversation = db.query(AIConversation).filter(AIConversation.idea_id == idea.id).first()
    if not conversation:
        conversation = AIConversation(idea_id=idea.id)
        db.add(conversation)
        db.flush()

    # Save user message
    user_msg = AIMessage(
        conversation_id=conversation.id,
        role="user",
        content=chat_in.message.strip()
    )
    db.add(user_msg)
    db.flush()

    # Build history context
    history = [{"role": m.role, "content": m.content} for m in conversation.messages]
    idea_context = get_idea_context_dict(idea)

    # Generate assistant reply
    reply_text = await ai_service.chat(idea_context, history, chat_in.message.strip())

    # Save assistant message
    bot_msg = AIMessage(
        conversation_id=conversation.id,
        role="assistant",
        content=reply_text
    )
    db.add(bot_msg)

    idea.last_interacted_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(bot_msg)

    return AIMessageResponse.model_validate(bot_msg)
