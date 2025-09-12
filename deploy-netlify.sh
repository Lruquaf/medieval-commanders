#!/bin/bash

# Netlify Deployment Script
# This script helps prepare the project for Netlify deployment

echo "🚀 Preparing Medieval Commanders Collection for Netlify deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building the project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo ""
    echo "📋 Next steps for Netlify deployment:"
    echo "1. Go to https://netlify.com and create a new site from Git"
    echo "2. Connect your GitHub repository"
    echo "3. Set the environment variable VITE_API_URL to your Railway backend URL"
    echo "4. Deploy!"
    echo ""
    echo "🔗 Your Railway backend URL should look like:"
    echo "   https://medieval-commanders-production.up.railway.app"
    echo ""
    echo "📖 For detailed instructions, see NETLIFY_DEPLOYMENT.md"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi
