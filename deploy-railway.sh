#!/bin/bash

# Railway Backend Deployment Script
# This script deploys the updated backend to Railway

echo "🚀 Deploying Medieval Commanders Backend to Railway..."

# Check if we're in the right directory
if [ ! -f "server/package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI is not installed. Please install it first:"
    echo "   npm install -g @railway/cli"
    echo "   Then run: railway login"
    exit 1
fi

# Check if user is logged in to Railway
if ! railway whoami &> /dev/null; then
    echo "❌ Please login to Railway first:"
    echo "   railway login"
    exit 1
fi

echo "📦 Installing server dependencies..."
cd server
npm install

echo "🔨 Building and deploying to Railway..."
railway up

if [ $? -eq 0 ]; then
    echo "✅ Backend deployed successfully to Railway!"
    echo ""
    echo "🔧 Next steps:"
    echo "1. Check your Railway dashboard for the deployment status"
    echo "2. Verify the CORS configuration is working"
    echo "3. Test your Netlify frontend again"
    echo ""
    echo "🌐 Your backend should be available at:"
    echo "   https://medieval-commanders-production.up.railway.app"
else
    echo "❌ Deployment failed. Please check the errors above."
    exit 1
fi
