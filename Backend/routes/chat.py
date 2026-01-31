"""
Chat Routes
POST /chat/message - Send message to AI counsellor
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import User, Profile
from schemas import ChatMessage, ChatResponse
from dependencies import get_current_user
from services.ai_engine import get_ai_response

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/message", response_model=ChatResponse)
async def send_message(
    chat_data: ChatMessage,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Send message to AI counsellor
    - Retrieves user's profile for context
    - Injects profile data into AI prompt
    - Returns AI response with optional UI card triggers
    """
    # Fetch user's profile
    result = await db.execute(
        select(Profile).where(Profile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found. Complete onboarding first."
        )
    
    # Prepare profile context for AI
    user_profile = {
        "gpa": profile.gpa,
        "budget": profile.budget,
        "degree_level": profile.degree_level,
        "target_country": profile.target_country,
        "ielts_score": profile.ielts_score,
        "gre_score": profile.gre_score
    }
    
    # Get AI response
    response_text, render_cards = await get_ai_response(
        message=chat_data.message,
        history=chat_data.history,
        user_profile=user_profile
    )
    
    return ChatResponse(
        response=response_text,
        render_cards=render_cards if render_cards else None
    )
