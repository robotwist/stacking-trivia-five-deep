#!/bin/bash

# Development startup script
echo "🚀 Starting DeepStack Trivia Development Server..."

# Check if .env exists, if not create from example
if [ ! -f .env ]; then
    echo "📋 Creating .env file from example..."
    cp .env.example .env
    echo "⚠️  Please update .env with your actual database URL if needed"
fi

# Start backend server
echo "🔧 Starting Express API server on port 3001..."
NODE_ENV=development node server.js &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend dev server
echo "⚡ Starting Vite dev server on port 3000..."
npm run dev &
FRONTEND_PID=$!

# Function to cleanup on exit
cleanup() {
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up trap for cleanup
trap cleanup INT TERM

echo "✅ Development servers running!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:3001"
echo "Press Ctrl+C to stop all servers"

# Wait for background processes
wait
