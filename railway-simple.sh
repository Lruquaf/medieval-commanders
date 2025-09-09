#!/bin/bash

echo "Starting Railway deployment..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Install server dependencies
echo "Installing server dependencies..."
cd server && npm install && cd ..

# Start the server immediately
echo "Starting server..."
npm start
