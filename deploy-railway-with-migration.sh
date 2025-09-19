#!/bin/bash

# Exit on any error
set -e

echo "Starting Railway deployment with PostgreSQL and Migration..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Copy Prisma schema to server directory
echo "Copying Prisma schema to server directory..."
cp prisma/schema.railway.prisma server/schema.prisma

# Install server dependencies
echo "Installing server dependencies..."
cd server && npm install && cd ..

# Verify required packages are installed
echo "Verifying required packages..."
if [ -d "server/node_modules/cloudinary" ]; then
    echo "✓ Cloudinary package found"
else
    echo "✗ Cloudinary package not found, installing..."
    cd server && npm install cloudinary multer-storage-cloudinary && cd ..
fi

if [ -d "server/node_modules/multer-storage-cloudinary" ]; then
    echo "✓ multer-storage-cloudinary package found"
else
    echo "✗ multer-storage-cloudinary package not found, installing..."
    cd server && npm install multer-storage-cloudinary && cd ..
fi

# Verify email service packages
echo "Installing/verifying email service packages..."
cd server

# Core email packages
if [ ! -d "node_modules/nodemailer" ]; then
    echo "Installing nodemailer..."
    npm install nodemailer
fi

# Install Resend if using it
if [ "$EMAIL_SERVICE" = "resend" ]; then
    if [ ! -d "node_modules/resend" ]; then
        echo "Installing resend package..."
        npm install resend
    fi
    echo "✓ Resend package ready"
fi

echo "✓ Email service packages verified"
cd ..

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL environment variable is not set!"
    echo "Please make sure PostgreSQL service is connected to this service."
    echo "In Railway dashboard:"
    echo "1. Go to your backend service"
    echo "2. Go to Variables tab"
    echo "3. Make sure DATABASE_URL is present"
    exit 1
fi

# Check email service configuration
echo "Checking email service configuration..."
if [ -z "$EMAIL_SERVICE" ]; then
    echo "WARNING: EMAIL_SERVICE environment variable is not set!"
    echo "Email notifications will not work. Please set EMAIL_SERVICE in Railway dashboard."
    echo "🏆 Recommended options: resend, brevo"
    echo "📧 Other options: sendgrid, ses, mailgun, smtp, gmail, ethereal"
    echo ""
    echo "📖 See server/env.railway.example for setup instructions"
else
    echo "✓ EMAIL_SERVICE is set to: $EMAIL_SERVICE"
    
    # Check for required email service variables
    case "$EMAIL_SERVICE" in
        "resend")
            if [ -z "$RESEND_API_KEY" ]; then
                echo "❌ ERROR: RESEND_API_KEY is not set!"
                echo "📋 Setup: Sign up at https://resend.com and get your API key"
                echo "💡 Add RESEND_API_KEY to Railway environment variables"
            else
                echo "✅ RESEND_API_KEY is set (Recommended choice!)"
            fi
            ;;
        "brevo"|"sendinblue")
            if [ -z "$BREVO_API_KEY" ]; then
                echo "❌ ERROR: BREVO_API_KEY is not set!"
                echo "📋 Setup: Sign up at https://brevo.com and get your API key"
                echo "💡 Add BREVO_API_KEY and BREVO_SMTP_USER to Railway environment variables"
            else
                echo "✅ BREVO_API_KEY is set"
                if [ -z "$BREVO_SMTP_USER" ]; then
                    echo "⚠️  WARNING: BREVO_SMTP_USER is not set!"
                else
                    echo "✅ BREVO_SMTP_USER is set"
                fi
            fi
            ;;
        "sendgrid")
            if [ -z "$SENDGRID_API_KEY" ]; then
                echo "WARNING: SENDGRID_API_KEY is not set!"
            else
                echo "✓ SENDGRID_API_KEY is set"
            fi
            ;;
        "ses")
            if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
                echo "WARNING: AWS credentials are not set!"
            else
                echo "✓ AWS credentials are set"
            fi
            ;;
        "mailgun")
            if [ -z "$MAILGUN_API_KEY" ] || [ -z "$MAILGUN_DOMAIN" ]; then
                echo "WARNING: MAILGUN credentials are not set!"
            else
                echo "✓ MAILGUN credentials are set"
            fi
            ;;
        "smtp")
            if [ -z "$SMTP_HOST" ] || [ -z "$SMTP_USER" ] || [ -z "$SMTP_PASS" ]; then
                echo "WARNING: SMTP credentials are not set!"
            else
                echo "✓ SMTP credentials are set"
            fi
            ;;
        "gmail")
            if [ -z "$EMAIL_USER" ] || [ -z "$EMAIL_PASS" ]; then
                echo "WARNING: Gmail credentials are not set!"
            else
                echo "✓ Gmail credentials are set"
            fi
            ;;
        "ethereal")
            echo "⚠️  Using Ethereal Email for testing (not recommended for production)"
            ;;
        *)
            echo "❌ Unknown EMAIL_SERVICE: $EMAIL_SERVICE"
            echo "🏆 Recommended: resend, brevo"
            ;;
    esac
