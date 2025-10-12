#!/bin/bash

# Exit on any error
set -e

echo "🚀 Starting Railway deployment with PostgreSQL..."

echo "📦 Installing dependencies (root and server via postinstall)..."
npm install

echo "🧭 Syncing Prisma provider based on DATABASE_URL..."
node scripts/sync-prisma-provider.js || true

echo "📄 Copying Prisma schema into server directory for local generation..."
cp prisma/schema.prisma server/schema.prisma

echo "🔧 Ensuring Prisma client is generated for server package (local schema)..."
cd server && npx prisma generate --schema=./schema.prisma && cd ..

echo "🔎 Checking required environment variables..."
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL is not set. Please attach a PostgreSQL service and set DATABASE_URL."
    exit 1
else
    echo "✅ DATABASE_URL detected."
fi

if [ -z "$EMAIL_SERVICE" ]; then
    echo "⚠️  EMAIL_SERVICE is not set. Email notifications will be disabled."
else
    echo "✅ EMAIL_SERVICE: $EMAIL_SERVICE"
fi

if [ -z "$EMAIL_FROM" ]; then
    export EMAIL_FROM="Medieval Commanders <noreply@medievalcommanders.com>"
    echo "ℹ️  EMAIL_FROM not set, using default: $EMAIL_FROM"
fi

if [ -z "$DEFAULT_ADMIN_EMAIL" ]; then
    export DEFAULT_ADMIN_EMAIL="admin@medievalcommanders.com"
    echo "ℹ️  DEFAULT_ADMIN_EMAIL not set, using default: $DEFAULT_ADMIN_EMAIL"
fi

echo "🗄️  Pushing Prisma schema to database (up to 3 attempts)..."
for i in 1 2 3; do
  echo "→ Attempt $i/3: prisma db push"
  if npx prisma db push --schema=./prisma/schema.prisma --skip-generate; then
    echo "✅ Schema push successful"
        break
  fi
  if [ "$i" != "3" ]; then
    echo "⏳ Retry in 10s..."
    sleep 10
  else
    echo "⚠️  Could not push schema after 3 attempts. Continuing; server will run without enforced schema push."
    fi
done

echo "🚀 Starting server..."
npm start
