# AI Counsellor Backend

## The Neural Core
FastAPI backend optimized for 6GB RAM using SQLite and Groq API.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Setup Environment
```bash
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
```

### 3. Run Server
```bash
uvicorn main:app --reload --port 8000
```

### 4. Seed Database (First Time Only)
```bash
# Navigate to http://localhost:8000/universities/seed
```

## 📁 Architecture

```
Backend/
├── main.py              # FastAPI app initialization
├── models.py            # SQLAlchemy database models
├── schemas.py           # Pydantic validation schemas
├── database.py          # Async DB engine
├── dependencies.py      # Auth middleware
├── routes/
│   ├── auth.py          # Signup/Login (JWT)
│   ├── profile.py       # Profile management
│   ├── chat.py          # AI Chat interface
│   ├── universities.py  # Recommendations & locking
│   └── tasks.py         # Task management
└── services/
    └── ai_engine.py     # Groq API integration
```

## 🔑 API Endpoints

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login and get JWT token

### Profile
- `POST /profile/update` - Update profile (auto-calculates stage)
- `GET /profile` - Get current user's profile

### Chat
- `POST /chat/message` - Send message to AI counsellor

### Universities
- `GET /universities/recommend` - Get personalized recommendations
- `POST /universities/lock/{id}` - Lock university for application
- `GET /universities/shortlist` - Get shortlisted universities
- `GET /universities/seed` - Seed database (first time setup)

### Tasks
- `GET /tasks` - Get all tasks
- `PATCH /tasks/{id}` - Update task status
- `POST /tasks/assist` - Get AI assistance for task

## 🧠 AI Features

- **Profile-Aware**: AI knows user's GPA, budget, test scores
- **Smart Recommendations**: Filters universities by budget, calculates match tiers
- **Task Assistance**: Generates SOP templates, guides based on profile
- **UI Card Triggers**: `[RENDER_CARD: UniName]` signals frontend to show cards

## 🗄️ Database Schema

- **User**: Authentication data
- **Profile**: Academic info, preferences, current stage
- **University**: 20 pre-seeded universities
- **Shortlist**: User's selected universities with locking
- **Tasks**: Application tasks with AI assistance

## 🔒 Security

- Bcrypt password hashing
- JWT token authentication
- Protected routes with Bearer token

## 💾 Memory Optimization (6GB RAM)

- SQLite instead of PostgreSQL
- Groq API (no local model loading)
- Async operations throughout
- Efficient SQL queries with indexed fields

## 🎯 Stages

1. **Onboarding**: Profile incomplete
2. **Discovery**: Profile complete, exploring universities
3. **Shortlist**: Has shortlisted universities
4. **Applications**: Locked universities, working on tasks

## 📝 Environment Variables

Create `.env` file:
```
SECRET_KEY=your-secret-key
GROQ_API_KEY=your-groq-api-key
DATABASE_URL=sqlite+aiosqlite:///./counsellor.db
```

## 🧪 Testing

Visit `http://localhost:8000/docs` for interactive API documentation (Swagger UI).
