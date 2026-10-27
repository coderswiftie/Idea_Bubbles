from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict

# ----------------- Auth Schemas -----------------
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    display_name: Optional[str] = "Dreamer"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    display_name: Optional[str]
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# ----------------- Category Schemas -----------------
class CategoryBase(BaseModel):
    name: str
    color_hex: str = "#8B5CF6"
    icon: Optional[str] = "sparkles"

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    color_hex: Optional[str] = None
    icon: Optional[str] = None

class CategoryResponse(CategoryBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: Optional[str] = None
    is_default: bool = False
    created_at: datetime
    idea_count: Optional[int] = 0

# ----------------- Tag Schemas -----------------
class TagResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str

# ----------------- Note Schemas -----------------
class NoteCreate(BaseModel):
    content: str

class NoteUpdate(BaseModel):
    content: str

class NoteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    idea_id: str
    content: str
    created_at: datetime
    updated_at: datetime

# ----------------- Task Schemas -----------------
class TaskCreate(BaseModel):
    title: str
    position: Optional[int] = 0

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    is_completed: Optional[bool] = None
    position: Optional[int] = None

class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    idea_id: str
    title: str
    is_completed: bool
    position: int
    created_at: datetime

# ----------------- Reference Schemas -----------------
class ReferenceCreate(BaseModel):
    url: str

class ReferenceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    idea_id: str
    url: str
    title: Optional[str] = None
    description: Optional[str] = None
    domain: Optional[str] = None
    thumbnail_url: Optional[str] = None
    created_at: datetime

# ----------------- Attachment Schemas -----------------
class AttachmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    idea_id: str
    file_name: str
    file_path: str
    mime_type: str
    file_size: int
    created_at: datetime

# ----------------- Connection Schemas -----------------
class ConnectionCreate(BaseModel):
    target_idea_id: str
    relationship_type: Optional[str] = "related"
    description: Optional[str] = None

class ConnectionIdeaBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    status: str
    category_id: Optional[str] = None

class ConnectionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    source_idea_id: str
    target_idea_id: str
    relationship_type: Optional[str]
    description: Optional[str]
    created_at: datetime
    source_idea: Optional[ConnectionIdeaBrief] = None
    target_idea: Optional[ConnectionIdeaBrief] = None

# ----------------- AI Schemas -----------------
class AIChatRequest(BaseModel):
    message: str

class AIMessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    role: str
    content: str
    created_at: datetime

class AISummarizeResponse(BaseModel):
    title: str
    one_sentence_summary: str
    detailed_explanation: str
    key_themes: List[str]
    unresolved_questions: List[str]
    suggested_categories: List[str]

class AIExpandResponse(BaseModel):
    possible_directions: List[str]
    assumptions: List[str]
    first_experiments: List[str]
    potential_challenges: List[str]
    realistic_next_step: str

# ----------------- Idea Schemas -----------------
class IdeaCreate(BaseModel):
    raw_thought: str
    title: Optional[str] = None
    category_id: Optional[str] = None
    status: Optional[str] = "SPARK"
    importance: Optional[int] = 3
    tags: Optional[List[str]] = []
    canvas_x: Optional[float] = None
    canvas_y: Optional[float] = None

class IdeaUpdate(BaseModel):
    title: Optional[str] = None
    raw_thought: Optional[str] = None
    ai_summary: Optional[str] = None
    category_id: Optional[str] = None
    status: Optional[str] = None # SPARK, EXPLORING, DEVELOPING, ACTIVE_PROJECT, ARCHIVED
    importance: Optional[int] = None
    canvas_x: Optional[float] = None
    canvas_y: Optional[float] = None
    canvas_fixed: Optional[bool] = None
    is_archived: Optional[bool] = None
    tags: Optional[List[str]] = None

class IdeaListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    raw_thought: str
    ai_summary: Optional[str] = None
    status: str
    importance: int
    category_id: Optional[str] = None
    category: Optional[CategoryResponse] = None
    canvas_x: Optional[float] = 0.0
    canvas_y: Optional[float] = 0.0
    canvas_fixed: bool = False
    is_archived: bool = False
    created_at: datetime
    updated_at: datetime
    last_interacted_at: datetime
    tags: List[TagResponse] = []
    notes_count: Optional[int] = 0
    tasks_count: Optional[int] = 0
    completed_tasks_count: Optional[int] = 0

class IdeaDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    raw_thought: str
    ai_summary: Optional[str] = None
    status: str
    importance: int
    category_id: Optional[str] = None
    category: Optional[CategoryResponse] = None
    canvas_x: Optional[float] = 0.0
    canvas_y: Optional[float] = 0.0
    canvas_fixed: bool = False
    is_archived: bool = False
    created_at: datetime
    updated_at: datetime
    last_interacted_at: datetime
    tags: List[TagResponse] = []
    notes: List[NoteResponse] = []
    tasks: List[TaskResponse] = []
    references: List[ReferenceResponse] = []
    attachments: List[AttachmentResponse] = []
    outgoing_connections: List[ConnectionResponse] = []
    incoming_connections: List[ConnectionResponse] = []

class RediscoverIdeaResponse(BaseModel):
    idea: IdeaListResponse
    reason: str
    days_dormant: int
    suggested_action: str
