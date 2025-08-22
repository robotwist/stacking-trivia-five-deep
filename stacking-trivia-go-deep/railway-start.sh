#!/bin/bash
echo "🚂 Starting Railway Backend Server..."
echo "📁 Current directory: $(pwd)"
echo "📦 Node version: $(node --version)"
echo "🔧 NPM version: $(npm --version)"
echo "🌍 Environment: $NODE_ENV"
echo "🔌 Port: $PORT"

# Ensure we're running the server
exec node server.js
