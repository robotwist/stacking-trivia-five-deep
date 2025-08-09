# Heroku Setup Guide for DeepStack Trivia

## 1. Database Setup (PostgreSQL)

### Add PostgreSQL to your Heroku app:
```bash
heroku addons:create heroku-postgresql:mini -a your-app-name
```

### Environment Variables:
Heroku automatically provides `DATABASE_URL`, but you can add these for local development:
```bash
heroku config:set NODE_ENV=production -a your-app-name
heroku config:set DATABASE_URL="your-local-postgres-url" # for local testing
```

### Database Initialization:
The database will auto-initialize when you first run the app. The schema includes:

- **users**: Player profiles, scores, achievements
- **game_sessions**: Individual game records
- **stack_results**: Detailed performance per stack
- **leaderboards**: High scores by category/stack

## 2. Build Configuration

### Add to your `package.json`:
```json
{
  "scripts": {
    "build": "vite build",
    "start": "vite preview --port $PORT --host 0.0.0.0",
    "serve": "vite preview --port $PORT --host 0.0.0.0"
  }
}
```

### Create `Procfile`:
```
web: npm run serve
```

## 3. Deployment Commands

### Initial deployment:
```bash
git add .
git commit -m "Phase 8: Enhanced gameplay and database integration"
git push heroku main
```

### Run database migrations (if needed):
```bash
heroku run node -e "import('./src/database/postgres.js').then(db => db.initDatabase())" -a your-app-name
```

## 4. Environment Setup for Local Development

### Install PostgreSQL locally:
```bash
# macOS
brew install postgresql

# Ubuntu
sudo apt install postgresql postgresql-contrib

# Start service
brew services start postgresql  # macOS
sudo service postgresql start   # Ubuntu
```

### Create local database:
```bash
createdb deepstack_trivia
```

### Add to your `.env.local`:
```
DATABASE_URL=postgresql://username:password@localhost:5432/deepstack_trivia
NODE_ENV=development
```

## 5. Production Features Now Available

### User Management:
- Player registration and profiles
- Score persistence across sessions
- Achievement tracking

### Leaderboards:
- Global high scores
- Category-specific rankings
- Stack-specific leaderboards

### Game Analytics:
- Session duration tracking
- Performance analytics
- Usage statistics

## 6. Testing the Integration

### Local Testing:
```bash
npm install
npm run dev
```

### Production Testing:
```bash
heroku logs --tail -a your-app-name
```

## 7. Troubleshooting

### Common Issues:

**Database Connection:**
```bash
heroku config -a your-app-name  # Check DATABASE_URL
heroku pg:info -a your-app-name  # Check DB status
```

**Build Issues:**
```bash
heroku builds:cancel -a your-app-name
git push heroku main --force
```

**Port Issues:**
Make sure your start script uses `$PORT` environment variable that Heroku provides.

## 8. Future Enhancements Available

With PostgreSQL now integrated, you can easily add:
- User authentication (Auth0, Firebase Auth)
- Social features (friend challenges)
- Tournament modes
- Advanced analytics
- API endpoints for mobile apps

Your bar trivia experience is now production-ready with persistent high scores and user tracking!
