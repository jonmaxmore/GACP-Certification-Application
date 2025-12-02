# 🚀 Development Environment - Quick Start Guide

**Version:** 2.0.0  
**Date:** October 15, 2025  
**For:** All Developers (21 team members)  
**Time to Complete:** 15-20 minutes

---

## 🎯 Overview

This guide will help you set up your development environment for GACP Platform in **15-20 minutes**. Follow these steps in order.

---

## ✅ Prerequisites Check

Before you start, make sure you have:

### **Required (Must Have):**

- [ ] **Node.js** v20.x or higher ([Download](https://nodejs.org/))
- [ ] **pnpm** v9.x or higher (Install: `npm install -g pnpm`)
- [ ] **Git** latest version ([Download](https://git-scm.com/))
- [ ] **VS Code** or your preferred IDE ([Download](https://code.visualstudio.com/))
- [ ] **MongoDB Compass** for database GUI ([Download](https://www.mongodb.com/try/download/compass))

### **Optional (Recommended):**

- [ ] **Postman** or **Insomnia** for API testing
- [ ] **Docker Desktop** (if you want to run services locally)
- [ ] **Chrome DevTools** or **React DevTools**

---

## 📦 Step 1: Clone Repository (2 minutes)

### **1.1 Clone from GitHub**

```bash
# Navigate to your projects folder
cd ~/projects  # or C:\Users\YourName\projects on Windows

# Clone the repository
git clone https://github.com/jonmaxmore/gacp-certify-flow-main.git

# Enter project directory
cd gacp-certify-flow-main
```

### **1.2 Verify Clone**

```bash
# Check if you're on the main branch
git branch

# You should see:
# * main

# Check latest commits
git log --oneline -5

# You should see recent commits about production setup
```

---

## 📦 Step 2: Install Dependencies (5 minutes)

### **2.1 Install Root Dependencies**

```bash
# In project root
pnpm install

# This will install all dependencies for:
# - Backend (apps/backend)
# - Farmer Portal (apps/farmer-portal)
# - Certificate Portal (apps/certificate-portal)
# - Admin Portal (apps/admin-portal)
# - Shared packages (packages/*)
```

**Expected output:**

```
Progress: resolved XXX, reused XXX, downloaded XX, added XXX
Done in XXs
```

### **2.2 Verify Installation**

```bash
# Check if node_modules exist
ls node_modules  # or dir node_modules on Windows

# Check pnpm version
pnpm --version
# Should show: 9.x.x
```

---

## 🔐 Step 3: Configure Environment Variables (3 minutes)

### **3.1 Backend Environment**

```bash
# Navigate to backend
cd apps/backend

# Copy production template
cp .env .env.local

# Open .env.local in your editor
code .env.local
```

### **3.2 Update Required Variables**

**Minimum configuration for local development:**

```env
# Server
NODE_ENV=development
PORT=5000
API_VERSION=v1

# MongoDB (Use your MongoDB Atlas connection string)
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/gacp_platform?retryWrites=true&w=majority
MONGODB_DB_NAME=gacp_platform

# Or use local MongoDB for development:
# MONGODB_URI=mongodb://localhost:27017/gacp_platform
# MONGODB_DB_NAME=gacp_platform

# Upstash Redis (Use your Upstash Redis URL)
UPSTASH_REDIS_URL=rediss://YOUR_REDIS_URL.upstash.io:6379

# Or use local Redis:
# UPSTASH_REDIS_URL=redis://localhost:6379

# JWT Secrets (Generate strong secrets)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars-long

# CORS
CORS_ORIGIN=http://localhost:3001,http://localhost:3002,http://localhost:3003
```

**Generate strong JWT secrets:**

```bash
# On Mac/Linux:
openssl rand -base64 32

# On Windows PowerShell:
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

# Or use Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### **3.3 Frontend Environment Variables**

**Farmer Portal:**

```bash
cd apps/farmer-portal
cp .env.example .env.local
```

```env
# apps/farmer-portal/.env.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_APP_NAME=GACP Farmer Portal
PORT=3001
```

**Certificate Portal:**

```bash
cd apps/certificate-portal
cp .env.example .env.local
```

```env
# apps/certificate-portal/.env.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_APP_NAME=GACP Certificate Portal
PORT=3002
```

**Admin Portal:**

```bash
cd apps/admin-portal
cp .env.example .env.local
```

```env
# apps/admin-portal/.env.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_APP_NAME=GACP Admin Portal
PORT=3003
```

---

## 🗄️ Step 4: Setup Database (5 minutes)

### **4.1 Run Infrastructure Setup Script**

```bash
# Navigate back to project root
cd ../../  # or cd ../.. on Windows

# Run automated setup
node setup-infrastructure.js
```

**This script will:**

- ✅ Validate environment variables
- ✅ Connect to MongoDB Atlas
- ✅ Create 12 collections with indexes
- ✅ Create admin user (admin@gacp.go.th / Admin@GACP2025)
- ✅ Connect to Upstash Redis
- ✅ Display setup summary

**Expected output:**

```
━━━ GACP Platform - Infrastructure Setup ━━━

ℹ Starting automated infrastructure setup...

━━━ Step 1: Environment Variable Validation ━━━

✓ MONGODB_URI: ✓ Set
✓ MONGODB_DB_NAME: ✓ Set
✓ UPSTASH_REDIS_URL: ✓ Set
✓ JWT_SECRET: ✓ Set
✓ All required environment variables are valid!

━━━ Step 2: MongoDB Atlas Connection ━━━

ℹ Connecting to MongoDB Atlas...
✓ Connected to MongoDB Atlas successfully!
ℹ MongoDB Version: 7.0.14
ℹ Database Name: gacp_platform

━━━ Step 3: Database Setup ━━━

✓ Created collection: users (with validation)
  ↳ Index created: email_1
  ↳ Index created: phone_1
  ↳ Index created: role_1
  ... (50+ indexes)
✓ Database setup complete: 12 collections created, 54 indexes created

━━━ Step 4: Admin User Creation ━━━

✓ Admin user created successfully!
  Email: admin@gacp.go.th
  Password: Admin@GACP2025
  ⚠️  Please change this password after first login!

━━━ Step 5: Upstash Redis Connection ━━━

✓ Connected to Upstash Redis successfully!
✓ Redis read/write test passed!

━━━ Setup Complete! ━━━

============================================================
        GACP Platform - Infrastructure Setup Summary
============================================================

✓ Environment Validation
✓ MongoDB Connection
✓ Database Creation
  ↳ Collections Created: 12
  ↳ Indexes Created: 54
✓ Admin User Created
✓ Redis Connection

============================================================
✓ Infrastructure setup completed successfully!

Next steps:
1. Start backend server: cd apps/backend && pnpm dev
2. Start frontend portals: cd apps/[portal] && pnpm dev
3. Login with admin credentials: admin@gacp.go.th / Admin@GACP2025
4. Change admin password immediately!
============================================================
```

### **4.2 Verify Database with MongoDB Compass**

1. Open MongoDB Compass
2. Connect using your `MONGODB_URI`
3. Navigate to `gacp_platform` database
4. You should see 12 collections:
   - users
   - farms
   - applications
   - inspections
   - audits
   - certificates
   - documents
   - notifications
   - activity_logs
   - sessions
   - otp_codes
   - settings

---

## 🚀 Step 5: Start Development Servers (2 minutes)

### **5.1 Start Backend Server**

**Terminal 1:**

```bash
cd apps/backend
pnpm dev
```

**Expected output:**

```
[nodemon] starting `node app.js`
🚀 Server running on http://localhost:5000
📊 Environment: development
🔗 MongoDB: Connected to gacp_platform
🔴 Redis: Connected
📝 API Docs: http://localhost:5000/api-docs
```

**Test backend:**

```bash
# In a new terminal
curl http://localhost:5000/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2025-10-15T...",
  "uptime": 12.345,
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

---

### **5.2 Start Farmer Portal**

**Terminal 2:**

```bash
cd apps/farmer-portal
pnpm dev
```

**Expected output:**

```
▲ Next.js 14.0.0
- Local:        http://localhost:3001
- Network:      http://192.168.x.x:3001

✓ Ready in 3.2s
```

**Test:** Open http://localhost:3001 in browser

---

### **5.3 Start Certificate Portal**

**Terminal 3:**

```bash
cd apps/certificate-portal
pnpm dev
```

**Expected output:**

```
▲ Next.js 14.0.0
- Local:        http://localhost:3002
- Network:      http://192.168.x.x:3002

✓ Ready in 3.1s
```

**Test:** Open http://localhost:3002 in browser

---

### **5.4 Start Admin Portal**

**Terminal 4:**

```bash
cd apps/admin-portal
pnpm dev
```

**Expected output:**

```
▲ Next.js 14.0.0
- Local:        http://localhost:3003
- Network:      http://192.168.x.x:3003

✓ Ready in 3.3s
```

**Test:** Open http://localhost:3003 in browser

---

## ✅ Step 6: Verify Everything Works (3 minutes)

### **6.1 Check All Services**

| Service            | URL                   | Status       |
| ------------------ | --------------------- | ------------ |
| Backend API        | http://localhost:5000 | ✅ Running   |
| Farmer Portal      | http://localhost:3001 | ✅ Running   |
| Certificate Portal | http://localhost:3002 | ✅ Running   |
| Admin Portal       | http://localhost:3003 | ✅ Running   |
| MongoDB            | (Check Compass)       | ✅ Connected |
| Redis              | (Check backend logs)  | ✅ Connected |

### **6.2 Test Admin Login**

1. Go to **http://localhost:3003** (Admin Portal)
2. Login with:
   - Email: `admin@gacp.go.th`
   - Password: `Admin@GACP2025`
3. You should see the admin dashboard

### **6.3 Test API Endpoint**

```bash
# Test user registration (should work)
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@1234",
    "firstName": "Test",
    "lastName": "User",
    "phone": "+66812345678"
  }'
```

---

## 🛠️ Troubleshooting

### **Problem 1: `pnpm: command not found`**

**Solution:**

```bash
npm install -g pnpm
```

---

### **Problem 2: MongoDB connection failed**

**Possible causes:**

1. Wrong connection string
2. IP not whitelisted in MongoDB Atlas
3. Wrong database name

**Solution:**

1. Check `MONGODB_URI` in `.env.local`
2. Go to MongoDB Atlas → Network Access → Add your IP (0.0.0.0/0 for development)
3. Verify database name is `gacp_platform`

---

### **Problem 3: Redis connection failed**

**Solution:**

1. Check `UPSTASH_REDIS_URL` in `.env.local`
2. Verify Upstash Redis instance is running
3. For local development, you can install Redis locally or use Docker:

```bash
# Using Docker
docker run -d -p 6379:6379 redis:7-alpine
```

---

### **Problem 4: Port already in use**

**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**

**On Mac/Linux:**

```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

**On Windows:**

```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process
taskkill /PID <PID> /F
```

---

### **Problem 5: Module not found**

**Solution:**

```bash
# Delete node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

### **Problem 6: TypeScript errors**

**Solution:**

```bash
# Rebuild TypeScript
pnpm run build
```

---

## 🎯 Next Steps

Now that your environment is set up:

1. **Read Documentation:**
   - `TEAM_ONBOARDING_PACKAGE.md` - Team guidelines
   - `CODING_STANDARDS.md` - How we write code
   - `API_DOCUMENTATION.md` - API endpoints
   - `COMMIT_GUIDELINES.md` - How to commit

2. **Explore Codebase:**
   - `apps/backend/` - Backend API
   - `apps/farmer-portal/` - Farmer portal (Next.js)
   - `apps/certificate-portal/` - Certificate portal (Next.js)
   - `apps/admin-portal/` - Admin portal (Next.js)
   - `packages/` - Shared packages

3. **Join Team Chat:**
   - Microsoft Teams or Slack (link from PM)

4. **Attend Kickoff:**
   - Sprint 1 Kickoff: October 22, 2025

5. **Get Your First Task:**
   - JIRA board will be ready October 20
   - PM will assign tasks during Sprint Planning

---

## 📚 Useful Commands

### **Development:**

```bash
# Run all services (from root)
pnpm dev

# Run backend only
cd apps/backend && pnpm dev

# Run specific frontend
cd apps/farmer-portal && pnpm dev

# Run tests
pnpm test

# Run linter
pnpm lint

# Format code
pnpm format

# Build for production
pnpm build
```

### **Database:**

```bash
# Reset database (WARNING: Deletes all data!)
node setup-infrastructure.js --reset

# Backup database
mongodump --uri="YOUR_MONGODB_URI" --out=./backup

# Restore database
mongorestore --uri="YOUR_MONGODB_URI" ./backup
```

### **Git:**

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Stage changes
git add .

# Commit with message
git commit -m "feat: add user login"

# Push to remote
git push origin feature/your-feature-name

# Create pull request (on GitHub)
```

---

## 🔧 VS Code Extensions (Recommended)

Install these extensions for better development experience:

1. **ESLint** - Linting
2. **Prettier** - Code formatting
3. **EditorConfig** - Consistent formatting
4. **GitLens** - Git supercharged
5. **Thunder Client** - API testing (alternative to Postman)
6. **MongoDB for VS Code** - MongoDB management
7. **Docker** - Docker support
8. **ES7+ React/Redux/React-Native snippets** - React snippets
9. **Tailwind CSS IntelliSense** - Tailwind autocomplete
10. **TypeScript Vue Plugin (Volar)** - TypeScript support

---

## 📞 Need Help?

### **Technical Issues:**

- **Backend:** คุณสมหวัง (Backend Lead)
- **Frontend:** คุณสมบูรณ์ (Frontend Lead)
- **Database:** คุณสมใจ (Backend Dev 2)
- **DevOps:** คุณสมชาติ (DevOps)

### **Project Questions:**

- **PM:** คุณสมชาย
- **Scrum Master:** คุณสมหญิง

### **Chat:**

- Team chat channel (link from PM)

---

## ✅ Setup Complete!

Congratulations! Your development environment is now ready. 🎉

**You should now have:**

- ✅ Project cloned
- ✅ Dependencies installed
- ✅ Environment variables configured
- ✅ Database setup complete
- ✅ All services running
- ✅ Admin access working

**Next:** Read `TEAM_ONBOARDING_PACKAGE.md` and wait for Sprint 1 kickoff!

---

**Document Version:** 2.0.0  
**Created:** October 15, 2025  
**Last Updated:** October 15, 2025  
**Status:** ✅ Production Ready
