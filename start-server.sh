#!/bin/bash

# Kill any existing process on port 5001
echo "Checking for existing processes on port 5001..."
lsof -ti:5001 | xargs kill -9 2>/dev/null || echo "No existing processes found on port 5001"

# Wait a moment for the port to be released
sleep 2

# Start the server
echo "Starting server with database persistence..."
node server/index.js
