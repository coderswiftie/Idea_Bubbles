from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.core.database import get_db
from app.models.models import Idea, IdeaConnection, User
from app.schemas.schemas import ConnectionCreate, ConnectionResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/connections", tags=["Connections"])

@router.get("", response_model=List[ConnectionResponse])
def get_all_connections(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    connections = db.query(IdeaConnection).filter(IdeaConnection.user_id == current_user.id).all()
    return [ConnectionResponse.model_validate(c) for c in connections]

@router.post("/{source_idea_id}", response_model=ConnectionResponse, status_code=status.HTTP_201_CREATED)
def create_connection(
    source_idea_id: str,
    conn_in: ConnectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify both ideas belong to user
    source = db.query(Idea).filter(Idea.id == source_idea_id, Idea.user_id == current_user.id).first()
    target = db.query(Idea).filter(Idea.id == conn_in.target_idea_id, Idea.user_id == current_user.id).first()

    if not source or not target:
        raise HTTPException(status_code=404, detail="Source or target idea not found.")

    if source_idea_id == conn_in.target_idea_id:
        raise HTTPException(status_code=400, detail="Cannot connect an idea to itself.")

    # Check if existing connection already exists
    existing = db.query(IdeaConnection).filter(
        IdeaConnection.user_id == current_user.id,
        or_(
            (IdeaConnection.source_idea_id == source_idea_id) & (IdeaConnection.target_idea_id == conn_in.target_idea_id),
            (IdeaConnection.source_idea_id == conn_in.target_idea_id) & (IdeaConnection.target_idea_id == source_idea_id)
        )
    ).first()

    if existing:
        return ConnectionResponse.model_validate(existing)

    conn = IdeaConnection(
        user_id=current_user.id,
        source_idea_id=source.id,
        target_idea_id=target.id,
        relationship_type=conn_in.relationship_type or "related",
        description=conn_in.description
    )
    db.add(conn)
    db.commit()
    db.refresh(conn)
    return ConnectionResponse.model_validate(conn)

@router.delete("/{connection_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_connection(
    connection_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conn = db.query(IdeaConnection).filter(
        IdeaConnection.id == connection_id,
        IdeaConnection.user_id == current_user.id
    ).first()
    if not conn:
        raise HTTPException(status_code=404, detail="Connection not found.")

    db.delete(conn)
    db.commit()
    return None
