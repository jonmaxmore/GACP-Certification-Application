# 🚀 GACP Platform - Production Setup Guide

**Version:** 2.0.0  
**Date:** October 15, 2025  
**Estimated Time:** 30 minutes

---

## 📋 Prerequisites

- [ ] MongoDB Atlas account
- [ ] Upstash account
- [ ] AWS account (for S3, SES)
- [ ] Twilio account (for SMS/OTP)
- [ ] Omise account (for payments)
- [ ] Domain name configured

---

## Step 1: MongoDB Atlas Setup (10 minutes)

### 1.1 Create Production Cluster

1. Go to: https://cloud.mongodb.com/
2. Click **"Build a Database"**
3. Choose **M10** cluster (Production recommended)
   - Region: **Singapore (ap-southeast-1)**
   - Cluster Name: `gacp-production`
4. Click **"Create"**
5. Wait 5-10 minutes for deployment

### 1.2 Configure Database Access

1. Go to **Database Access** tab
2. Click **"Add New Database User"**
3. Authentication Method: **Password**
   ```
   Username: gacp_admin
   Password: [Generate Strong Password] (Save this!)
   ```
4. Database User Privileges: **Read and write to any database**
5. Click **"Add User"**

### 1.3 Configure Network Access

1. Go to **Network Access** tab
2. Click **"Add IP Address"**
3. Choose **"Allow Access from Anywhere"** (0.0.0.0/0)
   - For production, whitelist specific IPs
4. Click **"Confirm"**

### 1.4 Get Connection String

1. Go to **Database** tab
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js**, Version: **4.0 or later**
5. Copy connection string:
   ```
   mongodb+srv://gacp_admin:<password>@gacp-production.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=gacp-platform
   ```
6. Replace `<password>` with your actual password
7. Add database name: `gacp_production`

**Final connection string:**

```
mongodb+srv://gacp_admin:YOUR_PASSWORD@gacp-production.xxxxx.mongodb.net/gacp_production?retryWrites=true&w=majority&appName=gacp-platform
```

---

## Step 2: Upstash Redis Setup (5 minutes)

### 2.1 Create Redis Database

1. Go to: https://console.upstash.com/
2. Click **"Create Database"**
3. Configuration:
   ```
   Name: gacp-production-redis
   Type: Regional
   Region: ap-southeast-1 (Singapore)
   TLS: Enabled
   Eviction: No Eviction
   ```
4. Click **"Create"**

### 2.2 Get Redis Connection

1. Open your database
2. Go to **".NET"** tab (or REST API)
3. Copy **REDIS_URL**:
   ```
   redis://default:YOUR_PASSWORD@gacp-production.upstash.io:6379
   ```

---

## Step 3: AWS Services Setup (10 minutes)

### 3.1 Create S3 Bucket

```bash
# Using AWS CLI
aws s3 mb s3://gacp-production-uploads --region ap-southeast-1

# Set bucket policy for public read
aws s3api put-bucket-policy --bucket gacp-production-uploads --policy file://s3-policy.json
```

