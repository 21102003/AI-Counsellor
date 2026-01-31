"""
OAuth Routes
Google and GitHub OAuth2 authentication
"""
from fastapi import APIRouter, HTTPException, status, Query
from fastapi.responses import RedirectResponse
import os
import secrets
from urllib.parse import urlencode

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
        # If no OAuth configured, show a message
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Google OAuth not configured. Please set GOOGLE_CLIENT_ID in .env"
        )
    
    # Generate state for CSRF protection
    state = secrets.token_urlsafe(32)
    
    # Google OAuth2 authorization URL
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
async def google_callback(code: str = Query(None), error: str = Query(None)):
    """
    Handle Google OAuth2 callback
    """
    if error:
        return RedirectResponse(url=f"{FRONTEND_URL}/auth?error={error}")
    
    if not code:
        return RedirectResponse(url=f"{FRONTEND_URL}/auth?error=no_code")
    
    # In production, exchange code for tokens and get user info
    # For now, redirect to frontend with success
    return RedirectResponse(url=f"{FRONTEND_URL}/auth?oauth=google&status=success")


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
    
    # Generate state for CSRF protection
    state = secrets.token_urlsafe(32)
    
    # GitHub OAuth authorization URL
    params = {
        "client_id": GITHUB_CLIENT_ID,
        "redirect_uri": f"{BACKEND_URL}/oauth/github/callback",
        "scope": "user:email",
        "state": state
    }
    
    github_auth_url = f"https://github.com/login/oauth/authorize?{urlencode(params)}"
    return RedirectResponse(url=github_auth_url)


@router.get("/github/callback")
async def github_callback(code: str = Query(None), error: str = Query(None)):
    """
    Handle GitHub OAuth callback
    """
    if error:
        return RedirectResponse(url=f"{FRONTEND_URL}/auth?error={error}")
    
    if not code:
        return RedirectResponse(url=f"{FRONTEND_URL}/auth?error=no_code")
    
    # In production, exchange code for tokens and get user info
    # For now, redirect to frontend with success
    return RedirectResponse(url=f"{FRONTEND_URL}/auth?oauth=github&status=success")
