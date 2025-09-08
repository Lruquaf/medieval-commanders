#!/bin/bash

echo "🏰 Setting up Medieval Commanders Collection..."

# Create uploads directory
mkdir -p server/uploads

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "1. Run 'npm run server' in one terminal (backend on port 5000)"
echo "2. Run 'npm run dev' in another terminal (frontend on port 3000)"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "Happy collecting! ⚔️"
