import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';

// Fix for ES modules __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from dist directory
app.use(express.static(join(__dirname, 'dist')));

// Basic health check (Railway requirement)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Stacking Trivia PWA',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Serve PWA manifest
app.get('/manifest.json', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'manifest.json'));
});

// Serve service worker
app.get('/sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(join(__dirname, 'dist', 'sw.js'));
});

// API endpoint to test server functionality
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Server is working correctly',
    features: ['PWA', 'Static File Serving', 'Health Check'],
    timestamp: new Date().toISOString()
  });
});

// Catch all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Stacking Trivia PWA Server running on port ${PORT}`);
  console.log(`📱 PWA ready at http://localhost:${PORT}`);
  console.log(`💝 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'production'}`);
});

export default app;
