# 🚀 GACP Platform - Deployment Guide

**สถานะปัจจุบัน**: ✅ **พร้อม Deploy 100%**  
**วันที่**: 18 ตุลาคม 2025  
**JWT Secrets**: ✅ สร้างแล้ว  
**Environment**: ✅ กำหนดค่าแล้ว  
**Code**: ✅ อัปเดตล่าสุดบน GitHub

---

## 🎯 สถานะการเตรียมความพร้อม

```
✅ JWT_SECRET: สร้างแล้ว (128 chars)
✅ DTAM_JWT_SECRET: สร้างแล้ว (128 chars, แตกต่างจาก JWT_SECRET)
✅ MongoDB Atlas: กำหนดค่าแล้ว (thai-gacp.re1651p.mongodb.net)
✅ Environment Variables: ครบถ้วนใน .env.production
✅ Security Systems: ทั้งหมดพร้อมใช้งาน
✅ Documentation: ครบถ้วน 100%
```

---

## 📋 ขั้นตอน Deployment (เลือก 1 วิธี)

### **วิธีที่ 1: ติดตั้ง Node.js และ Deploy ด้วย PM2 (แนะนำ)**

#### **ขั้นตอนที่ 1.1: ติดตั้ง Node.js**

```powershell
# วิธี 1: ใช้ winget (Windows 10/11)
winget install OpenJS.NodeJS

# วิธี 2: Download manual
# ไปที่ https://nodejs.org/en/download/
# Download LTS version
# ติดตั้งตามขั้นตอน

# ปิด PowerShell และเปิดใหม่ แล้วทดสอบ
node --version
npm --version
```

#### **ขั้นตอนที่ 1.2: Deploy ด้วย PM2**

```powershell
# เข้าไปใน project directory
cd c:\Users\usEr\Documents\GitHub\gacp-certify-flow-main

# ติดตั้ง dependencies
npm install

# เข้าไป backend directory
cd apps\backend
npm install --production

# ติดตั้ง PM2 globally
npm install -g pm2

# สร้าง PM2 ecosystem config
# (ไฟล์อยู่ที่ ecosystem.config.js แล้ว)

# Start ด้วย PM2
pm2 start ecosystem.config.js --env production

# ตรวจสอบสถานะ
pm2 status
pm2 logs

# ตรวจสอบ health
curl http://localhost:3004/health
```

---

### **วิธีที่ 2: Deploy ด้วย Docker (สำหรับ Advanced Users)**

#### **ขั้นตอนที่ 2.1: ติดตั้ง Docker**

```powershell
# ติดตั้ง Docker Desktop
winget install Docker.DockerDesktop

# หรือ download จาก https://www.docker.com/products/docker-desktop/
```

#### **ขั้นตอนที่ 2.2: Deploy ด้วย Docker Compose**

```powershell
# Build และ start containers
docker-compose --env-file .env.production up -d

# ตรวจสอบสถานะ
docker-compose ps

# ดู logs
docker-compose logs backend

# ตรวจสอบ health
curl http://localhost:3004/health
```

---

### **วิธีที่ 3: Manual Node.js Deploy (Simple)**

```powershell
# หลังจากติดตั้ง Node.js แล้ว
cd c:\Users\usEr\Documents\GitHub\gacp-certify-flow-main

# ติดตั้ง dependencies
npm install
cd apps\backend
npm install --production

# Set environment variable
$env:NODE_ENV = "production"

# Start application
node server.js

# จะรันที่ http://localhost:3004
```

---

## 🔍 การตรวจสอบหลัง Deploy

### **1. Health Check**

```bash
# Basic health check
curl http://localhost:3004/health

# Expected response:
{
  "status": "healthy",
  "connected": true,
  "database": "gacp_production",
  "message": "Database is connected and responding"
}
```

### **2. Environment Validation**

```bash
# Database connection
curl http://localhost:3004/api/health/db

# Authentication endpoint (should return 401)
curl -X POST http://localhost:3004/api/auth/login

# Rate limiting (should return 429 after 5 attempts)
for /L %i in (1,1,10) do curl http://localhost:3004/api/auth/login
```

### **3. JWT Security Test**

```bash
# Try with invalid token (should return 401)
curl -H "Authorization: Bearer invalid-token" http://localhost:3004/api/applications

# Try without token (should return 401)
curl http://localhost:3004/api/applications
```

---

## 🔧 Management Commands

### **PM2 Commands** (หลังจาก deploy ด้วย PM2):

