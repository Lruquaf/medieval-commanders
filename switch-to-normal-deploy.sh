#!/bin/bash

# Switch back to normal deployment after migration
# This script changes railway.json back to the original deploy script

echo "🔄 Switching back to normal deployment script..."

# Update railway.json to use the original deploy script
cat > railway.json << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "./deploy-railway-postgres.sh",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF

echo "✅ railway.json updated to use normal deployment script"
echo "📝 Next deployment will use deploy-railway-postgres.sh (without migration)"
echo ""
echo "To apply this change:"
echo "1. git add railway.json"
echo "2. git commit -m 'Switch back to normal deployment'"
echo "3. git push origin main"
