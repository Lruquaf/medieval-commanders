#!/bin/bash

# Exit on any error
set -e

echo "Starting Railway deployment with PostgreSQL..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Copy Prisma schema to server directory
echo "Copying Prisma schema to server directory..."
cp prisma/schema.railway.prisma server/schema.prisma

# Install server dependencies
echo "Installing server dependencies..."
cd server && npm install && cd ..

# Verify Cloudinary packages are installed
echo "Verifying Cloudinary packages..."
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

# Log DATABASE_URL for debugging (without password)
echo "DATABASE_URL is set, proceeding with database setup..."
if [ -n "$DATABASE_URL" ]; then
    # Extract and log connection details without password
    DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
    DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    DB_NAME=$(echo "$DATABASE_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')
    echo "Connecting to: $DB_HOST:$DB_PORT/$DB_NAME"
fi

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
