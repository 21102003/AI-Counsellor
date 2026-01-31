"""
University Routes
GET /universities/recommend - Get personalized recommendations
POST /universities/lock/{id} - Lock a university for application
GET /universities/seed - Seed database with dummy data (Hackathon only)
GET /universities/shortlist - Get user's shortlisted universities
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from typing import List

from database import get_db
from models import User, Profile, University, Shortlist, Task, TaskStatusEnum
from schemas import UniversityWithMatch, ShortlistResponse
from dependencies import get_current_user

router = APIRouter(prefix="/universities", tags=["Universities"])


async def seed_universities_data(db: AsyncSession):
    """
    Seed database with 20 dummy universities
    CRITICAL for Hackathon: No external API available
    """
    universities = [
        # USA - High Cost
        {"name": "Stanford University", "country": "USA", "acceptance_rate": 4.3, "tuition_fee": 55473, "ranking": 3, "location": "California"},
        {"name": "MIT", "country": "USA", "acceptance_rate": 6.7, "tuition_fee": 53790, "ranking": 1, "location": "Massachusetts"},
        {"name": "Harvard University", "country": "USA", "acceptance_rate": 5.2, "tuition_fee": 54002, "ranking": 2, "location": "Massachusetts"},
        {"name": "Princeton University", "country": "USA", "acceptance_rate": 5.8, "tuition_fee": 53890, "ranking": 12, "location": "New Jersey"},
        
        # USA - Mid Cost
        {"name": "University of California, Berkeley", "country": "USA", "acceptance_rate": 17.5, "tuition_fee": 43176, "ranking": 4, "location": "California"},
        {"name": "University of Michigan", "country": "USA", "acceptance_rate": 26.0, "tuition_fee": 49350, "ranking": 21, "location": "Michigan"},
        {"name": "University of Texas at Austin", "country": "USA", "acceptance_rate": 32.0, "tuition_fee": 38326, "ranking": 38, "location": "Texas"},
        {"name": "Georgia Institute of Technology", "country": "USA", "acceptance_rate": 23.0, "tuition_fee": 33794, "ranking": 44, "location": "Georgia"},
        
        # USA - Lower Cost
        {"name": "Arizona State University", "country": "USA", "acceptance_rate": 88.0, "tuition_fee": 28800, "ranking": 103, "location": "Arizona"},
        {"name": "University of Illinois Chicago", "country": "USA", "acceptance_rate": 73.0, "tuition_fee": 27672, "ranking": 82, "location": "Illinois"},
        
        # UK - High Cost
        {"name": "University of Oxford", "country": "UK", "acceptance_rate": 17.5, "tuition_fee": 35000, "ranking": 5, "location": "Oxford"},
        {"name": "University of Cambridge", "country": "UK", "acceptance_rate": 21.0, "tuition_fee": 34000, "ranking": 6, "location": "Cambridge"},
        {"name": "Imperial College London", "country": "UK", "acceptance_rate": 14.3, "tuition_fee": 36000, "ranking": 7, "location": "London"},
        
        # UK - Mid Cost
        {"name": "University of Edinburgh", "country": "UK", "acceptance_rate": 46.0, "tuition_fee": 26000, "ranking": 22, "location": "Edinburgh"},
        {"name": "King's College London", "country": "UK", "acceptance_rate": 38.0, "tuition_fee": 28000, "ranking": 35, "location": "London"},
        {"name": "University of Manchester", "country": "UK", "acceptance_rate": 59.0, "tuition_fee": 24000, "ranking": 27, "location": "Manchester"},
        
        # Canada
        {"name": "University of Toronto", "country": "Canada", "acceptance_rate": 43.0, "tuition_fee": 58160, "ranking": 18, "location": "Toronto"},
        {"name": "University of British Columbia", "country": "Canada", "acceptance_rate": 52.0, "tuition_fee": 40000, "ranking": 34, "location": "Vancouver"},
        
        # Germany (Low Cost)
        {"name": "Technical University of Munich", "country": "Germany", "acceptance_rate": 8.0, "tuition_fee": 3000, "ranking": 50, "location": "Munich"},
        {"name": "University of Heidelberg", "country": "Germany", "acceptance_rate": 20.0, "tuition_fee": 3500, "ranking": 65, "location": "Heidelberg"},
    ]
    
    for uni_data in universities:
        uni = University(**uni_data)
        db.add(uni)
    
    await db.commit()


@router.get("/seed")
async def seed_universities(db: AsyncSession = Depends(get_db)):
    """
    Seed database with universities (Hackathon setup only)
    """
    # Check if already seeded
    result = await db.execute(select(University))
    existing = result.scalars().all()
    
    if existing:
        return {"message": f"Database already has {len(existing)} universities"}
    
    await seed_universities_data(db)
    return {"message": "Successfully seeded 20 universities"}


def calculate_match_tier(acceptance_rate: float) -> str:
    """
    Calculate university match tier based on acceptance rate
    Logic:
    - Safe: acceptance_rate > 60%
    - Target: 30% <= acceptance_rate <= 60%
    - Dream: acceptance_rate < 30%
    """
    if acceptance_rate > 60:
        return "Safe"
    elif acceptance_rate >= 30:
        return "Target"
    else:
        return "Dream"


@router.get("/recommend", response_model=List[UniversityWithMatch])
async def get_recommendations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get personalized university recommendations
    - Returns all universities sorted by tuition
    - Calculates match tier (Safe/Target/Dream)
    - Marks which are within budget
    """
    # Fetch user's profile
    result = await db.execute(
        select(Profile).where(Profile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    
    user_budget = profile.budget if profile and profile.budget else 50000  # Default budget
    
    # Fetch ALL universities (not just within budget)
    result = await db.execute(select(University))
    universities = result.scalars().all()
    
    # If no universities, seed them first
    if not universities:
        await seed_universities_data(db)
        result = await db.execute(select(University))
        universities = result.scalars().all()
    
    # Calculate match tiers and prepare response
    recommendations = []
    for uni in universities:
        match_tier = calculate_match_tier(uni.acceptance_rate)
        recommendations.append(
            UniversityWithMatch(
                id=uni.id,
                name=uni.name,
                country=uni.country,
                acceptance_rate=uni.acceptance_rate,
                tuition_fee=uni.tuition_fee,
                ranking=uni.ranking,
                location=uni.location,
                match_tier=match_tier
            )
        )
    
    # Sort by ranking (ascending)
    recommendations.sort(key=lambda x: x.ranking if x.ranking else 999)
    
    return recommendations


@router.post("/lock/{university_id}")
async def lock_university(
    university_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Lock a university for application
    - Creates shortlist entry with is_locked=True
    - Auto-generates 3 application tasks
    - Moves user to Applications stage (stage 4)
    """
    # Check if university exists
    result = await db.execute(
        select(University).where(University.id == university_id)
    )
    university = result.scalar_one_or_none()
    
    if not university:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="University not found"
        )
    
    # Check if already shortlisted
    result = await db.execute(
        select(Shortlist).where(
            Shortlist.user_id == current_user.id,
            Shortlist.university_id == university_id
        )
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        # Update to locked
        existing.is_locked = True
        existing.locked_at = datetime.utcnow()
    else:
        # Create new shortlist entry
        shortlist = Shortlist(
            user_id=current_user.id,
            university_id=university_id,
            is_locked=True,
            locked_at=datetime.utcnow()
        )
        db.add(shortlist)
    
    # Auto-generate tasks
    tasks = [
        Task(
            user_id=current_user.id,
            university_id=university_id,
            title=f"Draft SOP for {university.name}",
            description="Write your Statement of Purpose",
            status=TaskStatusEnum.PENDING
        ),
        Task(
            user_id=current_user.id,
            university_id=university_id,
            title=f"Upload Transcripts for {university.name}",
            description="Prepare and upload official transcripts",
            status=TaskStatusEnum.PENDING
        ),
        Task(
            user_id=current_user.id,
            university_id=university_id,
            title=f"Request LORs for {university.name}",
            description="Request 2-3 letters of recommendation",
            status=TaskStatusEnum.PENDING
        ),
    ]
    
    for task in tasks:
        db.add(task)
    
    # Update user's stage to Applications (4)
    result = await db.execute(
        select(Profile).where(Profile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if profile:
        profile.current_stage = 4
    
    await db.commit()
    
    return {
        "message": f"Successfully locked {university.name}",
        "tasks_created": 3,
        "stage": 4
    }


@router.get("/shortlist", response_model=List[ShortlistResponse])
async def get_shortlist(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get user's shortlisted universities
    """
    result = await db.execute(
        select(Shortlist).where(Shortlist.user_id == current_user.id)
    )
    shortlists = result.scalars().all()
    
    # Fetch universities
    response = []
    for shortlist in shortlists:
        result = await db.execute(
            select(University).where(University.id == shortlist.university_id)
        )
        university = result.scalar_one_or_none()
        if university:
            response.append(
                ShortlistResponse(
                    id=shortlist.id,
                    user_id=shortlist.user_id,
                    university_id=shortlist.university_id,
                    is_locked=shortlist.is_locked,
                    locked_at=shortlist.locked_at,
                    university=university
                )
            )
    
    return response
