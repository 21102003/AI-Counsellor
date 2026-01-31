# AI Counsellor - Deployment Guide

## 🚀 Quick Deployment Steps

### Option 1: Render.com (Backend) + Vercel (Frontend) - Recommended

#### Step 1: Deploy Backend to Render

1. **Create GitHub Repository**
   ```bash
   cd D:\AI_Counsellor
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Push to GitHub**
   - Create a new repo on github.com
   - Push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/ai-counsellor.git
   git push -u origin main
   ```

3. **Deploy on Render.com**
   - Go to [render.com](https://render.com) and sign up
   - Click "New" → "Web Service"
   - Connect your GitHub repo
   - Configure:
     - **Root Directory**: `Backend`
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Add Environment Variables:
     - `SECRET_KEY`: Generate with `openssl rand -hex 32`
     - `GROQ_API_KEY`: Your Groq API key
     - `DATABASE_URL`: (see Database section below)
     - `FRONTEND_URL`: Your Vercel URL (add after deploying frontend)
     - `ALLOWED_ORIGINS`: Your Vercel URL

4. **Note your Backend URL** (e.g., `https://ai-counsellor-api.onrender.com`)

#### Step 2: Set Up Database (Supabase - Free PostgreSQL)

1. Go to [supabase.com](https://supabase.com) and create account
2. Create new project
3. Go to Settings → Database → Connection string
4. Copy the "URI" connection string
5. Add it to Render as `DATABASE_URL`

#### Step 3: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click "Import Project" → Select your repo
3. Configure:
   - **Root Directory**: `Frontend`
   - **Framework Preset**: Next.js (auto-detected)
4. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL`: Your Render backend URL (e.g., `https://ai-counsellor-api.onrender.com`)
5. Deploy!

#### Step 4: Update Backend CORS

After getting your Vercel URL, update Render environment variables:
- `FRONTEND_URL`: `https://your-app.vercel.app`
- `ALLOWED_ORIGINS`: `https://your-app.vercel.app`

---

### Option 2: Railway (Backend + Database) + Vercel (Frontend)

1. **Railway.app** (Backend + PostgreSQL in one place)
   - Go to [railway.app](https://railway.app)
   - Create new project
   - Add PostgreSQL database (free)
   - Add new service from GitHub (Backend folder)
   - Railway auto-detects Python and sets up

2. **Vercel** (Frontend - same as above)

---

## 🔑 Environment Variables Checklist

### Backend (Render/Railway)
| Variable | Description | Example |
|----------|-------------|---------|
| `SECRET_KEY` | JWT signing key | `openssl rand -hex 32` |
| `DATABASE_URL` | PostgreSQL URL | `postgresql://user:pass@host:5432/db` |
| `GROQ_API_KEY` | AI API key | `gsk_xxx...` |
| `FRONTEND_URL` | Vercel URL | `https://ai-counsellor.vercel.app` |
| `ALLOWED_ORIGINS` | CORS origins | `https://ai-counsellor.vercel.app` |

### Frontend (Vercel)
| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend URL | `https://ai-counsellor-api.onrender.com` |

---

## 🗄️ Free Database Options

| Provider | Free Tier | Best For |
|----------|-----------|----------|
| **Supabase** | 500MB, 2 projects | Best PostgreSQL |
| **Neon** | 3GB | Serverless PostgreSQL |
| **Railway** | $5 free credits | Easy setup |
| **PlanetScale** | 5GB | MySQL (if needed) |

---

## ⚡ Quick Commands

```bash
# Generate secure secret key
openssl rand -hex 32

# Or with Python
python -c "import secrets; print(secrets.token_hex(32))"
```

---

## 🔧 Troubleshooting

### CORS Errors
- Make sure `FRONTEND_URL` and `ALLOWED_ORIGINS` match your Vercel URL exactly
- Include `https://` prefix

### Database Connection Errors
- Ensure DATABASE_URL uses `postgresql://` not `postgres://`
- Check if database is active (Supabase pauses inactive projects)

### 500 Errors on Backend
- Check Render logs for specific error
- Ensure all environment variables are set
- Verify GROQ_API_KEY is valid

---

## 📱 Your Live URLs

After deployment, your app will be at:
- **Frontend**: `https://your-project.vercel.app`
- **Backend API**: `https://your-project.onrender.com`
- **API Docs**: `https://your-project.onrender.com/docs`
