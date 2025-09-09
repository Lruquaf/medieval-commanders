#!/bin/bash

# Install dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Start the server
npm start
