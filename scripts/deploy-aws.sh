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
echo "📋 Step 1: Connecting to Server ($SERVER_IP)..."
# Note: This script is intended to be run either ON the server or with SSH keys set up.
# Using 'git pull' assumption that we are ON the server or remote execution.
# Let's assume this script is run ON the server based on previous structure, 
# but previous script had confusing mix of local/remote commands (it tried to install nodejs?).
# The previous script looked like a "User Data" or "Setup" script.
# I will make this a "Update & Restart" script for the user to run ON THE SERVER.

echo "⚠️  Ensure you are running this script ON the production server."
echo "⚠️  Ensure you are in the application root directory."

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