**s3-policy.json:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::gacp-production-uploads/*"
    }
  ]
}
```

### 3.2 Create IAM User for App

1. Go to IAM → Users → Create User
2. User name: `gacp-app-user`
3. Attach policies:
   - `AmazonS3FullAccess`
   - `AmazonSESFullAccess`
4. Create **Access Key**
5. Save:
   ```
   AWS_ACCESS_KEY_ID=AKIA...
   AWS_SECRET_ACCESS_KEY=...
   ```

### 3.3 Setup SES for Email

1. Go to Amazon SES console
2. Verify domain: `gacp-platform.com`
3. Verify email: `noreply@gacp-platform.com`
4. Request production access (if needed)

---

## Step 4: Generate Secrets (2 minutes)

```bash
# Generate strong secrets (run in terminal)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Run 3 times for JWT_SECRET, JWT_REFRESH_SECRET, SESSION_SECRET
```

---

## Step 5: Update .env File (3 minutes)

Edit `apps/backend/.env`:

```bash
# Database
MONGODB_URI=mongodb+srv://gacp_admin:YOUR_PASSWORD@gacp-production.xxxxx.mongodb.net/gacp_production?retryWrites=true&w=majority&appName=gacp-platform

# Redis
REDIS_URL=redis://default:YOUR_PASSWORD@gacp-production.upstash.io:6379

# Secrets
JWT_SECRET=YOUR_GENERATED_SECRET_1
JWT_REFRESH_SECRET=YOUR_GENERATED_SECRET_2
SESSION_SECRET=YOUR_GENERATED_SECRET_3

# AWS
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=gacp-production-uploads

# Twilio (if you have)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+66...

# Omise (if you have)
OMISE_PUBLIC_KEY=pkey_...
OMISE_SECRET_KEY=skey_...
```

---

## Step 6: Initialize Database (5 minutes)

```bash
# Install dependencies (if not done)
cd apps/backend
pnpm install

# Run production database setup
node setup-production-database.js

# Output should show:
# ✅ Connected to MongoDB Atlas
# ✅ Created 12 collections
# ✅ 50+ indexes created
# 👤 Admin user created
```

---

## Step 7: Test Connection

```bash
# Start backend in production mode
NODE_ENV=production node server.js

# Expected output:
# ✅ MongoDB connected
# ✅ Redis connected
# 🚀 Server running on port 5000
```

---

## Step 8: Deploy to Production

### Option A: PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start all services
pm2 start ecosystem.config.js

# View status
pm2 status

# View logs
pm2 logs

# Setup startup script
pm2 startup
pm2 save
```

### Option B: Docker

```bash
# Build production image
docker build -f Dockerfile.backend -t gacp-backend:latest .

# Run container
docker run -d \
  --name gacp-backend \
  -p 5000:5000 \
  --env-file apps/backend/.env \
  gacp-backend:latest
```

---

## ✅ Verification Checklist

- [ ] MongoDB Atlas cluster running
- [ ] Can connect to database
- [ ] Collections and indexes created
- [ ] Admin user created
- [ ] Upstash Redis accessible
- [ ] Redis connection working
- [ ] S3 bucket created and accessible
- [ ] AWS credentials working
- [ ] All secrets generated and set
- [ ] Backend starts without errors
- [ ] Health check passes: `curl http://localhost:5000/health`
- [ ] API responds: `curl http://localhost:5000/api/auth/health`

---

## 🔒 Security Checklist

- [ ] Changed default admin password
- [ ] JWT secrets are strong and unique
- [ ] MongoDB IP whitelist configured (not 0.0.0.0/0)
- [ ] Redis TLS enabled
- [ ] S3 bucket policy restricted
- [ ] AWS IAM user has minimum permissions
- [ ] Environment variables not committed to git
- [ ] CORS origins properly configured
- [ ] Rate limiting enabled
- [ ] HTTPS enforced

---

## 📊 Monitoring Setup

### Sentry (Error Tracking)

1. Create project at: https://sentry.io
2. Get DSN
3. Add to .env:
   ```
   SENTRY_DSN=https://...@sentry.io/...
   SENTRY_ENVIRONMENT=production
   ```

### PM2 Monitoring

```bash
# Link to PM2 Plus
pm2 link YOUR_SECRET_KEY YOUR_PUBLIC_KEY

# View monitoring dashboard
pm2 web
```

---

## 🆘 Troubleshooting

### Cannot connect to MongoDB

```bash
# Test connection
mongosh "mongodb+srv://gacp_admin:PASSWORD@gacp-production.xxxxx.mongodb.net/gacp_production"

# Check:
1. Password is correct
2. IP is whitelisted
3. Cluster is running
```

### Cannot connect to Redis

```bash
# Test with redis-cli
redis-cli -u redis://default:PASSWORD@gacp-production.upstash.io:6379 PING

# Should return: PONG
```

### Backend won't start

```bash
# Check logs
pm2 logs gacp-backend

# Common issues:
1. Missing environment variables
2. Port 5000 already in use
3. Database connection failed
```

---

## 📚 Next Steps

1. **Setup Frontends:** Deploy Farmer, Admin, Certificate portals
2. **Configure Domain:** Point DNS to servers
3. **SSL Certificates:** Setup Let's Encrypt
4. **Load Balancer:** Configure Nginx
5. **Backups:** Schedule automated backups
6. **Monitoring:** Setup alerts and dashboards

---

## 🎯 Production URLs

After deployment:

- **API:** https://api.gacp-platform.com
- **Farmer Portal:** https://farmer.gacp-platform.com
- **Admin Portal:** https://admin.gacp-platform.com
- **Certificate Verification:** https://verify.gacp-platform.com

---

## 💡 Tips

1. **Database Backups:** MongoDB Atlas auto-backup is enabled on M10+
2. **Scaling:** M10 handles ~100 concurrent connections, upgrade if needed
3. **Redis Cache:** Use for sessions, API rate limiting, temporary data
4. **S3 Optimization:** Enable CloudFront CDN for faster uploads
5. **Cost Monitoring:** Set up AWS billing alerts

---

## 📞 Support

- MongoDB Atlas: https://cloud.mongodb.com/support
- Upstash: https://upstash.com/docs
- AWS Support: https://console.aws.amazon.com/support

---

**Good luck with your production deployment! 🚀**
