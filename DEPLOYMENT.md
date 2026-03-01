# FullFill Deployment Guide

This guide covers deploying FullFill to production so it's publicly accessible.

## 🚀 Recommended Setup: Vercel + Railway

**Cost:** Free tier available for both
**Setup time:** 15-20 minutes
**Best for:** Quick deployment, MVP, demos

---

## Step 1: Deploy Backend on Railway

Railway provides free PostgreSQL, Redis, and Python hosting.

### 1.1 Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project"

### 1.2 Deploy Backend
1. Click "Deploy from GitHub repo"
2. Select `ken-ngu/fullfill`
3. Railway will auto-detect Docker setup

### 1.3 Configure Environment Variables
In Railway dashboard, add:

```bash
# Database (Railway provides automatically)
DATABASE_URL=postgresql://...  # Auto-filled by Railway

# Redis (Railway provides automatically)
REDIS_URL=redis://...  # Auto-filled by Railway

# CORS (Update after getting Vercel domain)
CORS_ORIGINS=https://fullfill.vercel.app,http://localhost:5173
```

### 1.4 Expose Backend Service
1. Go to Settings → Networking
2. Click "Generate Domain"
3. Copy the domain (e.g., `fullfill-backend.up.railway.app`)
4. Note this URL for frontend configuration

### 1.5 Run Database Migration
In Railway dashboard:
1. Go to your backend service
2. Open "Deployments" tab
3. Click "..." → "Run Command"
4. Run: `alembic upgrade head`

---

## Step 2: Deploy Frontend on Vercel

### 2.1 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New" → "Project"

### 2.2 Import Repository
1. Select `ken-ngu/fullfill`
2. Vercel auto-detects Vite configuration

### 2.3 Configure Build Settings
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 2.4 Add Environment Variable
In Vercel project settings → Environment Variables:

```bash
VITE_API_BASE_URL=https://fullfill-backend.up.railway.app
```

(Use your Railway backend URL from Step 1.4)

### 2.5 Deploy
1. Click "Deploy"
2. Wait 2-3 minutes
3. Your app will be live at `https://fullfill.vercel.app`

### 2.6 Update Backend CORS
Go back to Railway, update `CORS_ORIGINS`:
```bash
CORS_ORIGINS=https://fullfill.vercel.app,https://fullfill-*.vercel.app
```

---

## Step 3: Set Up Custom Domain (Optional)

### On Vercel:
1. Go to Settings → Domains
2. Add your domain (e.g., `fullfill.app`)
3. Follow DNS configuration instructions

### On Railway:
1. Go to Settings → Domains
2. Add `api.fullfill.app` as custom domain
3. Update DNS CNAME record

---

## 🐳 Alternative: Docker Compose on VPS

**Cost:** $5-10/month (DigitalOcean, Linode)
**Setup time:** 30-45 minutes
**Best for:** Full control, production-ready

### Quick Deploy on DigitalOcean

1. **Create Droplet:**
   - Ubuntu 22.04
   - $6/month plan (1GB RAM)
   - Enable Docker during creation

2. **SSH into server:**
```bash
ssh root@your-droplet-ip
```

3. **Clone repository:**
```bash
git clone https://github.com/ken-ngu/fullfill.git
cd fullfill
```

4. **Create production docker-compose:**
```bash
cat > docker-compose.prod.yml <<'EOF'
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    environment:
      - VITE_API_BASE_URL=http://your-droplet-ip:8000
    depends_on:
      - backend
    restart: unless-stopped

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://fullfill:password@db:5432/fullfill
      - REDIS_URL=redis://redis:6379
      - CORS_ORIGINS=http://your-droplet-ip,https://your-domain.com
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: fullfill
      POSTGRES_PASSWORD: password
      POSTGRES_DB: fullfill
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U fullfill"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
    restart: unless-stopped

volumes:
  postgres_data:
EOF
```

5. **Start services:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

6. **Run migrations:**
```bash
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

7. **Set up Nginx with SSL (recommended):**
```bash
apt update && apt install -y nginx certbot python3-certbot-nginx

# Configure Nginx
cat > /etc/nginx/sites-available/fullfill <<'EOF'
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

ln -s /etc/nginx/sites-available/fullfill /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx

# Get SSL certificate
certbot --nginx -d your-domain.com
```

---

## 🌐 Alternative: Render.com (All-in-One)

**Cost:** Free tier available
**Setup time:** 20 minutes
**Best for:** Simple setup, managed services

### Deploy on Render:

1. **Create Render account:** https://render.com
2. **Create PostgreSQL database:**
   - Dashboard → New → PostgreSQL
   - Select free tier
   - Copy connection string

3. **Create Redis instance:**
   - Dashboard → New → Redis
   - Select free tier
   - Copy connection string

4. **Deploy Backend:**
   - Dashboard → New → Web Service
   - Connect GitHub repo `ken-ngu/fullfill`
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`
   - Add environment variables (DATABASE_URL, REDIS_URL, CORS_ORIGINS)

5. **Deploy Frontend:**
   - Dashboard → New → Static Site
   - Connect GitHub repo `ken-ngu/fullfill`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Add environment variable: `VITE_API_BASE_URL=https://your-backend.onrender.com`

---

## 📊 Cost Comparison

| Option | Frontend | Backend | Database | Redis | Total/Month |
|--------|----------|---------|----------|-------|-------------|
| **Vercel + Railway** | Free | Free | Free | Free | **$0** |
| **DigitalOcean VPS** | Included | Included | Included | Included | **$6** |
| **Render.com** | Free | Free | Free | Free | **$0** |
| **AWS (production)** | $0.50 | $25 | $15 | $15 | **$55** |

---

## 🔒 Production Checklist

Before going live:

- [ ] Set strong DATABASE passwords
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure CORS properly (don't use `*`)
- [ ] Set up error monitoring (Sentry, LogRocket)
- [ ] Enable rate limiting on API
- [ ] Set up database backups
- [ ] Add health check endpoints
- [ ] Configure CDN (Cloudflare) for frontend
- [ ] Set up analytics (Google Analytics, Plausible)
- [ ] Review security headers
- [ ] Add API authentication if needed
- [ ] Set up continuous deployment (CI/CD)

---

## 🚨 Environment Variables Reference

### Backend (.env)
```bash
DATABASE_URL=postgresql://user:password@host:5432/dbname
REDIS_URL=redis://host:6379
CORS_ORIGINS=https://fullfill.vercel.app
PORT=8000
```

### Frontend (.env)
```bash
VITE_API_BASE_URL=https://api.fullfill.app
```

---

## 📞 Support

Having deployment issues?
- Check Railway/Vercel logs for error messages
- Verify environment variables are set correctly
- Ensure CORS origins match your domains
- Test API endpoint directly: `curl https://your-backend.onrender.com/health`

---

## 🎉 Quick Start (Fastest)

**Want it live in 10 minutes?**

1. Fork repo on GitHub
2. Sign up for Railway (https://railway.app)
3. Click "Deploy from GitHub" → select your fork
4. Railway auto-deploys everything (backend + db + redis)
5. Sign up for Vercel (https://vercel.com)
6. Click "Import Project" → select your fork → set root to `frontend`
7. Add environment variable: `VITE_API_BASE_URL=<your-railway-backend-url>`
8. Done! ✨

Your app is live and accessible worldwide.
