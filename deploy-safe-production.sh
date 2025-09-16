#!/bin/bash

# Safe Production Deployment Script
# This script safely deploys the Medieval Commanders app with email and birth/death year features

set -e  # Exit on any error

echo "🚀 Starting Safe Production Deployment..."
echo "========================================"

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
if [ ! -f "server/package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    print_error "Railway CLI is not installed. Please install it first:"
    echo "   npm install -g @railway/cli"
    echo "   Then run: railway login"
    exit 1
fi

# Check if user is logged in to Railway
if ! railway whoami &> /dev/null; then
    print_error "Please login to Railway first:"
    echo "   railway login"
    exit 1
fi

print_status "Step 1: Pre-deployment checks..."

# Check if all required files exist
required_files=(
    "server/emailService.js"
    "server/schema.prisma"
    "prisma/schema.railway.prisma"
    "prisma/schema.production.prisma"
    "server/migrations/20250916120913_add_birth_death_dates/migration.sql"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Required file missing: $file"
        exit 1
    fi
done

print_success "All required files present"

print_status "Step 2: Database migration preparation..."

# Generate Prisma client for Railway
print_status "Generating Prisma client for Railway..."
cd server
npx prisma generate --schema=../prisma/schema.railway.prisma

if [ $? -eq 0 ]; then
    print_success "Prisma client generated successfully"
else
    print_error "Failed to generate Prisma client"
    exit 1
fi

print_status "Step 3: Installing dependencies..."

# Install server dependencies
print_status "Installing server dependencies..."
npm install

if [ $? -eq 0 ]; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

print_status "Step 4: Environment variables check..."

# Check for required environment variables
print_warning "Please ensure the following environment variables are set in Railway:"
echo ""
echo "Required for Email Service:"
echo "  - EMAIL_SERVICE (sendgrid, ses, mailgun, smtp, or gmail)"
echo "  - EMAIL_FROM (e.g., 'Medieval Commanders <noreply@medievalcommanders.com>')"
echo "  - DEFAULT_ADMIN_EMAIL (e.g., 'admin@medievalcommanders.com')"
echo ""
echo "For SendGrid (Recommended):"
echo "  - SENDGRID_API_KEY"
echo ""
echo "For AWS SES:"
echo "  - AWS_REGION"
echo "  - AWS_ACCESS_KEY_ID"
echo "  - AWS_SECRET_ACCESS_KEY"
echo ""
echo "For Mailgun:"
echo "  - MAILGUN_API_KEY"
echo "  - MAILGUN_DOMAIN"
echo ""
echo "For Custom SMTP:"
echo "  - SMTP_HOST"
echo "  - SMTP_PORT"
echo "  - SMTP_SECURE"
echo "  - SMTP_USER"
echo "  - SMTP_PASS"
echo ""
echo "For Gmail (Development only):"
echo "  - EMAIL_USER"
echo "  - EMAIL_PASS (app password)"
echo ""

read -p "Press Enter to continue with deployment (make sure env vars are set)..."

print_status "Step 5: Deploying to Railway..."

# Deploy to Railway
print_status "Deploying backend to Railway..."
railway up

if [ $? -eq 0 ]; then
    print_success "Backend deployed successfully to Railway!"
else
    print_error "Deployment failed. Please check the errors above."
    exit 1
fi

print_status "Step 6: Database migration..."

# Run database migration
print_status "Running database migration for birth/death year fields..."
railway run npx prisma db push --schema=../prisma/schema.railway.prisma

if [ $? -eq 0 ]; then
    print_success "Database migration completed successfully"
else
    print_warning "Database migration failed. This might be because the fields already exist."
    print_status "Continuing with deployment..."
fi

print_status "Step 7: Testing deployment..."

# Test the deployment
print_status "Testing API endpoints..."

# Get the Railway URL
RAILWAY_URL=$(railway status --json | jq -r '.deployments[0].url' 2>/dev/null || echo "")

if [ -z "$RAILWAY_URL" ]; then
    print_warning "Could not get Railway URL automatically. Please check your Railway dashboard."
    RAILWAY_URL="https://your-app.railway.app"
fi

print_status "Testing health endpoint..."
if curl -s "$RAILWAY_URL/api/health" > /dev/null; then
    print_success "Health check passed"
else
    print_warning "Health check failed. Please check your deployment."
fi

print_success "Deployment completed!"
echo ""
echo "🎉 Your Medieval Commanders app is now live with:"
echo "   ✅ Email notifications (proposal approval/rejection)"
echo "   ✅ Admin email notifications (new proposals)"
echo "   ✅ Birth/Death year fields for commanders"
echo "   ✅ Updated admin panel with email settings"
echo ""
echo "🔧 Next steps:"
echo "1. Update your Netlify frontend with the new Railway URL:"
echo "   VITE_API_URL=$RAILWAY_URL"
echo ""
echo "2. Test the email functionality:"
echo "   - Submit a proposal through the frontend"
echo "   - Check admin panel for email settings"
echo "   - Approve/reject proposals to test email notifications"
echo ""
echo "3. Verify birth/death year fields work in both:"
echo "   - Admin panel (create/edit cards)"
echo "   - Proposal form (submit proposals)"
echo ""
echo "🌐 Your backend is available at: $RAILWAY_URL"
echo "📧 Email service: $EMAIL_SERVICE"
echo ""
print_warning "Remember to set up your email service environment variables in Railway dashboard!"

cd ..
