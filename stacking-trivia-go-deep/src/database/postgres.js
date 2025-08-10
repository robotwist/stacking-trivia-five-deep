// Database configuration for Railway PostgreSQL
import pg from 'pg'
const { Pool } = pg

// Railway automatically provides DATABASE_URL environment variable
const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/deepstack_trivia'

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

// Export pool for health checks
export { pool }

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Database schema setup
export const initDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        total_score INTEGER DEFAULT 0,
        games_played INTEGER DEFAULT 0,
        best_single_stack INTEGER DEFAULT 0,
        achievements JSONB DEFAULT '[]'::jsonb,
        completed_stacks JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS game_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        session_type VARCHAR(20) NOT NULL, -- 'single-player', 'bar-trivia', 'host-mode'
        total_score INTEGER DEFAULT 0,
        stacks_completed JSONB DEFAULT '[]'::jsonb,
        duration_minutes INTEGER,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS stack_results (
        id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES game_sessions(id),
        stack_name VARCHAR(100) NOT NULL,
        questions_answered INTEGER DEFAULT 0,
        questions_correct INTEGER DEFAULT 0,
        final_score INTEGER DEFAULT 0,
        deeper_mode_attempted BOOLEAN DEFAULT false,
        deeper_mode_completed BOOLEAN DEFAULT false,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS leaderboards (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        category VARCHAR(50) NOT NULL,
        stack_name VARCHAR(100) NOT NULL,
        score INTEGER NOT NULL,
        achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, stack_name)
      );
    `)

    console.log('Database tables initialized successfully')
  } catch (error) {
    console.error('Error initializing database:', error)
  }
}

// User management functions
export const createUser = async (username, email, passwordHash) => {
  try {
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, total_score, games_played, best_single_stack, completed_stacks, created_at',
      [username, email, passwordHash]
    )
    return result.rows[0]
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      if (error.constraint.includes('username')) {
        throw new Error('Username already exists')
      } else if (error.constraint.includes('email')) {
        throw new Error('Email already exists')
      }
    }
    throw error
  }
}

export const getUserByUsername = async (username) => {
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username])
  return result.rows[0]
}

export const getUserById = async (id) => {
  const result = await pool.query('SELECT id, username, email, total_score, games_played, best_single_stack, completed_stacks, created_at FROM users WHERE id = $1', [id])
  return result.rows[0]
}

export const updateUserCompletedStack = async (userId, stackName, score) => {
  try {
    // Get current completed stacks
    const userResult = await pool.query('SELECT completed_stacks, total_score, games_played, best_single_stack FROM users WHERE id = $1', [userId])
    const user = userResult.rows[0]
    
    if (!user) {
      throw new Error('User not found')
    }

    const completedStacks = user.completed_stacks || []
    
    // Check if stack already completed
    if (!completedStacks.includes(stackName)) {
      completedStacks.push(stackName)
      
      // Update user stats
      const newTotalScore = user.total_score + score
      const newGamesPlayed = user.games_played + 1
      const newBestScore = Math.max(user.best_single_stack, score)
      
      const result = await pool.query(
        'UPDATE users SET completed_stacks = $1, total_score = $2, games_played = $3, best_single_stack = $4 WHERE id = $5 RETURNING id, username, email, total_score, games_played, best_single_stack, completed_stacks, created_at',
        [JSON.stringify(completedStacks), newTotalScore, newGamesPlayed, newBestScore, userId]
      )
      
      return result.rows[0]
    }
    
    // If stack already completed, just return current user data
    const result = await pool.query('SELECT id, username, email, total_score, games_played, best_single_stack, completed_stacks, created_at FROM users WHERE id = $1', [userId])
    return result.rows[0]
    
  } catch (error) {
    throw error
  }
}

// Game session management
export const saveGameSession = async (userId, sessionType, totalScore, stacksCompleted, durationMinutes) => {
  const result = await pool.query(
    'INSERT INTO game_sessions (user_id, session_type, total_score, stacks_completed, duration_minutes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [userId, sessionType, totalScore, JSON.stringify(stacksCompleted), durationMinutes]
  )
  
  // Update user's total stats
  await pool.query(
    'UPDATE users SET total_score = total_score + $1, games_played = games_played + 1, best_single_stack = GREATEST(best_single_stack, $2) WHERE id = $3',
    [totalScore, Math.max(...stacksCompleted.map(s => s.score || 0)), userId]
  )
  
  return result.rows[0]
}

// Leaderboard functions
export const updateLeaderboard = async (userId, category, stackName, score) => {
  await pool.query(`
    INSERT INTO leaderboards (user_id, category, stack_name, score) 
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id, stack_name) 
    DO UPDATE SET score = GREATEST(leaderboards.score, $4), achieved_at = CURRENT_TIMESTAMP
  `, [userId, category, stackName, score])
}

export const getLeaderboard = async (stackName = null, limit = 10) => {
  const query = stackName 
    ? `SELECT u.username, l.score, l.achieved_at, l.stack_name 
       FROM leaderboards l 
       JOIN users u ON l.user_id = u.id 
       WHERE l.stack_name = $1 
       ORDER BY l.score DESC, l.achieved_at ASC 
       LIMIT $2`
    : `SELECT u.username, SUM(l.score) as total_score, COUNT(l.stack_name) as stacks_completed
       FROM leaderboards l 
       JOIN users u ON l.user_id = u.id 
       GROUP BY u.id, u.username
       ORDER BY total_score DESC, stacks_completed DESC 
       LIMIT $1`
  
  const params = stackName ? [stackName, limit] : [limit]
  const result = await pool.query(query, params)
  return result.rows
}

export default pool
