"""
Database Models (SQLAlchemy ORM)
The Neural Core: Optimized for 6GB RAM using SQLite
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime
import enum

Base = declarative_base()


class DegreeLevelEnum(str, enum.Enum):
    """Enum for degree levels"""
    BACHELORS = "bachelors"
    MASTERS = "masters"
    PHD = "phd"


class StageEnum(int, enum.Enum):
    """User journey stages"""
    ONBOARDING = 1
    DISCOVERY = 2
    SHORTLIST = 3
    APPLICATIONS = 4


class TaskStatusEnum(str, enum.Enum):
    """Task completion status"""
    PENDING = "pending"
    DONE = "done"


class MatchTierEnum(str, enum.Enum):
    """University match tiers"""
    SAFE = "Safe"
    TARGET = "Target"
    DREAM = "Dream"


class User(Base):
    """User authentication table"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=True)  # User's full name
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    shortlists = relationship("Shortlist", back_populates="user", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")


class Profile(Base):
    """User profile - One-to-One with User"""
    __tablename__ = "profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    # Academic Info
    gpa = Column(Float, nullable=True)
    degree_level = Column(SQLEnum(DegreeLevelEnum), nullable=True)
    
    # Preferences
    budget = Column(Integer, nullable=True)  # Annual tuition in USD
    target_country = Column(String, nullable=True)
    
    # Test Scores
    ielts_score = Column(Float, nullable=True)
    gre_score = Column(Integer, nullable=True)
    
    # Journey Stage
    current_stage = Column(Integer, default=1)  # 1=Onboarding, 2=Discovery, 3=Shortlist, 4=Applications
    
    # Relationships
    user = relationship("User", back_populates="profile")


class University(Base):
    """University master data"""
    __tablename__ = "universities"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    country = Column(String, nullable=False, index=True)
    acceptance_rate = Column(Float, nullable=False)  # Percentage (e.g., 45.5)
    tuition_fee = Column(Integer, nullable=False)  # Annual fee in USD
    match_tier = Column(SQLEnum(MatchTierEnum), nullable=True)  # Calculated dynamically
    
    # Additional metadata
    ranking = Column(Integer, nullable=True)
    location = Column(String, nullable=True)
    
    # Relationships
    shortlists = relationship("Shortlist", back_populates="university")


class Shortlist(Base):
    """User's shortlisted universities with locking mechanism"""
    __tablename__ = "shortlists"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    university_id = Column(Integer, ForeignKey("universities.id"), nullable=False)
    
    # Locking mechanism (When user commits to apply)
    is_locked = Column(Boolean, default=False)
    locked_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="shortlists")
    university = relationship("University", back_populates="shortlists")


class Task(Base):
    """Application tasks for users"""
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    status = Column(SQLEnum(TaskStatusEnum), default=TaskStatusEnum.PENDING)
    due_date = Column(DateTime, nullable=True)
    
    # Link to specific university (optional)
    university_id = Column(Integer, ForeignKey("universities.id"), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="tasks")