```bash
# ตรวจสอบสถานะ
pm2 status

# ดู logs
pm2 logs gacp-backend

# Restart
pm2 restart gacp-backend

# Stop
pm2 stop gacp-backend

# Delete
pm2 delete gacp-backend

# Monitor real-time
pm2 monit

# Setup auto-start on system boot
pm2 startup
pm2 save
```

### **Docker Commands** (หลังจาก deploy ด้วย Docker):

```bash
# ตรวจสอบ containers
docker-compose ps

# ดู logs
docker-compose logs backend

# Restart
docker-compose restart backend

# Stop
docker-compose stop

# Update และ restart
git pull origin main
docker-compose build
docker-compose up -d
```

---

## 🌐 การเข้าถึงระบบ

### **Backend API**:

- **URL**: http://localhost:3004
- **Health Check**: http://localhost:3004/health
- **API Documentation**: http://localhost:3004/api/docs (หากมี)

### **Frontend URLs** (เมื่อ deploy เพิ่ม):

- **Public Portal**: http://localhost:3000 (เกษตรกร)
- **DTAM Portal**: http://localhost:3001 (เจ้าหน้าที่)
- **Inspector Portal**: http://localhost:3002 (ผู้ตรวจ)
- **Admin Portal**: http://localhost:3003 (ผู้บริหาร)

---

## 🛡️ Security Checklist

```
✅ JWT_SECRET: 128-character secure random string
✅ DTAM_JWT_SECRET: 128-character secure random string (different from JWT_SECRET)
✅ MongoDB URI: Uses MongoDB Atlas with authentication
✅ CORS Origins: Set to production domains only
✅ Rate Limiting: Active (5 auth attempts/15min, 100 API/15min)
✅ Environment Validation: Active (fails-fast on missing config)
✅ No Default Fallbacks: Production won't start with unsafe defaults
✅ HTTPS Ready: SSL configuration available in .env.production
```

---

## 📊 Performance Metrics

### **Expected Performance**:

- **Startup Time**: 5-10 seconds
- **Response Time**: < 100ms (health endpoint)
- **Memory Usage**: 200-500MB (depending on load)
- **Database Connections**: 5-20 connections (auto-scaling)

### **Monitoring** (Optional):

- **Logs**: PM2 logs หรือ Docker logs
- **Health**: http://localhost:3004/health
- **Database**: MongoDB Atlas dashboard
- **PM2 Dashboard**: `pm2 web` (หรือ PM2 Plus)

---

## 🚨 Troubleshooting

### **Problem: "VALIDATION_FAILED"**

```bash
# Check .env.production file exists
ls .env.production

# Check JWT secrets are set
grep JWT_SECRET .env.production

# Regenerate secrets if needed
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### **Problem: "Cannot connect to MongoDB"**

```bash
# Test MongoDB connection
mongosh "mongodb+srv://gacp-premierprime:<password>@thai-gacp.re1651p.mongodb.net/"

# Check IP whitelist in MongoDB Atlas
# Check username/password correct
```

### **Problem: "Port 3004 already in use"**

```bash
# Find process using port 3004
netstat -ano | findstr :3004

# Kill process (replace PID)
taskkill /PID <process-id> /F

# Or change port in .env.production
```

---

## 🎉 Deployment Success Criteria

การ deploy ถือว่าสำเร็จเมื่อ:

1. ✅ **Health Check Returns 200**: `curl http://localhost:3004/health`
2. ✅ **Database Connected**: Health response shows `"connected": true`
3. ✅ **JWT Security Active**: Invalid tokens return 401
4. ✅ **Rate Limiting Active**: Too many requests return 429
5. ✅ **No Error Logs**: PM2/Docker logs show no critical errors
6. ✅ **Environment Valid**: All required variables loaded correctly

---

## 📞 Support

หากมีปัญหา:

1. **ตรวจสอบ Logs**:
   - PM2: `pm2 logs gacp-backend`
   - Docker: `docker-compose logs backend`
   - Manual: ดูใน console ที่รัน `node server.js`

2. **Health Check**:

   ```bash
   curl http://localhost:3004/health
   ```

3. **Environment Check**:

   ```bash
   cat .env.production
   ```

4. **Contact Information**:
   - GitHub Issues: https://github.com/jonmaxmore/gacp-certify-flow-main/issues
   - Documentation: README_HANDOFF.md

---

**🎯 สถานะ: พร้อม Deploy ทันที!**  
**🔒 Security: Enterprise-grade**  
**📚 Documentation: ครบถ้วน 100%**  
**🚀 Next Step: เลือก Deployment Method และ Deploy!**
