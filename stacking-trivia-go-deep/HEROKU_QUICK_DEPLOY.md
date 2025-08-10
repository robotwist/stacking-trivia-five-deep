# Heroku Deployment Configuration

## Quick Heroku Setup for Full Backend

### 1. Install Heroku CLI
```bash
# Install Heroku CLI if not already installed
curl https://cli-assets.heroku.com/install.sh | sh
```

### 2. Create Heroku App
```bash
heroku create stacking-trivia-backend
heroku addons:create heroku-postgresql:mini
```

### 3. Configure Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_jwt_secret_here
# DATABASE_URL automatically set by heroku-postgresql
```

### 4. Deploy
```bash
git push heroku production-build:main
```

### 5. Initialize Database
```bash
heroku run npm run db:init
```

## Alternative: Railway Fix

If Railway is preferred, here's what to check:
1. Project connected to correct GitHub repo?
2. Environment variables configured?
3. PostgreSQL addon enabled?
4. Correct build branch selected?

## Current Status Summary

**Frontend (Working):** Netlify - PWA with local storage
**Backend (Needed):** Railway (broken) → Heroku (alternative)

**Quick Decision:**
- **Immediate**: Keep Netlify for PWA + add Supabase for backend
- **Full Control**: Deploy to Heroku with PostgreSQL  
- **Original Plan**: Fix Railway deployment issues
