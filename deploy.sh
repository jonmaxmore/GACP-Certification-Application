#!/bin/bash

# GACP V3.0 Automated Deployment Script
# Usage: ./deploy.sh
# Author: GACP AI Assistant

PROJECT_DIR="GACP-Certification-Application"
REPO_URL="https://github.com/jonmaxmore/GACP-Certification-Application.git"

echo "🚀 Starting GACP V3.0 Deployment..."

# 1. Check and Get Code
if [ -d "$PROJECT_DIR" ]; then
    echo "📂 Project found. Pulling latest code..."
    cd "$PROJECT_DIR"
    git pull origin main
else
    echo "⚠️ Project not found. Cloning from repository..."
    git clone "$REPO_URL"
    cd "$PROJECT_DIR"
fi

# 2. Update Backend
echo "🛠️ Updating Backend..."
cd apps/backend
npm install --production
# Run migrations (safe deploy)
npx prisma migrate deploy
cd ../..

# 3. Update Frontend
echo "🛠️ Updating Frontend..."
cd apps/web-app
npm install --production
npm run build
cd ../..

# 4. Restart Services
echo "🔄 Restarting PM2 Services..."
# Check if PM2 processes exist, if not start them, otherwise restart
pm2 restart api-v2 || pm2 start apps/backend/server.js --name api-v2
pm2 restart web-v2 || pm2 start "npm start" --name web-v2 --cwd apps/web-app

echo "✅ Deployment Complete! System is now running V3.0.0"
pm2 list
