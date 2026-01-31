"""
Pydantic V2 Schemas for Request/Response Validation
Strict data validation for REST API
"""
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from enum import Enum


# ============= ENUMS =============
class DegreeLevelEnum(str, Enum):
    BACHELORS = "bachelors"
    MASTERS = "masters"
    PHD = "phd"


class TaskStatusEnum(str, Enum):
    PENDING = "pending"
    DONE = "done"


class MatchTierEnum(str, Enum):
    SAFE = "Safe"
    TARGET = "Target"
    DREAM = "Dream"


# ============= AUTH SCHEMAS =============
class UserSignup(BaseModel):
    """Signup request payload"""
    email: EmailStr
    password: str = Field(min_length=8, description="Minimum 8 characters")
    full_name: str = Field(min_length=2, max_length=100, description="User's full name")


class UserLogin(BaseModel):
    """Login request payload"""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """JWT token response"""
    access_token: str
    token_type: str = "bearer"
    user_id: int


# ============= PROFILE SCHEMAS =============
class ProfileUpdate(BaseModel):
    """Profile update from Onboarding Wizard"""
    gpa: Optional[float] = Field(None, ge=0.0, le=4.0)
    degree_level: Optional[DegreeLevelEnum] = None
    budget: Optional[int] = Field(None, ge=0, description="Annual budget in USD")
    target_country: Optional[str] = None
    ielts_score: Optional[float] = Field(None, ge=0.0, le=9.0)
    gre_score: Optional[int] = Field(None, ge=260, le=340)


class ProfileResponse(BaseModel):
    """Profile data response"""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    user_id: int
    gpa: Optional[float] = None
    degree_level: Optional[str] = None
    budget: Optional[int] = None
    target_country: Optional[str] = None
    ielts_score: Optional[float] = None
    gre_score: Optional[int] = None
    current_stage: int
    
    # User information (added for frontend display)
    email: Optional[str] = None
    full_name: Optional[str] = None


# ============= UNIVERSITY SCHEMAS =============
class UniversityBase(BaseModel):
    """Base university info"""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    country: str
    acceptance_rate: float
    tuition_fee: int
    ranking: Optional[int] = None
    location: Optional[str] = None


class UniversityWithMatch(UniversityBase):
    """University with calculated match tier"""
    match_tier: str  # Safe/Target/Dream


class UniversityLockRequest(BaseModel):
    """Request to lock a university"""
    university_id: int


class ShortlistResponse(BaseModel):
    """Shortlist entry with university data"""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    user_id: int
    university_id: int
    is_locked: bool
    locked_at: Optional[datetime] = None
    university: UniversityBase


# ============= CHAT SCHEMAS =============
class ChatMessage(BaseModel):
    """Chat message from user"""
    message: str = Field(min_length=1, max_length=2000)
    history: Optional[List[dict]] = Field(default_factory=list, description="Previous messages")


class ChatResponse(BaseModel):
    """AI response"""
    response: str
    render_cards: Optional[List[str]] = Field(default=None, description="Universities to render as cards")


# ============= TASK SCHEMAS =============
class TaskCreate(BaseModel):
    """Create new task"""
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    university_id: Optional[int] = None


class TaskUpdate(BaseModel):
    """Update task status"""
    status: TaskStatusEnum


class TaskResponse(BaseModel):
    """Task data response"""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    user_id: int
    title: str
    description: Optional[str] = None
    status: str
    due_date: Optional[datetime] = None
    university_id: Optional[int] = None
    created_at: datetime


class TaskListResponse(BaseModel):
    """List of tasks with metadata"""
    tasks: List[TaskResponse]
    all_cleared: bool = Field(description="True if all tasks are completed")


class TaskAssistRequest(BaseModel):
    """Request AI assistance for a task"""
    task_id: int


class TaskAssistResponse(BaseModel):
    """AI-generated task assistance"""
    content: str


# ============= USER SCHEMAS =============
class UserResponse(BaseModel):
    """User data (without password)"""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    email: str
    created_at: datetime
