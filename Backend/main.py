"""
FastAPI Main Application
The Neural Core - AI Counsellor Backend
"""
from dotenv import load_dotenv
load_dotenv()  # Load .env file BEFORE other imports

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import engine
from models import Base
from routes import auth, profile, chat, universities, tasks, oauth


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup/Shutdown lifecycle
    - Creates database tables on startup
    """
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield
    
    # Cleanup (if needed)
    await engine.dispose()


# Initialize FastAPI app
app = FastAPI(
    title="AI Counsellor API",
    description="Intelligent Study Abroad Counselling Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration (Allow Frontend - localhost and production)
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
]

# Add frontend URL from environment
frontend_url = os.getenv("FRONTEND_URL", "").strip()
if frontend_url and frontend_url not in ALLOWED_ORIGINS:
    ALLOWED_ORIGINS.append(frontend_url)

# Add any additional origins from environment (comma-separated)
extra_origins = os.getenv("ALLOWED_ORIGINS", "").strip()
if extra_origins:
    for origin in extra_origins.split(","):
        origin = origin.strip()
        if origin and origin not in ALLOWED_ORIGINS:
            ALLOWED_ORIGINS.append(origin)

# Debug log
print(f"CORS Allowed Origins: {ALLOWED_ORIGINS}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(chat.router)
app.include_router(universities.router)
app.include_router(tasks.router)
app.include_router(oauth.router)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "message": "AI Counsellor API - The Neural Core",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "database": "connected",
        "ai_engine": "groq"
    }
