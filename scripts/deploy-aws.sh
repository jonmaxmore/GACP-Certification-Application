#!/bin/bash
# 🚀 GACP Production Deployment Script (V2 Upgrade)
# Server: 47.129.167.71 (Production)
# Stack: Node.js 20, Postgres, Prisma

set -e

echo "========================================="
echo "🚀 GACP V2 Production Deployment"
echo "========================================="

# Variables
SERVER_IP="47.129.167.71"
SSH_USER="ec2-user"
APP_DIR="/home/ec2-user/gacp"
REPO_URL="https://github.com/jonmaxmore/GACP-Certification-Application.git"

echo ""
# Note: This script assumes you have SSHed into the server and are running it from the project root.
# It handles the full update cycle for the unified V2 architecture.

# Check if running on Windows (Git Bash/MinGW)
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
  echo "❌ ERROR: You are running this on WINDOWS."
  echo "👉 Step 1: Find your .pem key (e.g., Downloads folder)."
  echo "👉 Step 2: ssh -i key.pem ec2-user@47.129.167.71"
  echo "👉 Step 3: Run this script ON THE SERVER."
  exit 1
fi

echo "⚠️  CRITICAL: Run this script ON the production server."
echo "⚠️  Ensure you are in the application root directory (e.g., ~/gacp-certification-application)."

echo ""
echo "📋 Step 2: Pulling latest changes..."
git pull origin main

echo ""
echo "📋 Step 3: Updating Backend..."
cd apps/backend
npm install --production

echo ""
echo "📋 Step 4: Running Database Migrations (Prisma)..."
npx prisma generate
npx prisma migrate deploy

echo ""
echo "📋 Step 5: Updating Frontend..."
cd ../web-app
npm install
npm run build

echo ""
echo "📋 Step 6: Restarting Services..."
pm2 restart all || pm2 start ecosytem.config.js # Fallback

echo ""
echo "========================================="
echo "✅ Deployment Complete!"
echo "========================================="
echo "Health Check: curl http://localhost:8000/api/health"
