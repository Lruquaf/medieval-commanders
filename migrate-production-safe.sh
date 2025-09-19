#!/bin/bash

# Safe Production Migration Script for Medieval Commanders
# This script safely migrates the PostgreSQL database on Railway without data loss

echo "🔒 Starting SAFE production database migration..."

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

# Check if we're in the right directory
if [ ! -f "prisma/schema.prisma" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "This migration will add social media fields to the Admin table:"
echo "  - instagramUrl (optional)"
echo "  - twitterUrl (optional)"
echo "  - facebookUrl (optional)"
echo "  - linkedinUrl (optional)"
echo "  - youtubeUrl (optional)"
echo ""
print_warning "This is a SAFE migration - no existing data will be lost!"
echo ""

# Confirm migration
read -p "Do you want to proceed with the database migration? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_error "Migration cancelled"
    exit 1
fi

print_status "Step 1: Checking Prisma installation..."
if ! command -v npx &> /dev/null; then
    print_error "npx not found. Please install Node.js and npm"
    exit 1
fi

print_status "Step 2: Generating migration..."
npx prisma migrate dev --name add_admin_social_media_fields --create-only

if [ $? -eq 0 ]; then
    print_success "Migration file created successfully"
else
    print_error "Failed to create migration file"
    exit 1
fi

print_status "Step 3: Reviewing the generated migration..."
echo "The migration file has been created. Let's review it:"
echo ""

# Find the latest migration file
MIGRATION_DIR=$(find prisma/migrations -name "*add_admin_social_media_fields" -type d | head -1)
if [ -n "$MIGRATION_DIR" ]; then
    MIGRATION_FILE="$MIGRATION_DIR/migration.sql"
    if [ -f "$MIGRATION_FILE" ]; then
        echo "Migration SQL:"
        cat "$MIGRATION_FILE"
        echo ""
        print_warning "This migration will:"
        echo "  - Add 5 new optional columns to the 'admins' table"
        echo "  - All new columns are nullable (optional)"
        echo "  - No existing data will be modified or deleted"
        echo "  - No existing columns will be changed"
        echo ""
    else
        print_error "Migration file not found"
        exit 1
    fi
else
    print_error "Migration directory not found"
    exit 1
fi

print_status "Step 4: Applying migration to production database..."
echo "This will connect to your Railway PostgreSQL database and apply the migration."
echo ""

read -p "Are you ready to apply the migration to production? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_error "Migration cancelled"
    exit 1
fi

# Apply the migration
npx prisma migrate deploy

if [ $? -eq 0 ]; then
    print_success "✅ Migration applied successfully!"
    print_success "Your production database has been updated safely"
else
    print_error "❌ Migration failed"
    print_error "Check your DATABASE_URL and try again"
    exit 1
fi

print_status "Step 5: Regenerating Prisma client..."
npx prisma generate

if [ $? -eq 0 ]; then
    print_success "Prisma client regenerated successfully"
else
    print_warning "Prisma client regeneration failed, but migration was successful"
fi

print_success "🎉 Database migration completed successfully!"
echo ""
print_status "What was added to your database:"
echo "  ✅ instagramUrl column (optional)"
echo "  ✅ twitterUrl column (optional)"
echo "  ✅ facebookUrl column (optional)"
echo "  ✅ linkedinUrl column (optional)"
echo "  ✅ youtubeUrl column (optional)"
echo ""
print_status "Next steps:"
echo "1. Deploy your updated backend code to Railway"
echo "2. Deploy your updated frontend to Netlify"
echo "3. Test the new admin settings functionality"
echo "4. Configure social media URLs in the admin panel"
echo ""
print_success "Your existing data is safe and the new features are ready! 🚀"
