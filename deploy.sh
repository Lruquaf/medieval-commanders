#!/bin/bash

# Exit on any error
set -e

echo "Starting Railway deployment..."

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
    echo "Please add a PostgreSQL database to your Railway project."
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

# Push database schema
echo "Pushing database schema..."
npx prisma db push --schema=./prisma/schema.railway.prisma

echo "Database setup complete. Starting server..."
# Start the server
npm start
