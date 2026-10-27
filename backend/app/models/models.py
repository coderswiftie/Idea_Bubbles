import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Text, Integer, Float, Boolean, DateTime, ForeignKey, Table
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

# Association table for Idea and Tag
idea_tags = Table(
    "idea_tags",
    Base.metadata,
    Column("idea_id", String(36), ForeignKey("ideas.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", String(36), ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    display_name = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    ideas = relationship("Idea", back_populates="user", cascade="all, delete-orphan")
    categories = relationship("Category", back_populates="user", cascade="all, delete-orphan")
    tags = relationship("Tag", back_populates="user", cascade="all, delete-orphan")
    connections = relationship("IdeaConnection", back_populates="user", cascade="all, delete-orphan")

class Category(Base):
    __tablename__ = "categories"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    name = Column(String(100), nullable=False)
    color_hex = Column(String(16), nullable=False, default="#8B5CF6") # Default electric lavender
    icon = Column(String(50), nullable=True, default="sparkles")
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("User", back_populates="categories")
    ideas = relationship("Idea", back_populates="category")

class Tag(Base):
    __tablename__ = "tags"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(50), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("User", back_populates="tags")
    ideas = relationship("Idea", secondary=idea_tags, back_populates="tags")

class Idea(Base):
    __tablename__ = "ideas"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(String(36), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)

    title = Column(String(255), nullable=False, default="Untitled Spark")
    raw_thought = Column(Text, nullable=False)
    ai_summary = Column(Text, nullable=True)
    
    # Status: SPARK, EXPLORING, DEVELOPING, ACTIVE_PROJECT, ARCHIVED
    status = Column(String(50), nullable=False, default="SPARK", index=True)
    importance = Column(Integer, default=3) # 1 to 5 scale

    # Canvas visualization coordinates
    canvas_x = Column(Float, nullable=True, default=0.0)
    canvas_y = Column(Float, nullable=True, default=0.0)
    canvas_fixed = Column(Boolean, default=False)

    is_archived = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
    last_interacted_at = Column(DateTime(timezone=True), default=utc_now)

    # Relationships
    user = relationship("User", back_populates="ideas")
    category = relationship("Category", back_populates="ideas")
    tags = relationship("Tag", secondary=idea_tags, back_populates="ideas")
    notes = relationship("IdeaNote", back_populates="idea", cascade="all, delete-orphan", order_by="desc(IdeaNote.created_at)")
    tasks = relationship("IdeaTask", back_populates="idea", cascade="all, delete-orphan", order_by="IdeaTask.position")
    references = relationship("Reference", back_populates="idea", cascade="all, delete-orphan", order_by="desc(Reference.created_at)")
    attachments = relationship("Attachment", back_populates="idea", cascade="all, delete-orphan", order_by="desc(Attachment.created_at)")
    outgoing_connections = relationship("IdeaConnection", foreign_keys="IdeaConnection.source_idea_id", back_populates="source_idea", cascade="all, delete-orphan")
    incoming_connections = relationship("IdeaConnection", foreign_keys="IdeaConnection.target_idea_id", back_populates="target_idea", cascade="all, delete-orphan")
    conversations = relationship("AIConversation", back_populates="idea", cascade="all, delete-orphan")

class IdeaNote(Base):
    __tablename__ = "idea_notes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    idea_id = Column(String(36), ForeignKey("ideas.id", ondelete="CASCADE"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    idea = relationship("Idea", back_populates="notes")

class IdeaTask(Base):
    __tablename__ = "idea_tasks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    idea_id = Column(String(36), ForeignKey("ideas.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    is_completed = Column(Boolean, default=False)
    position = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    idea = relationship("Idea", back_populates="tasks")

class Reference(Base):
    __tablename__ = "references"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    idea_id = Column(String(36), ForeignKey("ideas.id", ondelete="CASCADE"), nullable=False, index=True)
    url = Column(String(1024), nullable=False)
    title = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    domain = Column(String(150), nullable=True)
    thumbnail_url = Column(String(1024), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    idea = relationship("Idea", back_populates="references")

class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    idea_id = Column(String(36), ForeignKey("ideas.id", ondelete="CASCADE"), nullable=False, index=True)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(1024), nullable=False)
    mime_type = Column(String(100), nullable=False)
    file_size = Column(Integer, nullable=False) # bytes
    created_at = Column(DateTime(timezone=True), default=utc_now)

    idea = relationship("Idea", back_populates="attachments")

class IdeaConnection(Base):
    __tablename__ = "idea_connections"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    source_idea_id = Column(String(36), ForeignKey("ideas.id", ondelete="CASCADE"), nullable=False, index=True)
    target_idea_id = Column(String(36), ForeignKey("ideas.id", ondelete="CASCADE"), nullable=False, index=True)
    relationship_type = Column(String(100), nullable=True, default="related") # e.g. "inspired by", "subset of", "synergy with"
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("User", back_populates="connections")
    source_idea = relationship("Idea", foreign_keys=[source_idea_id], back_populates="outgoing_connections")
    target_idea = relationship("Idea", foreign_keys=[target_idea_id], back_populates="incoming_connections")

class AIConversation(Base):
    __tablename__ = "ai_conversations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    idea_id = Column(String(36), ForeignKey("ideas.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    idea = relationship("Idea", back_populates="conversations")
    messages = relationship("AIMessage", back_populates="conversation", cascade="all, delete-orphan", order_by="AIMessage.created_at")

class AIMessage(Base):
    __tablename__ = "ai_messages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    conversation_id = Column(String(36), ForeignKey("ai_conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(20), nullable=False) # "user", "assistant", "system"
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    conversation = relationship("AIConversation", back_populates="messages")
