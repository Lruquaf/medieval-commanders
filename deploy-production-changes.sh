#!/bin/bash

# Production Deployment Script for Medieval Commanders
# This script helps deploy the local development changes to production

echo "🚀 Starting production deployment for Medieval Commanders..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Checking git status..."
if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes. Please commit them first:"
    git status --short
    echo ""
    read -p "Do you want to continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Deployment cancelled"
        exit 1
    fi
fi

print_status "Changes to be deployed:"
echo "✅ Database schema updates (Admin social media fields)"
echo "✅ Enhanced admin panel with social media settings"
echo "✅ New Footer component with dynamic social media links"
echo "✅ Improved sorting and filtering capabilities"
echo "✅ Enhanced responsive design"
echo "✅ Updated API endpoints for admin settings"
echo ""

# Confirm deployment
read -p "Are you ready to deploy these changes to production? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_error "Deployment cancelled"
    exit 1
fi

print_status "Starting deployment process..."

# Step 1: Commit changes
print_status "Step 1: Committing changes..."
git add .
git commit -m "feat: Add social media settings and enhanced admin functionality

- Add social media URL fields to Admin model
- Implement dynamic footer with social media links
- Enhance admin panel with social media settings management
- Improve sorting and filtering capabilities
- Add responsive design improvements
- Update API endpoints for admin settings"

if [ $? -eq 0 ]; then
    print_success "Changes committed successfully"
else
    print_error "Failed to commit changes"
    exit 1
fi

# Step 2: Push to repository
print_status "Step 2: Pushing to repository..."
git push origin main

if [ $? -eq 0 ]; then
    print_success "Changes pushed to repository"
else
    print_error "Failed to push changes"
    exit 1
fi

# Step 3: Build frontend
print_status "Step 3: Building frontend..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Frontend built successfully"
else
    print_error "Frontend build failed"
    exit 1
fi

print_success "🎉 Deployment process completed!"
echo ""
print_status "Next steps:"
echo "1. Check Railway deployment status for backend"
echo "2. Check Netlify deployment status for frontend"
echo "3. Test the new features:"
echo "   - Admin panel social media settings"
echo "   - Footer with social media links"
echo "   - Responsive design on mobile"
echo ""
print_status "Useful URLs:"
echo "• Railway Dashboard: https://railway.app/dashboard"
echo "• Netlify Dashboard: https://app.netlify.com/"
echo "• Health Check: https://your-backend.railway.app/api/health"
echo "• Admin Settings: https://your-backend.railway.app/api/admin/settings"
echo ""
print_warning "Remember to:"
echo "• Run database migration in production"
echo "• Test all functionality after deployment"
echo "• Monitor logs for any errors"
echo ""
print_success "Deployment script completed! 🚀"
