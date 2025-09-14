#!/bin/bash

echo "🔧 Setting up Local Development Environment"
echo "==========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "📦 Installing server dependencies..."
npm install

echo "📁 Creating uploads directory..."
mkdir -p uploads

echo "🗄️ Setting up local database..."
# Copy example environment file
if [ ! -f .env ]; then
    cp env.local.example .env
    echo "✅ Created .env file from example"
else
    echo "⚠️  .env file already exists"
fi

echo "🔄 Generating Prisma client for local development..."
npx prisma generate --schema=./schema.local.prisma

echo "🏗️  Running database migrations..."
npx prisma migrate dev --schema=./schema.local.prisma --name init

echo "🌱 Seeding database with sample data..."
node seed-local.js

echo ""
echo "✅ Local development environment is ready!"
echo ""
echo "🚀 To start the local server, run:"
echo "   npm run dev:local"
echo ""
echo "📍 Server will be available at: http://localhost:5001"
echo "🗄️ Database: SQLite (./dev.db)"
echo "📁 Uploads: ./uploads"
echo ""
