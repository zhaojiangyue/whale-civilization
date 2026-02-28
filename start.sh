#!/bin/bash
# 🐋 Whale Civilization 3 — Launch Script
# Run this to start the game in your browser!

cd "$(dirname "$0")"

echo "🐋 Whale Civilization 3"
echo "========================"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🌊 Starting game server..."
echo "   Open http://localhost:5174 in your browser"
echo "   Press Ctrl+C to stop"
echo ""

npx vite --port 5174
