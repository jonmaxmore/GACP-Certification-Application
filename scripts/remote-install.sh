#!/bin/bash
set -e

APP_DIR="/home/ec2-user/gacp-platform"
REPO_URL="https://github.com/jonmaxmore/GACP-Certification-Application.git"

echo "========================================"
echo "🚀 GACP Auto-Deployment (Agentic)"
echo "========================================"

# 1. Prepare Directory
mkdir -p $APP_DIR
cd $APP_DIR

# 2. Git Clone/Pull
if [ -d ".git" ]; then
    echo "🔄 Pulling latest changes..."
    git fetch origin
    git reset --hard origin/main
else
    echo "⬇️ Cloning repository..."
    git clone $REPO_URL .
fi

# 3. Setup Environment
if [ ! -f ".env.production" ]; then
    echo "⚙️ Creating .env.production..."
    cp .env.production.example .env.production
    # Auto-generate secrets
    JWT_SECRET=$(openssl rand -base64 32 | tr -d /=+ | cut -c -32)
    DB_PASS=$(openssl rand -hex 12)
    sed -i "s/CHANGE_THIS_WITH_OPENSSL_RAND_BASE64_64/$JWT_SECRET/" .env.production
    sed -i "s/CHANGE_THIS_STRONG_PASSWORD/$DB_PASS/" .env.production
    echo "✅ Generated secure secrets in .env.production"
fi

# 4. Ensure SSL Exists (Self-Signed for Nginx startup)
mkdir -p nginx/ssl
if [ ! -f "nginx/ssl/fullchain.pem" ]; then
    echo "🔐 Generating self-signed SSL certificate..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout nginx/ssl/privkey.pem \
      -out nginx/ssl/fullchain.pem \
      -subj "/C=TH/ST=Bangkok/O=GACP/CN=localhost" 2>/dev/null
    echo "✅ SSL certificate generated"
fi

# 5. Check Docker Installation (Amazon Linux 2/2023)
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    sudo yum update -y
    sudo yum install -y docker
    sudo service docker start
    sudo usermod -a -G docker ec2-user
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "🐳 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# 6. Deploy
echo "🚀 Building and Starting Containers..."
# Stop old containers if any
docker-compose -f docker-compose.production.yml down --remove-orphans || true
# Start new ones
# Use 'sudo' if user not in docker group yet (might not take effect in this session)
if groups | grep -q 'docker'; then
    docker-compose -f docker-compose.production.yml up -d --build
else
    sudo docker-compose -f docker-compose.production.yml up -d --build
fi

# 7. Database Migration
echo "📦 Running Database Migrations..."
sleep 10 # Wait for DB to be ready
if groups | grep -q 'docker'; then
    docker-compose -f docker-compose.production.yml exec -T backend npx prisma migrate deploy
else
    sudo docker-compose -f docker-compose.production.yml exec -T backend npx prisma migrate deploy
fi

echo "========================================"
echo "✅ Deployment Finished Successfully!"
echo "========================================"
