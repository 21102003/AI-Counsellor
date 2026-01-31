"""
Profile Management Routes
POST /profile/update - Update user profile with auto-stage calculation
GET /profile - Get current user's profile
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import User, Profile
from schemas import ProfileUpdate, ProfileResponse
from dependencies import get_current_user

router = APIRouter(prefix="/profile", tags=["Profile"])


def calculate_stage(profile: Profile) -> int:
    """
    Auto-calculate user's journey stage based on profile completeness
    Logic:
    - Stage 1 (Onboarding): Profile incomplete
    - Stage 2 (Discovery): Profile complete, no shortlist
    - Stage 3 (Shortlist): Has shortlisted universities
    - Stage 4 (Applications): Has locked universities (handled elsewhere)
    """
    # Check if essential fields are filled
    essential_fields = [
        profile.gpa,
        profile.degree_level,
        profile.budget,
        profile.target_country
    ]
    
    if all(field is not None for field in essential_fields):
        return 2  # Move to Discovery stage
    else:
        return 1  # Stay in Onboarding


@router.post("/update", response_model=ProfileResponse)
async def update_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update user profile from Onboarding Wizard
    - Updates all provided fields
    - Auto-calculates current_stage
    - Returns updated profile
    """
    # Fetch user's profile
    result = await db.execute(
        select(Profile).where(Profile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    # Update fields (only if provided)
    update_data = profile_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)
    
    # Auto-calculate stage
    profile.current_stage = calculate_stage(profile)
    
    await db.commit()
    await db.refresh(profile)
    
    return profile


@router.get("/", response_model=ProfileResponse)
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get current user's profile with user information
    """
    result = await db.execute(
        select(Profile).where(Profile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    # Smart name logic: use email prefix if full_name is missing
    # e.g., "john.doe@email.com" -> "John Doe"
    display_name = None
    if hasattr(current_user, 'full_name') and current_user.full_name:
        display_name = current_user.full_name
    else:
        # Extract name from email (before @)
        email_prefix = current_user.email.split('@')[0]
        # Convert "john.doe" or "john_doe" to "John Doe"
        display_name = email_prefix.replace('.', ' ').replace('_', ' ').title()
    
    # Convert profile to dict and add user info
    profile_dict = {
        "id": profile.id,
        "user_id": profile.user_id,
        "gpa": profile.gpa,
        "degree_level": profile.degree_level,
        "budget": profile.budget,
        "target_country": profile.target_country,
        "ielts_score": profile.ielts_score,
        "gre_score": profile.gre_score,
        "current_stage": profile.current_stage,
        "email": current_user.email,
        "full_name": display_name
    }
    
    return profile_dict
