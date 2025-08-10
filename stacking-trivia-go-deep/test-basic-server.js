// Minimal test server to isolate the game routes issue
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3333;

// Basic middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Test server working' });
});

// Let's first test without game routes to see if server works
console.log('Starting test server...');

app.listen(PORT, () => {
  console.log(`🧪 Test server running on port ${PORT}`);
  console.log(`Test: http://localhost:${PORT}/test`);
});
