import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { initDatabase } from './src/database/postgres.js';
import authRoutes from './src/api/auth.js';
import userRoutes from './src/api/user.js';
import gameRoutes from './src/api/game.js';
import stacksRoutes from './src/api/stacks.js';

// Fix for ES modules __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database asynchronously
async function initializeServer() {
  try {
    await initDatabase();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    console.log('Server will continue without database features');
  }
}

// Start database initialization (don't block server startup)
initializeServer();

// API Routes MUST come before static file serving
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/stacks', stacksRoutes);

// Health check endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// TEMPORARY: Direct game leaderboard endpoint for testing
app.get('/api/game/leaderboard-test', (req, res) => {
  res.json({ 
    message: 'DIRECT game endpoint working!',
    leaderboard: [],
    timestamp: new Date().toISOString() 
  });
});

// WORKING GAME ENDPOINTS - Direct implementation for immediate functionality
app.get('/api/game/leaderboard', async (req, res) => {
  try {
    const { pool } = await import('./src/database/postgres.js');
    const result = await pool.query(
      'SELECT username, total_score, games_played FROM users ORDER BY total_score DESC LIMIT 10'
    );
    res.json({ 
      leaderboard: result.rows,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.json({ 
      leaderboard: [],
      message: 'Leaderboard temporarily unavailable',
      timestamp: new Date().toISOString()
    });
  }
});

// Debug endpoint to check registered routes
app.get('/api/debug/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  res.json({ 
    message: 'Registered routes debug info',
    routeCount: routes.length,
    routes: routes.slice(0, 20) // Limit output
  });
});

// Serve static files from dist directory AFTER API routes
app.use(express.static(path.join(__dirname, 'dist')));

// Database health check
app.get('/api/db-health', async (req, res) => {
  try {
    const { pool } = await import('./src/database/postgres.js');
    const client = await pool.connect();
    
    // Test query
    const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
    
    // Check tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    client.release();
    
    res.json({ 
      status: 'Database connected successfully',
      timestamp: new Date().toISOString(),
      current_time: result.rows[0].current_time,
      postgres_version: result.rows[0].postgres_version,
      tables: tables.rows.map(row => row.table_name),
      database_url_exists: !!process.env.DATABASE_URL
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'Database connection failed',
      error: error.message,
      timestamp: new Date().toISOString(),
      database_url_exists: !!process.env.DATABASE_URL
    });
  }
});

// Simple game leaderboard endpoint
app.get('/api/game/leaderboard', async (req, res) => {
  try {
    const { pool } = await import('./src/database/postgres.js');
    const result = await pool.query(`
      SELECT username, total_score, games_played, best_single_stack 
      FROM users 
      WHERE total_score > 0 
      ORDER BY total_score DESC 
      LIMIT 10
    `);
    res.json({ leaderboard: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

// Serve React app for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
