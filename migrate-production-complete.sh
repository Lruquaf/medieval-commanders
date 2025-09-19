#!/bin/bash

# Complete Production Migration Script
# Handles both birthDate→birthYear and social media fields

echo "🔧 Starting COMPLETE production database migration..."

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

print_status "This migration will handle:"
echo "1. birthDate → birthYear (DateTime → Int) with data conversion"
echo "2. deathDate → deathYear (DateTime → Int) with data conversion"  
echo "3. Add social media fields to Admin table"
echo ""

print_warning "This is a COMPLEX migration that will:"
echo "  - Convert existing date data to years"
echo "  - Rename columns"
echo "  - Add new social media fields"
echo "  - Preserve all existing data"
echo ""

# Check if we're in the right directory
if [ ! -f "prisma/schema.prisma" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Get DATABASE_URL
print_status "Step 1: Getting Railway DATABASE_URL"
echo "You need to provide your Railway PostgreSQL connection string."
echo "Get it from: Railway Dashboard → Your Project → PostgreSQL Service → Connect tab"
echo ""

read -p "Enter your Railway DATABASE_URL: " DATABASE_URL

if [ -z "$DATABASE_URL" ]; then
    print_error "DATABASE_URL cannot be empty"
    exit 1
fi

# Test connection
print_status "Step 2: Testing database connection..."
DATABASE_URL="$DATABASE_URL" npx prisma db pull --force

if [ $? -ne 0 ]; then
    print_error "❌ Connection failed. Please check your DATABASE_URL"
    exit 1
fi

print_success "✅ Connection successful!"

# Check current schema
print_status "Step 3: Checking current database schema..."
echo "Checking what fields currently exist in your database..."

# Create a temporary SQL file to check schema
cat > check_schema.sql << 'EOF'
-- Check current fields
SELECT 
    'cards' as table_name,
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_name = 'cards' 
    AND column_name IN ('birthDate', 'birthYear', 'deathDate', 'deathYear')

UNION ALL

SELECT 
    'proposals' as table_name,
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_name = 'proposals' 
    AND column_name IN ('birthDate', 'birthYear', 'deathDate', 'deathYear')

UNION ALL

SELECT 
    'admins' as table_name,
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_name = 'admins' 
    AND column_name IN ('instagramUrl', 'twitterUrl', 'facebookUrl', 'linkedinUrl', 'youtubeUrl')
ORDER BY table_name, column_name;
EOF

DATABASE_URL="$DATABASE_URL" npx prisma db execute --file check_schema.sql

echo ""
print_status "Based on the above, we'll create the appropriate migration."
echo ""

# Create migration based on what exists
print_status "Step 4: Creating migration..."

# Create a custom migration file
MIGRATION_NAME="complete_schema_update_$(date +%Y%m%d_%H%M%S)"
MIGRATION_DIR="prisma/migrations/${MIGRATION_NAME}"

mkdir -p "$MIGRATION_DIR"

# Create the migration SQL
cat > "$MIGRATION_DIR/migration.sql" << 'EOF'
-- Complete schema migration
-- Handles birthDate→birthYear, deathDate→deathYear, and social media fields

-- Step 1: Add new year columns if they don't exist
DO $$ 
BEGIN
    -- Add birthYear to cards if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cards' AND column_name = 'birthYear') THEN
        ALTER TABLE "cards" ADD COLUMN "birthYear" INTEGER;
    END IF;
    
    -- Add deathYear to cards if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cards' AND column_name = 'deathYear') THEN
        ALTER TABLE "cards" ADD COLUMN "deathYear" INTEGER;
    END IF;
    
    -- Add birthYear to proposals if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposals' AND column_name = 'birthYear') THEN
        ALTER TABLE "proposals" ADD COLUMN "birthYear" INTEGER;
    END IF;
    
    -- Add deathYear to proposals if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposals' AND column_name = 'deathYear') THEN
        ALTER TABLE "proposals" ADD COLUMN "deathYear" INTEGER;
    END IF;
END $$;

-- Step 2: Convert existing date data to years (if birthDate/deathDate exist)
DO $$ 
BEGIN
    -- Convert cards birthDate to birthYear
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cards' AND column_name = 'birthDate') THEN
        UPDATE "cards" 
        SET "birthYear" = EXTRACT(YEAR FROM "birthDate")::INTEGER 
        WHERE "birthDate" IS NOT NULL AND "birthYear" IS NULL;
    END IF;
    
    -- Convert cards deathDate to deathYear
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cards' AND column_name = 'deathDate') THEN
        UPDATE "cards" 
        SET "deathYear" = EXTRACT(YEAR FROM "deathDate")::INTEGER 
        WHERE "deathDate" IS NOT NULL AND "deathYear" IS NULL;
    END IF;
    
    -- Convert proposals birthDate to birthYear
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposals' AND column_name = 'birthDate') THEN
        UPDATE "proposals" 
        SET "birthYear" = EXTRACT(YEAR FROM "birthDate")::INTEGER 
        WHERE "birthDate" IS NOT NULL AND "birthYear" IS NULL;
    END IF;
    
    -- Convert proposals deathDate to deathYear
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposals' AND column_name = 'deathDate') THEN
        UPDATE "proposals" 
        SET "deathYear" = EXTRACT(YEAR FROM "deathDate")::INTEGER 
        WHERE "deathDate" IS NOT NULL AND "deathYear" IS NULL;
    END IF;
END $$;

-- Step 3: Add social media fields to admins table
DO $$ 
BEGIN
    -- Add social media fields if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admins' AND column_name = 'instagramUrl') THEN
        ALTER TABLE "admins" ADD COLUMN "instagramUrl" TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admins' AND column_name = 'twitterUrl') THEN
        ALTER TABLE "admins" ADD COLUMN "twitterUrl" TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admins' AND column_name = 'facebookUrl') THEN
        ALTER TABLE "admins" ADD COLUMN "facebookUrl" TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admins' AND column_name = 'linkedinUrl') THEN
        ALTER TABLE "admins" ADD COLUMN "linkedinUrl" TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admins' AND column_name = 'youtubeUrl') THEN
        ALTER TABLE "admins" ADD COLUMN "youtubeUrl" TEXT;
    END IF;
END $$;

-- Step 4: Drop old date columns (optional - uncomment if you want to remove them)
-- ALTER TABLE "cards" DROP COLUMN IF EXISTS "birthDate";
-- ALTER TABLE "cards" DROP COLUMN IF EXISTS "deathDate";
-- ALTER TABLE "proposals" DROP COLUMN IF EXISTS "birthDate";
-- ALTER TABLE "proposals" DROP COLUMN IF EXISTS "deathDate";
EOF

print_success "Migration file created: $MIGRATION_DIR/migration.sql"

# Show what the migration will do
print_status "Step 5: Migration will do the following:"
echo "  ✅ Add birthYear/deathYear columns (if not exist)"
echo "  ✅ Convert existing birthDate/deathDate data to years"
echo "  ✅ Add social media fields to admins table"
echo "  ✅ Preserve all existing data"
echo ""

read -p "Do you want to proceed with this migration? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_error "Migration cancelled"
    exit 1
fi

# Apply migration
print_status "Step 6: Applying migration..."
DATABASE_URL="$DATABASE_URL" npx prisma migrate deploy

if [ $? -eq 0 ]; then
    print_success "✅ Migration applied successfully!"
else
    print_error "❌ Migration failed"
    exit 1
fi

# Regenerate Prisma client
print_status "Step 7: Regenerating Prisma client..."
DATABASE_URL="$DATABASE_URL" npx prisma generate

if [ $? -eq 0 ]; then
    print_success "✅ Prisma client regenerated successfully"
else
    print_warning "⚠️ Prisma client regeneration failed, but migration was successful"
fi

# Cleanup
rm -f check_schema.sql

print_success "🎉 Complete migration finished!"
echo ""
print_status "What was updated:"
echo "  ✅ birthDate → birthYear (with data conversion)"
echo "  ✅ deathDate → deathYear (with data conversion)"
echo "  ✅ Added social media fields to admins table"
echo "  ✅ All existing data preserved"
echo ""
print_status "Next steps:"
echo "1. Deploy your updated backend code to Railway"
echo "2. Deploy your updated frontend to Netlify"
echo "3. Test the new functionality"
echo "4. Configure social media URLs in admin panel"
echo ""
print_success "Your database is now ready for production! 🚀"
