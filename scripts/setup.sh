#!/bin/bash

echo "🚀 VERA Setup Script"
echo "===================="
echo ""

# Check Node.js version
echo "Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ required. Current version: $(node -v)"
    exit 1
fi
echo "✅ Node.js version: $(node -v)"
echo ""

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..
echo ""

# Install contract dependencies
echo "📦 Installing contract dependencies..."
cd contracts
npm install
cd ..
echo ""

# Create .env files if they don't exist
echo "📝 Setting up environment files..."

if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env (please configure)"
else
    echo "⚠️  backend/.env already exists"
fi

if [ ! -f frontend/.env ]; then
    cp frontend/.env.example frontend/.env
    echo "✅ Created frontend/.env"
else
    echo "⚠️  frontend/.env already exists"
fi

if [ ! -f contracts/.env ]; then
    cp contracts/.env.example contracts/.env
    echo "✅ Created contracts/.env (please configure)"
else
    echo "⚠️  contracts/.env already exists"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure backend/.env with your Hedera credentials"
echo "2. Configure contracts/.env with your wallet private key"
echo "3. Run 'npm run dev' to start development servers"
echo ""
echo "For detailed instructions, see DEPLOYMENT.md"
