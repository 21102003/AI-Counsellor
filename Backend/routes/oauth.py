"""
OAuth Routes
Google and GitHub OAuth2 authentication
"""
from fastapi import APIRouter, HTTPException, status, Query, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import os
import secrets
import httpx
from urllib.parse import urlencode

from database import get_db
from models import User, Profile
from dependencies import create_access_token

router = APIRouter(prefix="/oauth", tags=["OAuth"])

# OAuth Configuration (set these in .env for production)
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID", "")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET", "")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")


@router.get("/google")
async def google_login():
    """
    Redirect to Google OAuth2 login page
    """
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Google OAuth not configured. Please set GOOGLE_CLIENT_ID in .env"
        )
    
    state = secrets.token_urlsafe(32)
    
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": f"{BACKEND_URL}/oauth/google/callback",
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
        "access_type": "offline",
        "prompt": "consent"
    }
    
    google_auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    return RedirectResponse(url=google_auth_url)


@router.get("/google/callback")
async def google_callback(
    code: str = Query(None), 
    error: str = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Handle Google OAuth2 callback - exchange code for tokens, create/login user
    """
    if error:
        return RedirectResponse(url=f"{FRONTEND_URL}/auth?error={error}")
    
    if not code:
        return RedirectResponse(url=f"{FRONTEND_URL}/auth?error=no_code")
    
    try:
        # Exchange code for tokens
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "code": code,
                    "grant_type": "authorization_code",
                    "redirect_uri": f"{BACKEND_URL}/oauth/google/callback",
                }
            )
            
            if token_response.status_code != 200:
                return RedirectResponse(url=f"{FRONTEND_URL}/auth?error=token_exchange_failed")
            
            tokens = token_response.json()
            access_token = tokens.get("access_token")
            
            # Get user info from Google
            user_response = await client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            if user_response.status_code != 200:
                return RedirectResponse(url=f"{FRONTEND_URL}/auth?error=user_info_failed")
            
            google_user = user_response.json()
            email = google_user.get("email")
            name = google_user.get("name", "")
            
            if not email:
                return RedirectResponse(url=f"{FRONTEND_URL}/auth?error=no_email")
        
        # Check if user exists
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if not user:
            # Create new user (no password for OAuth users)
            user = User(
                email=email,
                password_hash="OAUTH_USER",  # Marker for OAuth users
                full_name=name
            )
            db.add(user)
            await db.flush()
            
            # Create empty profile
            profile = Profile(user_id=user.id)
            db.add(profile)
            await db.commit()
        
        # Generate JWT token
        jwt_token = create_access_token(data={"sub": str(user.id), "email": user.email})
        
        # Redirect to frontend with token
        return RedirectResponse(url=f"{FRONTEND_URL}/auth?token={jwt_token}&oauth=google")
        
    except Exception as e:
        print(f"Google OAuth error: {e}")
        return RedirectResponse(url=f"{FRONTEND_URL}/auth?error=oauth_failed")


@router.get("/github")
async def github_login():
    """
    Redirect to GitHub OAuth login page
    """
    if not GITHUB_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="GitHub OAuth not configured. Please set GITHUB_CLIENT_ID in .env"
        )
    
    state = secrets.token_urlsafe(32)
    
    params = {
        "client_id": GITHUB_CLIENT_ID,
        "redirect_uri": f"{BACKEND_URL}/oauth/github/callback",
        "scope": "user:email",
        "state": state
    }
    
    github_auth_url = f"https://github.com/login/oauth/authorize?{urlencode(params)}"
    return RedirectResponse(url=github_auth_url)


@router.get("/github/callback")
async def github_callback(
    code: str = Query(None), 
    error: str = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Handle GitHub OAuth callback - exchange code for tokens, create/login user
    """
    if error:
        return RedirectResponse(url=f"{FRONTEND_URL}/auth?error={error}")
    
    if not code:
        return RedirectResponse(url=f"{FRONTEND_URL}/auth?error=no_code")
    
    try:
        async with httpx.AsyncClient() as client:
            # Exchange code for access token
            token_response = await client.post(
                "https://github.com/login/oauth/access_token",
                data={
                    "client_id": GITHUB_CLIENT_ID,
                    "client_secret": GITHUB_CLIENT_SECRET,
                    "code": code,
                    "redirect_uri": f"{BACKEND_URL}/oauth/github/callback",
                },
                headers={"Accept": "application/json"}
            )
            
            if token_response.status_code != 200:
                return RedirectResponse(url=f"{FRONTEND_URL}/auth?error=token_exchange_failed")
            
            tokens = token_response.json()
            access_token = tokens.get("access_token")
            
            if not access_token:
                return RedirectResponse(url=f"{FRONTEND_URL}/auth?error=no_access_token")
            
            # Get user info from GitHub
            user_response = await client.get(
                "https://api.github.com/user",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/json"
                }
            )
            
            github_user = user_response.json()
            name = github_user.get("name") or github_user.get("login", "")
            
            # Get user email (may need separate API call)
            email = github_user.get("email")
            if not email:
                # Fetch emails separately
                email_response = await client.get(
                    "https://api.github.com/user/emails",
                    headers={
                        "Authorization": f"Bearer {access_token}",
                        "Accept": "application/json"
                    }
                )
                emails = email_response.json()
                # Find primary email
                for e in emails:
                    if e.get("primary"):
                        email = e.get("email")
                        break
                if not email and emails:
                    email = emails[0].get("email")
            
            if not email:
                return RedirectResponse(url=f"{FRONTEND_URL}/auth?error=no_email")
        
        # Check if user exists
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if not user:
            # Create new user
            user = User(
                email=email,
                password_hash="OAUTH_USER",
                full_name=name
            )
            db.add(user)
            await db.flush()
            
            # Create empty profile
            profile = Profile(user_id=user.id)
            db.add(profile)
            await db.commit()
        
        # Generate JWT token
        jwt_token = create_access_token(data={"sub": str(user.id), "email": user.email})
        
        # Redirect to frontend with token
        return RedirectResponse(url=f"{FRONTEND_URL}/auth?token={jwt_token}&oauth=github")
        
    except Exception as e:
        print(f"GitHub OAuth error: {e}")
        return RedirectResponse(url=f"{FRONTEND_URL}/auth?error=oauth_failed")
