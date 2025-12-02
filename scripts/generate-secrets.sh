#!/bin/bash

# ===========================================
# 🔐 Generate Strong Secrets for Production
# ===========================================
# This script generates cryptographically strong secrets for your GACP Platform
# Run this BEFORE deploying to production!
#
# Usage:
#   chmod +x generate-secrets.sh
#   ./generate-secrets.sh
# ===========================================

echo ""
echo "========================================="
echo "🔐 GACP Platform - Secret Generator"
echo "========================================="
echo ""

# Check if openssl is available
if ! command -v openssl &> /dev/null; then
    echo "❌ ERROR: openssl is not installed!"
    echo "   Install with: sudo apt-get install openssl (Ubuntu/Debian)"
    echo "             or: brew install openssl (macOS)"
    exit 1
fi

echo "Generating strong secrets..."
echo ""

# Generate secrets using openssl
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
JWT_REFRESH_SECRET=$(openssl rand -base64 64 | tr -d '\n')
DTAM_JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
SESSION_SECRET=$(openssl rand -base64 32 | tr -d '\n')
REDIS_PASSWORD=$(openssl rand -base64 24 | tr -d '\n')
MONGO_ROOT_PASSWORD=$(openssl rand -base64 32 | tr -d '\n')

echo "✅ Secrets generated successfully!"
echo ""
echo "========================================="
echo "Copy these to your .env.production file:"
echo "========================================="
echo ""

# Output secrets with colors
echo -e "\033[90m# JWT Secrets (for Farmer authentication)\033[0m"
echo "JWT_SECRET=$JWT_SECRET"
echo ""

echo -e "\033[90m# JWT Refresh Secret (must be different from JWT_SECRET)\033[0m"
echo "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET"
echo ""

echo -e "\033[90m# DTAM Staff JWT Secret (must be different from JWT_SECRET)\033[0m"
echo "DTAM_JWT_SECRET=$DTAM_JWT_SECRET"
echo ""

echo -e "\033[90m# Session Secret\033[0m"
echo "SESSION_SECRET=$SESSION_SECRET"
echo ""

echo -e "\033[90m# Redis Password\033[0m"
echo "REDIS_PASSWORD=$REDIS_PASSWORD"
echo ""

echo -e "\033[90m# MongoDB Root Password\033[0m"
echo "MONGO_ROOT_PASSWORD=$MONGO_ROOT_PASSWORD"
echo ""

echo "========================================="
echo -e "\033[91m⚠️  IMPORTANT SECURITY NOTES:\033[0m"
echo "========================================="
echo ""
echo -e "\033[93m1. 🔒 NEVER commit .env.production to git\033[0m"
echo -e "\033[93m2. 🔄 Store secrets in a secure vault (Azure Key Vault, AWS Secrets Manager)\033[0m"
echo -e "\033[93m3. 📝 Keep a BACKUP of these secrets in a secure location\033[0m"
echo -e "\033[93m4. 🔑 Each environment (dev/staging/prod) should have DIFFERENT secrets\033[0m"
echo -e "\033[93m5. ⏰ Rotate secrets regularly (every 3-6 months)\033[0m"
echo -e "\033[93m6. 👥 Limit access to production secrets (only DevOps team)\033[0m"
echo ""

# Ask to save to file
read -p "Do you want to save these to .env.production? (y/N): " saveToFile

if [[ "$saveToFile" == "y" || "$saveToFile" == "Y" ]]; then
    ENV_PATH=".env.production"
    TEMPLATE_PATH=".env.production.template"
    
    if [ -f "$ENV_PATH" ]; then
        echo ""
        echo -e "\033[91m⚠️  WARNING: .env.production already exists!\033[0m"
        read -p "Overwrite? This will REPLACE all secrets! (y/N): " overwrite
        
        if [[ "$overwrite" != "y" && "$overwrite" != "Y" ]]; then
            echo "❌ Aborted. Secrets not saved."
            exit 0
        fi
    fi
    
    # Check if template exists
    if [ ! -f "$TEMPLATE_PATH" ]; then
        echo "❌ ERROR: .env.production.template not found!"
        exit 1
    fi
    
    # Copy template and replace placeholders
    cp "$TEMPLATE_PATH" "$ENV_PATH"
    
    # Use sed to replace placeholders (macOS and Linux compatible)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/CHANGE_THIS_TO_RANDOM_STRING_MIN_64_CHARS/$JWT_SECRET/" "$ENV_PATH"
        sed -i '' "s/JWT_REFRESH_SECRET=.*/JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET/" "$ENV_PATH"
        sed -i '' "s/DTAM_JWT_SECRET=.*/DTAM_JWT_SECRET=$DTAM_JWT_SECRET/" "$ENV_PATH"
        sed -i '' "s/SESSION_SECRET=.*/SESSION_SECRET=$SESSION_SECRET/" "$ENV_PATH"
        sed -i '' "s/REDIS_PASSWORD=.*/REDIS_PASSWORD=$REDIS_PASSWORD/" "$ENV_PATH"
        sed -i '' "s/MONGO_ROOT_PASSWORD=.*/MONGO_ROOT_PASSWORD=$MONGO_ROOT_PASSWORD/" "$ENV_PATH"
    else
        # Linux
        sed -i "s/CHANGE_THIS_TO_RANDOM_STRING_MIN_64_CHARS/$JWT_SECRET/" "$ENV_PATH"
        sed -i "s/JWT_REFRESH_SECRET=.*/JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET/" "$ENV_PATH"
        sed -i "s/DTAM_JWT_SECRET=.*/DTAM_JWT_SECRET=$DTAM_JWT_SECRET/" "$ENV_PATH"
        sed -i "s/SESSION_SECRET=.*/SESSION_SECRET=$SESSION_SECRET/" "$ENV_PATH"
        sed -i "s/REDIS_PASSWORD=.*/REDIS_PASSWORD=$REDIS_PASSWORD/" "$ENV_PATH"
        sed -i "s/MONGO_ROOT_PASSWORD=.*/MONGO_ROOT_PASSWORD=$MONGO_ROOT_PASSWORD/" "$ENV_PATH"
    fi
    
    echo ""
    echo "✅ Secrets saved to .env.production"
    echo ""
    echo -e "\033[93m⚠️  NEXT STEPS:\033[0m"
    echo "1. Review .env.production and fill in remaining values"
    echo "2. NEVER commit this file to git!"
    echo "3. Upload secrets to your production server securely (SCP, Azure Key Vault, etc.)"
    echo ""
else
    echo ""
    echo "ℹ️  Secrets NOT saved to file. Copy them manually."
    echo ""
fi

echo "========================================="
echo "✅ Done!"
echo "========================================="
echo ""
