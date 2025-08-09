# 🎯 DeepStack Trivia - Authentication & User Management

A sophisticated trivia game with user authentication, score tracking, and stack completion management.

## 🚀 New Features Added

### 🔐 Authentication System
- **Secure signup/login** with JWT tokens
- **Password hashing** using bcrypt
- **Session persistence** across browser refreshes
- **User profile management**

### 📊 User Progress Tracking
- **Score persistence** across sessions 
- **Stack completion tracking** - users won't get the same stack twice
- **Personal statistics** - total score, games played, best scores
- **Progress visualization** in user profile

### 🎮 Enhanced Game Experience
- **Available stacks filter** - only shows uncompleted stacks to logged-in users
- **Completion badges** - visual indicators for completed stacks
- **Score accumulation** - running total across all games
- **Deeper mode tracking** - separate completion tracking for deeper modes

## 🛠️ Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup (Optional for Testing)
For development, the app will work without a database. For full functionality with user persistence:

```bash
# Install PostgreSQL (if not already installed)
# macOS:
brew install postgresql
brew services start postgresql

# Ubuntu/Linux:
sudo apt install postgresql postgresql-contrib
sudo service postgresql start

# Create database
createdb deepstack_trivia
```

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings (optional for testing)
nano .env
```

### 4. Run Development Server
```bash
# Option 1: Use the convenient development script
./dev.sh

# Option 2: Manual startup
# Terminal 1 - Backend API server
NODE_ENV=development node server.js

# Terminal 2 - Frontend dev server  
npm run dev
```

## 🌐 Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/api/health

## 📱 How to Use

### For New Users
1. **Click "Sign In"** in the top-right corner
2. **Switch to "Sign up"** to create an account
3. **Fill in** username, email, and password
4. **Start playing** - your progress will be automatically saved

### For Returning Users
1. **Click "Sign In"** and enter your credentials
2. **View your profile** by clicking your avatar
3. **See your stats** - total score, games played, best score
4. **Only see uncompleted stacks** in the category selection

### Game Features
- ✅ **Completed stacks are hidden** from category views
- 📈 **Scores accumulate** across all completed stacks
- 🏆 **Best single-stack score** is tracked
- 🎯 **Both regular and deeper modes** are tracked separately

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Sign in
- `GET /api/auth/verify` - Verify token validity

### User Management
- `GET /api/user/profile` - Get user profile
- `GET /api/user/completed-stacks` - Get list of completed stacks
- `POST /api/user/complete-stack` - Mark stack as completed
- `GET /api/user/available-stacks` - Get available (uncompleted) stacks

## 🗄️ Database Schema

### Users Table
- `id` - Unique user identifier
- `username` - Unique username (3-50 chars)
- `email` - User email address
- `password_hash` - Securely hashed password
- `total_score` - Cumulative score across all games
- `games_played` - Number of completed games
- `best_single_stack` - Highest score in a single stack
- `completed_stacks` - JSON array of completed stack names
- `created_at` - Account creation timestamp

### Game Sessions & Leaderboards
- Full session tracking for analytics
- Stack-specific and global leaderboards
- Performance metrics and completion rates

## 🔒 Security Features

- **JWT tokens** with 7-day expiration
- **Bcrypt password hashing** with salt rounds
- **Input validation** and sanitization
- **SQL injection protection** via parameterized queries
- **CORS configuration** for cross-origin requests

## 🎨 UI/UX Improvements

- **Victorian-themed** authentication modals
- **Responsive design** for all screen sizes
- **Dark mode support** throughout auth system
- **Smooth animations** and transitions
- **Error handling** with user-friendly messages

## 📈 Performance Optimizations

- **JWT token caching** in localStorage
- **React.memo** optimizations maintained
- **API response caching** for user data
- **Lazy loading** of authentication components
- **Database connection pooling**

## 🚀 Production Deployment

### Environment Variables
Set these in your hosting provider:
```bash
NODE_ENV=production
JWT_SECRET=your-secure-random-secret-key
DATABASE_URL=your-production-database-url
```

### Build Commands
```bash
npm run build  # Build frontend
npm start      # Start production server
```

## 🤝 Contributing

The authentication system is fully modular and extensible:
- Add social login providers (Google, GitHub, etc.)
- Implement password reset functionality
- Add user roles and permissions
- Extend user profiles with avatars/preferences

## 📝 Notes

- Users can play without accounts (guest mode)
- Authentication enhances but doesn't restrict core gameplay
- All existing performance optimizations preserved
- Database schema supports future enhancements (tournaments, social features)
- Ready for production deployment with proper environment configuration

---

**Ready to stack some trivia?** 🧠⚡
