// Minimal server to test game routes issue
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Test API route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API working', timestamp: new Date().toISOString() });
});

// Simple game leaderboard endpoint (no database, just test)
app.get('/api/game/leaderboard', (req, res) => {
  res.json({ 
    leaderboard: [
      { username: 'test-user', score: 100, rank: 1 }
    ],
    message: 'Game API working!',
    timestamp: new Date().toISOString()
  });
});

// Serve static files AFTER API routes
app.use(express.static('./dist'));

// Catch-all for SPA
app.get('*', (req, res) => {
  res.sendFile('./dist/index.html', { root: '.' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Test server running on port ${PORT}`);
  console.log(`🧪 Test API: http://localhost:${PORT}/api/test`);
  console.log(`🎮 Game API: http://localhost:${PORT}/api/game/leaderboard`);
});

export default app;
