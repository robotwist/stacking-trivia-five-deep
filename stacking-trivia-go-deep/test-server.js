// Minimal test serverapp.listen(PORT, () => {
  console.log(`🧪 Test server running on port ${PORT}`);
  console.log(`Test: http://localhost:${PORT}/test`);
  console.log(`Game leaderboard: http://localhost:${PORT}/api/game/leaderboard`);
}).on('error', (err) => {
  console.error('Server error:', err);
});

// Keep process alive
process.on('SIGTERM', () => {
  console.log('Server shutting down...');
  process.exit(0);
});

export default app;late the game routes issue
import express from 'express';
import cors from 'cors';
import gameRoutes from './src/api/game.js';

const app = express();
const PORT = 3333;

// Basic middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Test server working' });
});

// Game routes (this is what's failing on Railway)
app.use('/api/game', gameRoutes);

// NO catch-all route - to see if game routes work in isolation

app.listen(PORT, () => {
  console.log(`🧪 Test server running on port ${PORT}`);
  console.log(`Test: http://localhost:${PORT}/test`);
  console.log(`Game leaderboard: http://localhost:${PORT}/api/game/leaderboard`);
});

export default app;
