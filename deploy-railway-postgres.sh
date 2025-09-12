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

echo "DATABASE_URL is set, proceeding with database setup..."

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

# Test database connection before pushing schema
echo "Testing database connection..."
if npx prisma db push --schema=./prisma/schema.railway.prisma --accept-data-loss; then
    echo "✓ Database connection successful and schema pushed"
else
    echo "✗ Database connection failed"
    echo "Please check:"
    echo "1. PostgreSQL service is running"
    echo "2. DATABASE_URL is correct"
    echo "3. Database credentials are valid"
    exit 1
fi

echo "Database setup complete. Starting server..."
# Start the server
npm start
