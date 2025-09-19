#!/bin/bash

# Railway Production Migration Script
# This script migrates your Railway PostgreSQL database safely

echo "🚀 Starting Railway production database migration..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

print_status "This script will help you migrate your Railway PostgreSQL database safely."
echo ""
print_status "You have several options:"
echo "1. Use Railway CLI (if installed)"
echo "2. Use direct DATABASE_URL connection"
echo "3. Manual migration via Railway dashboard"
echo ""

# Check for Railway CLI
if command -v railway &> /dev/null; then
    print_success "Railway CLI found!"
    echo ""
    print_status "Option 1: Using Railway CLI"
    echo "This will connect to your Railway database directly."
    echo ""
    read -p "Do you want to use Railway CLI? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Logging into Railway..."
        railway login
        
        print_status "Linking to your project..."
        railway link
        
        print_status "Setting DATABASE_URL from Railway..."
        railway variables --json | jq -r '.DATABASE_URL' > .env.production
        
        print_status "Running migration with Railway database..."
        DATABASE_URL=$(railway variables --json | jq -r '.DATABASE_URL') npx prisma migrate deploy
        
        if [ $? -eq 0 ]; then
            print_success "✅ Migration completed successfully!"
        else
            print_error "❌ Migration failed"
        fi
        exit 0
    fi
fi

# Option 2: Manual DATABASE_URL
print_status "Option 2: Manual DATABASE_URL"
echo ""
print_warning "You need to provide your Railway PostgreSQL connection string."
echo "You can find this in your Railway dashboard:"
echo "1. Go to your project dashboard"
echo "2. Click on your PostgreSQL service"
echo "3. Go to 'Connect' tab"
echo "4. Copy the 'Connection String'"
echo ""

read -p "Do you want to enter your DATABASE_URL manually? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    print_status "Enter your Railway PostgreSQL connection string:"
    read -p "DATABASE_URL: " DATABASE_URL
    
    if [ -z "$DATABASE_URL" ]; then
        print_error "DATABASE_URL cannot be empty"
        exit 1
    fi
    
    print_status "Testing connection..."
    DATABASE_URL="$DATABASE_URL" npx prisma db pull --force
    
    if [ $? -eq 0 ]; then
        print_success "✅ Connection successful!"
        
        print_status "Running migration..."
        DATABASE_URL="$DATABASE_URL" npx prisma migrate deploy
        
        if [ $? -eq 0 ]; then
            print_success "✅ Migration completed successfully!"
        else
            print_error "❌ Migration failed"
        fi
    else
        print_error "❌ Connection failed. Please check your DATABASE_URL"
    fi
    exit 0
fi

# Option 3: Manual instructions
print_status "Option 3: Manual Migration via Railway Dashboard"
echo ""
print_warning "If the above options don't work, you can run the migration manually:"
echo ""
echo "1. Go to your Railway project dashboard"
echo "2. Click on your backend service"
echo "3. Go to 'Deployments' tab"
echo "4. Click on the latest deployment"
echo "5. Go to 'Logs' tab"
echo "6. Click 'Open Shell' or 'Connect'"
echo "7. Run these commands in the shell:"
echo ""
echo "   npx prisma migrate deploy"
echo "   npx prisma generate"
echo ""
echo "Or you can run the migration from your local machine with:"
echo "   DATABASE_URL='your-railway-connection-string' npx prisma migrate deploy"
echo ""

print_status "Migration script completed. Choose one of the options above to proceed."
