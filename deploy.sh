#!/bin/bash

# Exit on any error
set -e

echo "Starting Railway deployment..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Install server dependencies
echo "Installing server dependencies..."
cd server && npm install && cd ..

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "WARNING: DATABASE_URL environment variable is not set!"
    echo "Server will start without database connection."
    echo "Please add a PostgreSQL database to your Railway project."
else
    echo "DATABASE_URL is set, proceeding with database setup..."
    
    # Generate Prisma client using canonical schema
    echo "Generating Prisma client..."
    npx prisma generate --schema=./prisma/schema.prisma
    
    # Verify Prisma client was generated
    echo "Verifying Prisma client generation..."
    if [ -d "node_modules/.prisma/client" ]; then
        echo "✓ Prisma client generated successfully"
    else
        echo "✗ Prisma client not found, Prisma generation failed"
        exit 1
    fi
    
    # Push database schema with retry logic
    echo "Pushing database schema..."
    for i in {1..5}; do
        echo "Attempt $i/5 to connect to database..."
        if npx prisma db push --schema=./prisma/schema.prisma; then
            echo "✓ Database schema pushed successfully"
            break
        else
            echo "✗ Database connection failed, waiting 10 seconds before retry..."
            sleep 10
        fi
    done
fi

echo "Database setup complete. Starting server..."
# Start the server
npm start