fi

# Check other required email variables
if [ -z "$EMAIL_FROM" ]; then
    echo "WARNING: EMAIL_FROM is not set! Using default."
    export EMAIL_FROM="Medieval Commanders <noreply@medievalcommanders.com>"
fi

if [ -z "$DEFAULT_ADMIN_EMAIL" ]; then
    echo "WARNING: DEFAULT_ADMIN_EMAIL is not set! Using default."
    export DEFAULT_ADMIN_EMAIL="admin@medievalcommanders.com"
fi

# Log DATABASE_URL for debugging (without password)
echo "DATABASE_URL is set, proceeding with database setup..."
if [ -n "$DATABASE_URL" ]; then
    # Extract and log connection details without password
    DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
    DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    DB_NAME=$(echo "$DATABASE_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')
    echo "Connecting to: $DB_HOST:$DB_PORT/$DB_NAME"
fi

# ===== MIGRATION SECTION =====
echo "🔧 Starting database migration process..."

# Check if migration has already been completed
MIGRATION_FLAG_FILE="/tmp/medieval_commanders_migration_completed"

if [ -f "$MIGRATION_FLAG_FILE" ]; then
    echo "✅ Migration already completed, skipping..."
else
    echo "🚀 Running one-time database migration..."
    
    # Test database connection first
    echo "Testing database connection..."
    for i in {1..3}; do
        echo "Attempt $i/3 to connect to database..."
        
        if npx prisma db push --schema=./prisma/schema.railway.prisma --accept-data-loss; then
            echo "✓ Database connection successful"
            break
        else
            echo "✗ Database connection failed on attempt $i"
            if [ $i -eq 3 ]; then
                echo "❌ Database connection failed after 3 attempts"
                echo "Continuing without migration..."
                break
            else
                echo "Waiting 10 seconds before retry..."
                sleep 10
            fi
        fi
    done
    
    # Run the migration SQL directly
    echo "Running migration SQL..."
    cat > migration.sql << 'EOF'
-- Complete schema migration
-- Handles birthDate→birthYear, deathDate→deathYear, and social media fields

-- Step 1: Add new year columns if they don't exist
DO $$ 
BEGIN
    -- Add birthYear to cards if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cards' AND column_name = 'birthYear') THEN
        ALTER TABLE "cards" ADD COLUMN "birthYear" INTEGER;
        RAISE NOTICE 'Added birthYear column to cards table';
    END IF;
    
    -- Add deathYear to cards if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cards' AND column_name = 'deathYear') THEN
        ALTER TABLE "cards" ADD COLUMN "deathYear" INTEGER;
        RAISE NOTICE 'Added deathYear column to cards table';
    END IF;
    
    -- Add birthYear to proposals if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposals' AND column_name = 'birthYear') THEN
        ALTER TABLE "proposals" ADD COLUMN "birthYear" INTEGER;
        RAISE NOTICE 'Added birthYear column to proposals table';
    END IF;
    
    -- Add deathYear to proposals if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposals' AND column_name = 'deathYear') THEN
        ALTER TABLE "proposals" ADD COLUMN "deathYear" INTEGER;
        RAISE NOTICE 'Added deathYear column to proposals table';
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
        RAISE NOTICE 'Converted cards birthDate to birthYear';
    END IF;
    
    -- Convert cards deathDate to deathYear
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cards' AND column_name = 'deathDate') THEN
        UPDATE "cards" 
        SET "deathYear" = EXTRACT(YEAR FROM "deathDate")::INTEGER 
        WHERE "deathDate" IS NOT NULL AND "deathYear" IS NULL;
        RAISE NOTICE 'Converted cards deathDate to deathYear';
    END IF;
    
    -- Convert proposals birthDate to birthYear
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposals' AND column_name = 'birthDate') THEN
        UPDATE "proposals" 
        SET "birthYear" = EXTRACT(YEAR FROM "birthDate")::INTEGER 
        WHERE "birthDate" IS NOT NULL AND "birthYear" IS NULL;
        RAISE NOTICE 'Converted proposals birthDate to birthYear';
    END IF;
    
    -- Convert proposals deathDate to deathYear
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposals' AND column_name = 'deathDate') THEN
        UPDATE "proposals" 
        SET "deathYear" = EXTRACT(YEAR FROM "deathDate")::INTEGER 
        WHERE "deathDate" IS NOT NULL AND "deathYear" IS NULL;
        RAISE NOTICE 'Converted proposals deathDate to deathYear';
    END IF;
END $$;

-- Step 3: Add social media fields to admins table
DO $$ 
BEGIN
    -- Add social media fields if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admins' AND column_name = 'instagramUrl') THEN
        ALTER TABLE "admins" ADD COLUMN "instagramUrl" TEXT;
        RAISE NOTICE 'Added instagramUrl column to admins table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admins' AND column_name = 'twitterUrl') THEN
        ALTER TABLE "admins" ADD COLUMN "twitterUrl" TEXT;
        RAISE NOTICE 'Added twitterUrl column to admins table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admins' AND column_name = 'facebookUrl') THEN
        ALTER TABLE "admins" ADD COLUMN "facebookUrl" TEXT;
        RAISE NOTICE 'Added facebookUrl column to admins table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admins' AND column_name = 'linkedinUrl') THEN
        ALTER TABLE "admins" ADD COLUMN "linkedinUrl" TEXT;
        RAISE NOTICE 'Added linkedinUrl column to admins table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admins' AND column_name = 'youtubeUrl') THEN
        ALTER TABLE "admins" ADD COLUMN "youtubeUrl" TEXT;
        RAISE NOTICE 'Added youtubeUrl column to admins table';
    END IF;
