"""
AI Engine Service
Groq API integration for intelligent chat (6GB RAM optimized)
Uses Llama-3-8b-8192 via external API (no local model loading)
"""
import os
import re
from typing import List, Dict, Optional
from groq import Groq

# Lazy-load Groq client to avoid initialization errors
_groq_client = None

def get_groq_client():
    """Get or initialize Groq client"""
    global _groq_client
    if _groq_client is None:
        api_key = os.getenv("GROQ_API_KEY", "")
        if not api_key:
            raise ValueError("GROQ_API_KEY environment variable not set")
        _groq_client = Groq(api_key=api_key)
    return _groq_client


def build_system_prompt(gpa: Optional[float], budget: Optional[int], 
                        degree_level: Optional[str], target_country: Optional[str]) -> str:
    """
    Dynamically construct system prompt with user context
    THE BRAIN: Profile-aware AI counsellor instructions
    """
    return f"""You are an AI Study Abroad Counsellor. You are NOT a generic assistant.

CONTEXT:
- User GPA: {gpa if gpa else 'Not provided'}
- Budget: ${budget if budget else 'Not specified'} USD per year
- Degree Level: {degree_level if degree_level else 'Not specified'}
- Target Country: {target_country if target_country else 'Not specified'}

RULES:
1. Be concise and strategic. No generic platitudes.
2. When suggesting universities, format them as: [RENDER_CARD: University Name]
3. Explain RISKS clearly (e.g., "Your GPA is below the 25th percentile").
4. If the user asks for university recommendations, suggest 3-5 options categorized by match tier.
5. Use data-driven reasoning based on the user's profile.
6. If budget is low, prioritize affordable options.
7. If test scores are missing, recommend taking them before applying.

OUTPUT FORMAT:
- For university suggestions: [RENDER_CARD: Stanford University] (use this exact format)
- Regular advice: Plain text, max 3-4 sentences per response.
"""


async def get_ai_response(
    message: str,
    history: List[Dict[str, str]],
    user_profile: Dict[str, any]
) -> tuple[str, List[str]]:
    """
    Get AI response from Groq API
    
    Args:
        message: User's current message
        history: Previous conversation (list of {"role": "user/assistant", "content": "..."})
        user_profile: Dict with gpa, budget, degree_level, target_country
    
    Returns:
        (response_text, render_cards_list)
    """
    try:
        # Build system prompt with user context
        system_prompt = build_system_prompt(
            gpa=user_profile.get("gpa"),
            budget=user_profile.get("budget"),
            degree_level=user_profile.get("degree_level"),
            target_country=user_profile.get("target_country")
        )
        
        # Prepare messages
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add conversation history (limit to last 10 messages for context window)
        for msg in history[-10:]:
            messages.append(msg)
        
        # Add current message
        messages.append({"role": "user", "content": message})
        
        # Call Groq API
        client = get_groq_client()
        chat_completion = client.chat.completions.create(
            messages=messages,
            model="llama-3.3-70b-versatile",
            temperature=0.7,
            max_tokens=1024,
        )
        
        response_text = chat_completion.choices[0].message.content
        
        # Extract university cards (if AI mentioned [RENDER_CARD: UniName])
        render_cards = re.findall(r'\[RENDER_CARD:\s*([^\]]+)\]', response_text)
        
        # Clean response (remove the tags)
        cleaned_response = re.sub(r'\[RENDER_CARD:[^\]]+\]', '', response_text).strip()
        
        return cleaned_response, render_cards
        
    except Exception as e:
        # Fallback response if Groq API fails
        print(f"❌ AI ENGINE ERROR: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return (
            "System Offline: I'm temporarily unavailable. Please try again in a moment.",
            []
        )


async def generate_task_assistance(task_title: str, user_profile: Dict[str, any]) -> str:
    """
    Generate AI assistance for a specific task
    
    Args:
        task_title: The task the user needs help with (e.g., "Draft SOP")
        user_profile: User's profile data
    
    Returns:
        AI-generated guidance/template
    """
    try:
        prompt = f"""You are helping a student with: "{task_title}"

Student Profile:
- GPA: {user_profile.get('gpa', 'Not provided')}
- Degree Level: {user_profile.get('degree_level', 'Not specified')}
- Target Country: {user_profile.get('target_country', 'Not specified')}

Provide a structured template or step-by-step guidance for this task. Be specific and actionable.
"""
        
        client = get_groq_client()
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.8,
            max_tokens=1024,
        )
        
        return chat_completion.choices[0].message.content
        
    except Exception as e:
        return "I'm unable to generate assistance right now. Please try again later."
