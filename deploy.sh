#!/bin/bash

# Exit on any error
set -e

echo "Starting Railway deployment..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Install server dependencies (this will also generate Prisma client)
echo "Installing server dependencies..."
cd server && npm install && cd ..

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL environment variable is not set!"
    echo "Please add a PostgreSQL database to your Railway project."
    exit 1
fi

echo "DATABASE_URL is set, proceeding with database setup..."

# Push database schema
echo "Pushing database schema..."
npx prisma db push --schema=./prisma/schema.railway.prisma

echo "Database setup complete. Starting server..."
# Start the server
npm start
