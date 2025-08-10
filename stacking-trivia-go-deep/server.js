import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { initDatabase } from './src/database/postgres.js';
import authRoutes from './src/api/auth.js';
import userRoutes from './src/api/user.js';
import gameRoutes from './src/api/game.js';

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

// Health check endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
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
