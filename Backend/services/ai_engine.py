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
    return f"""You are an AI Study Abroad Counsellor specializing in helping students find the right universities. You are NOT a generic assistant.

USER PROFILE:
- GPA: {gpa if gpa else 'Not provided'}
- Annual Budget: ${budget if budget else 'Not specified'} USD
- Degree Level: {degree_level if degree_level else 'Not specified'}
- Target Country: {target_country if target_country else 'Any'}

UNIVERSITY DATABASE (Use these real universities in your recommendations):

USA - Computer Science/Engineering:
- MIT (Tuition: $57,986, Accept Rate: 4%)
- Stanford University (Tuition: $56,169, Accept Rate: 4%)
- Carnegie Mellon (Tuition: $58,924, Accept Rate: 13%)
- UC Berkeley (Tuition: $14,312 in-state/$44,066 out-of-state, Accept Rate: 11%)
- Georgia Tech (Tuition: $12,682 in-state/$33,794 out-of-state, Accept Rate: 17%)
- University of Illinois Urbana-Champaign (Tuition: $34,316, Accept Rate: 45%)
- Purdue University (Tuition: $28,794, Accept Rate: 53%)
- Arizona State University (Tuition: $29,438, Accept Rate: 88%)
- University of Texas at Dallas (Tuition: $24,516, Accept Rate: 87%)
- San Jose State University (Tuition: $19,622, Accept Rate: 70%)

USA - Business/MBA:
- Harvard Business School (Tuition: $74,000, Accept Rate: 11%)
- Wharton (Tuition: $84,874, Accept Rate: 21%)
- Indiana University Kelley (Tuition: $27,000, Accept Rate: 35%)
- Arizona State W.P. Carey (Tuition: $29,000, Accept Rate: 45%)

UK:
- University of Oxford (Tuition: £32,000, Accept Rate: 14%)
- Imperial College London (Tuition: £35,100, Accept Rate: 12%)
- University of Manchester (Tuition: £27,000, Accept Rate: 58%)
- University of Birmingham (Tuition: £25,740, Accept Rate: 77%)

Canada:
- University of Toronto (Tuition: CAD$58,160, Accept Rate: 43%)
- University of British Columbia (Tuition: CAD$42,803, Accept Rate: 52%)
- University of Waterloo (Tuition: CAD$54,200, Accept Rate: 53%)

Germany (Low-cost options):
- TU Munich (Tuition: ~€300/semester, Accept Rate: 8%)
- RWTH Aachen (Tuition: ~€300/semester, Accept Rate: 30%)
- TU Berlin (Tuition: ~€300/semester, Accept Rate: 25%)

RULES:
1. ALWAYS list actual university names with specific details (tuition, acceptance rate).
2. Categorize suggestions into:
   - **Reach Schools** (acceptance rate < 20% or GPA requirement higher than user's)
   - **Match Schools** (acceptance rate 20-60%, realistic based on profile)
   - **Safety Schools** (acceptance rate > 60%, good chance of admission)
3. Be realistic about budget constraints. If budget is ${budget}, exclude universities clearly over budget.
4. Use markdown formatting: **bold** for headers, bullet points for lists.
5. If test scores (GRE/IELTS/TOEFL) are missing, mention they're typically required.
6. Give specific, actionable advice. No generic platitudes.

OUTPUT FORMAT:
Use proper markdown:
- **Bold** for categories and important terms
- Bullet points for university lists
- Include tuition and acceptance rate for each suggestion
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
