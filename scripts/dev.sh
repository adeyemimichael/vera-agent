#!/bin/bash

echo "🚀 Starting VERA Development Environment"
echo "========================================"
echo ""

# Check if .env files exist
if [ ! -f backend/.env ]; then
    echo "❌ backend/.env not found. Run 'npm run setup' first."
    exit 1
fi

if [ ! -f frontend/.env ]; then
    echo "❌ frontend/.env not found. Run 'npm run setup' first."
    exit 1
fi

echo "✅ Environment files found"
echo ""

# Start backend in background
echo "🔧 Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✨ VERA is running!"
echo ""
echo "📡 Backend:  http://localhost:3000"
echo "🎨 Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