END $$;

-- Step 4: Verify migration
SELECT 'Migration completed successfully' as status;
EOF

    # Execute the migration
    if command -v psql >/dev/null 2>&1; then
        echo "Executing migration with psql..."
        PGPASSWORD=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p') psql "$DATABASE_URL" -f migration.sql
        if [ $? -eq 0 ]; then
            echo "✅ Migration completed successfully!"
            # Create flag file to prevent re-running
            touch "$MIGRATION_FLAG_FILE"
        else
            echo "❌ Migration failed, but continuing with deployment..."
        fi
    else
        echo "⚠️ psql not available, trying with Prisma..."
        # Alternative: Use Prisma to execute SQL
        npx prisma db execute --file migration.sql --schema=./prisma/schema.railway.prisma
        if [ $? -eq 0 ]; then
            echo "✅ Migration completed successfully!"
            touch "$MIGRATION_FLAG_FILE"
        else
            echo "❌ Migration failed, but continuing with deployment..."
        fi
    fi
    
    # Clean up migration file
    rm -f migration.sql
fi

# ===== END MIGRATION SECTION =====

# Generate Prisma client in server directory
echo "Generating Prisma client in server directory..."
cd server && npx prisma generate --schema=./schema.prisma && cd ..

# Verify Prisma client was generated
echo "Verifying Prisma client generation..."
if [ -d "server/node_modules/.prisma/client" ]; then
    echo "✓ Prisma client generated successfully in server directory"
else
    echo "✗ Prisma client not found in server directory, trying alternative approach..."
    # Try generating in root and copying
    npx prisma generate --schema=./prisma/schema.railway.prisma
    if [ -d "node_modules/.prisma/client" ]; then
        echo "✓ Prisma client generated in root, copying to server..."
        mkdir -p server/node_modules/.prisma
        cp -r node_modules/.prisma/client server/node_modules/.prisma/
        echo "✓ Prisma client copied to server directory"
    else
        echo "✗ Failed to generate Prisma client"
        exit 1
    fi
fi

# Test database connection with retry logic
echo "Testing database connection..."
for i in {1..5}; do
    echo "Attempt $i/5 to connect to database..."
    
    # First try to connect and check if database is accessible
    if npx prisma db push --schema=./prisma/schema.railway.prisma --accept-data-loss; then
        echo "✓ Database connection successful and schema pushed"
        break
    else
        echo "✗ Database connection failed on attempt $i"
        
        # Log more detailed error information
        echo "Checking database connectivity..."
        if command -v psql >/dev/null 2>&1; then
            echo "Testing with psql..."
            # Extract connection details for psql test
            DB_USER=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
            DB_PASS=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
            DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
            DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
            DB_NAME=$(echo "$DATABASE_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')
            
            if [ -n "$DB_USER" ] && [ -n "$DB_PASS" ] && [ -n "$DB_HOST" ] && [ -n "$DB_PORT" ] && [ -n "$DB_NAME" ]; then
                echo "Testing connection to $DB_HOST:$DB_PORT/$DB_NAME as user $DB_USER"
                PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" >/dev/null 2>&1
                if [ $? -eq 0 ]; then
                    echo "✓ Direct psql connection successful"
                else
                    echo "✗ Direct psql connection failed"
                fi
            fi
        fi
        
        if [ $i -eq 5 ]; then
            echo "✗ Database connection failed after 5 attempts"
            echo "Please check:"
            echo "1. PostgreSQL service is running"
            echo "2. DATABASE_URL is correct"
            echo "3. Database credentials are valid"
            echo "4. Network connectivity to database"
            echo "5. Database user has proper permissions"
            echo "Continuing without database connection..."
            break
        else
            echo "✗ Database connection failed, waiting 15 seconds before retry..."
            sleep 15
        fi
    fi
done

echo "Database setup complete. Starting server..."
# Start the server
npm start
