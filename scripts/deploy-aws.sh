#!/bin/bash
# 🚀 GACP AWS EC2 Deployment Script
# Server: 13.214.184.107
# Instance: i-09cb922c1dc9ab79f (2P_GACP_Application)

set -e

echo "========================================="
echo "🚀 GACP AWS EC2 Deployment"
echo "========================================="

# Variables
SERVER_IP="13.214.184.107"
SSH_USER="ec2-user"
APP_DIR="/home/ec2-user/gacp"
REPO_URL="https://github.com/jonmaxmore/GACP-Certification-Application.git"

echo ""
echo "📋 Step 1: Updating system..."
sudo yum update -y

echo ""
echo "📋 Step 2: Installing Node.js 20 LTS..."
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

echo ""
echo "📋 Step 3: Installing PM2..."
sudo npm install -g pm2

echo ""
echo "📋 Step 4: Installing Nginx..."
sudo yum install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

echo ""
echo "📋 Step 5: Cloning repository..."
cd /home/ec2-user
if [ -d "gacp" ]; then
    cd gacp
    git pull origin main
else
    git clone $REPO_URL gacp
    cd gacp
fi

echo ""
echo "📋 Step 6: Installing backend dependencies..."
cd apps/backend
npm install --production

echo ""
echo "📋 Step 7: Creating .env file..."
cat > .env << 'EOF'
NODE_ENV=production
PORT=3000

# MongoDB - ใช้ connection string จาก MongoDB Atlas
MONGODB_URI=mongodb+srv://gacp-premierprime:YOUR_PASSWORD@thai-gacp.re1651p.mongodb.net/gacp-production?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-production-secret-key-change-this
JWT_EXPIRES_IN=7d

# Encryption
ENCRYPTION_KEY=your-encryption-key-32-chars-min

# CORS
CORS_ORIGIN=http://13.214.184.107
EOF

echo ""
echo "📋 Step 8: Starting backend with PM2..."
pm2 delete gacp-backend 2>/dev/null || true
pm2 start server.js --name gacp-backend
pm2 save
pm2 startup

echo ""
echo "📋 Step 9: Installing web-app dependencies..."
cd ../web-app
npm install

echo ""
echo "📋 Step 10: Building Next.js..."
npm run build

echo ""
echo "📋 Step 11: Starting web-app with PM2..."
pm2 delete gacp-webapp 2>/dev/null || true
pm2 start npm --name gacp-webapp -- start
pm2 save

echo ""
echo "📋 Step 12: Configuring Nginx..."
sudo tee /etc/nginx/conf.d/gacp.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name 13.214.184.107;

    # Frontend (Next.js)
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

sudo nginx -t
sudo systemctl reload nginx

echo ""
echo "========================================="
echo "✅ Deployment Complete!"
echo "========================================="
echo ""
echo "🌐 Frontend: http://13.214.184.107"
echo "🔧 Backend:  http://13.214.184.107/api"
echo ""
echo "📊 Check status: pm2 status"
echo "📋 View logs: pm2 logs"
echo ""
