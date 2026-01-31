"""
Task Management Routes
GET /tasks - Get all tasks for current user
PATCH /tasks/{id} - Update task status
POST /tasks/assist - Get AI assistance for a task
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from database import get_db
from models import User, Task, TaskStatusEnum, Profile
from schemas import TaskResponse, TaskUpdate, TaskListResponse, TaskAssistRequest, TaskAssistResponse
from dependencies import get_current_user
from services.ai_engine import generate_task_assistance

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("/", response_model=TaskListResponse)
async def get_tasks(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all tasks for current user
    - Ordered by due_date
    - Includes gamification flag (all_cleared)
    """
    result = await db.execute(
        select(Task)
        .where(Task.user_id == current_user.id)
        .order_by(Task.due_date.asc().nullslast(), Task.created_at.asc())
    )
    tasks = result.scalars().all()
    
    # Check if all tasks are completed (Gamification)
    all_cleared = len(tasks) > 0 and all(task.status == TaskStatusEnum.DONE for task in tasks)
    
    return TaskListResponse(
        tasks=[TaskResponse.model_validate(task) for task in tasks],
        all_cleared=all_cleared
    )


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update task status (toggle between pending/done)
    """
    result = await db.execute(
        select(Task).where(
            Task.id == task_id,
            Task.user_id == current_user.id
        )
    )
    task = result.scalar_one_or_none()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Update status
    task.status = task_data.status
    await db.commit()
    await db.refresh(task)
    
    return task


@router.post("/assist", response_model=TaskAssistResponse)
async def get_task_assistance(
    assist_request: TaskAssistRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get AI assistance for a specific task
    - Generates templates/guidance based on task title
    - Uses user profile for personalization
    """
    # Fetch task
    result = await db.execute(
        select(Task).where(
            Task.id == assist_request.task_id,
            Task.user_id == current_user.id
        )
    )
    task = result.scalar_one_or_none()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Fetch user profile
    result = await db.execute(
        select(Profile).where(Profile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    # Prepare profile context
    user_profile = {
        "gpa": profile.gpa,
        "budget": profile.budget,
        "degree_level": profile.degree_level,
        "target_country": profile.target_country,
        "ielts_score": profile.ielts_score,
        "gre_score": profile.gre_score
    }
    
    # Generate AI assistance
    content = await generate_task_assistance(
        task_title=task.title,
        user_profile=user_profile
    )
    
    return TaskAssistResponse(content=content)
