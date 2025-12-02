# 🚀 UAT Quick Start Guide - ขั้นตอนการเริ่มต้น

**Version:** 1.0  
**Date:** October 20, 2025  
**Status:** Ready to Deploy

---

## ⚡ Quick Start (5 นาที)

### ขั้นตอนที่ 1: ติดตั้ง MongoDB (ถ้ายังไม่มี)

#### Windows:

```powershell
# ดาวน์โหลด MongoDB Community Server
# https://www.mongodb.com/try/download/community

# หรือติดตั้งผ่าน Chocolatey
choco install mongodb

# หรือใช้ Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### ตรวจสอบ MongoDB ทำงาน:

```powershell
# ตรวจสอบว่า MongoDB service ทำงานหรือไม่
Get-Service MongoDB

# หรือทดสอบการเชื่อมต่อ
mongosh --eval "db.version()"
```

---

### ขั้นตอนที่ 2: Setup UAT Environment

```powershell
# 1. ไปที่โฟลเดอร์โปรเจค
cd C:\Users\charo\Botanical-Audit-Framework

# 2. สร้างไฟล์ .env.uat
npm run uat:setup
# หรือ
copy .env.uat.example .env.uat

# 3. แก้ไขไฟล์ .env.uat
notepad .env.uat
```

#### ตัวอย่าง .env.uat (minimum config):

```env
NODE_ENV=uat
PORT=3001
MONGODB_URI=mongodb://localhost:27017/botanical-audit-uat
JWT_SECRET=uat_jwt_secret_12345
DTAM_JWT_SECRET=uat_dtam_jwt_secret_12345
```

---

### ขั้นตอนที่ 3: Seed Test Data

```powershell
# สร้างข้อมูลทดสอบ (Users, Farms, Applications)
npm run uat:seed
```

**Expected Output:**

```
✅ MongoDB connected successfully
🗑️  Cleared existing users
✅ Created user: farmer001 (farmer)
✅ Created user: farmer002 (farmer)
...
✅ Successfully seeded 13 users
✅ Successfully seeded 10 farms
✅ Successfully seeded 13 applications

🔑 Test Credentials:
   Farmer: farmer001 / Test@1234
   Reviewer: reviewer001 / Rev@1234
   Inspector: inspector001 / Insp@1234
   Approver: approver001 / App@1234
   Admin: admin001 / Admin@1234
```

---

### ขั้นตอนที่ 4: Start UAT Server

```powershell
# เริ่ม Backend Server ในโหมด UAT
npm run uat:server
```

**Expected Output:**

```
[UAT Mode] Starting server...
✅ MongoDB connected
✅ Server running on http://localhost:3001
✅ API Documentation: http://localhost:3001/api-docs
```

---

### ขั้นตอนที่ 5: Verify System

```powershell
# เปิด Terminal ใหม่แล้วรัน
npm run uat:test
```

**Expected Output:**

```
🧪 UAT TEST RUNNER
================================================
ℹ️  Base URL: http://localhost:3001
ℹ️  Timeout: 10000ms

Starting Farmer Role Tests...
✅ TC-F001: Farmer Login - PASSED
✅ TC-F002: View Farm Profile - PASSED
...

📊 TEST SUMMARY
================================================
Total Tests: 32
✅ Passed: 30
❌ Failed: 2
⚠️  Blocked: 0
📈 Pass Rate: 93.75%
```

---

## 🎯 ขั้นตอนการทดสอบ UAT

### Week 1: Manual Testing (Oct 25-31)

#### Day 1: Farmer Testing

```powershell
# 1. เปิดเบราว์เซอร์
start http://localhost:3000

# 2. Login ด้วย
# Username: farmer001
# Password: Test@1234

# 3. ทดสอบ:
# - สร้างฟาร์มใหม่
# - ยื่นขอรับรอง GACP
# - กรอกแบบสำรวจ
# - บันทึก Track & Trace
```

#### Day 2: Reviewer Testing

```powershell
# 1. Login ที่ DTAM Portal
start http://localhost:3002

# 2. Login ด้วย
# Username: reviewer001
# Password: Rev@1234

# 3. ทดสอบ:
# - ตรวจสอบใบสมัคร
# - อนุมัติ/ไม่อนุมัติ
# - มอบหมายผู้ตรวจ
```

#### Day 3-4: Inspector Testing

```powershell
# Login ด้วย inspector001 / Insp@1234
# ทดสอบ:
# - ดูงานที่ได้รับมอบหมาย
# - กรอก Checklist
# - อัปโหลดรูปถ่าย
# - ส่งรายงาน
```

#### Day 5: Approver Testing

```powershell
# Login ด้วย approver001 / App@1234
# ทดสอบ:
# - ดูรายงานการตรวจ
# - อนุมัติใบรับรอง
# - สร้าง PDF Certificate
```

#### Day 6-7: Admin Testing

```powershell
# Login ด้วย admin001 / Admin@1234
# ทดสอบ:
# - จัดการผู้ใช้
# - สร้างแบบสำรวจ
# - ดู Audit Logs
# - สร้างรายงาน
```

---

## 🐛 Troubleshooting

### ปัญหา: MongoDB ไม่ทำงาน

**Solution:**

```powershell
# Windows - เริ่ม MongoDB Service
net start MongoDB

# หรือใช้ Docker
docker start mongodb

# หรือติดตั้งใหม่
choco install mongodb
```

---

### ปัญหา: Port 3001 ถูกใช้งานแล้ว

**Solution:**

```powershell
# หา process ที่ใช้ port 3001
netstat -ano | findstr :3001

# Kill process (แทน PID ด้วยตัวเลขที่ได้)
taskkill /PID <PID> /F

# หรือเปลี่ยน port ใน .env.uat
PORT=3002
```

---

### ปัญหา: ไม่สามารถเชื่อมต่อ MongoDB

**Solution:**

```powershell
# 1. ตรวจสอบ MongoDB ทำงานหรือไม่
Get-Service MongoDB

# 2. ตรวจสอบ connection string ใน .env.uat
# MONGODB_URI=mongodb://localhost:27017/botanical-audit-uat

# 3. ทดสอบการเชื่อมต่อ
mongosh "mongodb://localhost:27017/botanical-audit-uat"
```

---

### ปัญหา: npm run uat:seed ล้มเหลว

**Solution:**

```powershell
# 1. ตรวจสอบ dependencies
cd apps/backend
pnpm install

# 2. ตรวจสอบว่ามี bcryptjs
pnpm add bcryptjs

# 3. ลองใหม่
npm run uat:seed
```

---

## 📊 การตรวจสอบข้อมูล

### ดูข้อมูลใน MongoDB

```powershell
# เปิด MongoDB Shell
mongosh

# เข้าใช้งาน database
use botanical-audit-uat

# ดูจำนวน Users
db.users.countDocuments()
# Expected: 13

# ดูจำนวน Farms
db.farms.countDocuments()
# Expected: 10

# ดูจำนวน Applications
db.applications.countDocuments()
# Expected: 13

# ดูรายชื่อ Users
db.users.find({}, {username: 1, role: 1, name: 1})

# ลบข้อมูลทั้งหมด (ถ้าต้องการเริ่มใหม่)
db.users.deleteMany({})
db.farms.deleteMany({})
db.applications.deleteMany({})
```

---

## 🔍 API Testing ด้วย curl

### Test Authentication

```powershell
# Login as Farmer
curl -X POST http://localhost:3001/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"username": "farmer001", "password": "Test@1234"}'

# Expected Response:
# {
#   "success": true,
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": {
#     "id": "...",
#     "username": "farmer001",
#     "role": "farmer",
#     "name": "Somchai Prasert"
#   }
# }
```

### Test Farm API (with token)

```powershell
# Get My Farms
$token = "YOUR_TOKEN_HERE"
curl -X GET http://localhost:3001/api/farms/my-farms `
  -H "Authorization: Bearer $token"
```

---

## 📈 Monitoring & Logs

### ดู Server Logs

```powershell
# ดู logs แบบ real-time
Get-Content logs/uat.log -Wait -Tail 50

# หรือใช้ PowerShell
npm run uat:server | Tee-Object -FilePath logs/uat-session.log
```

### ดู Audit Logs

```powershell
# ใน MongoDB
mongosh
use botanical-audit-uat
db.auditlogs.find().sort({createdAt: -1}).limit(10)
```

---

## 📝 Test Results Recording

### สร้างไฟล์บันทึกผลการทดสอบ

```powershell
# สร้างโฟลเดอร์สำหรับเก็บผลการทดสอบ
New-Item -ItemType Directory -Path ".\test-results\uat-$(Get-Date -Format 'yyyy-MM-dd')"

# บันทึกผลการทดสอบ
npm run uat:test > ".\test-results\uat-$(Get-Date -Format 'yyyy-MM-dd')\results.txt"
```

---

## 🎯 Success Criteria Checklist

### Before Starting UAT

- [ ] MongoDB running
- [ ] .env.uat configured
- [ ] Test data seeded (13 users, 10 farms, 13 applications)
- [ ] Server starts successfully
- [ ] All routes loading correctly
- [ ] API endpoints responding

### During UAT

- [ ] All 5 roles tested
- [ ] All 6 modules tested
- [ ] 92 test cases executed
- [ ] Bugs documented
- [ ] User feedback collected

### After UAT

- [ ] Pass rate ≥ 95%
- [ ] All critical bugs fixed
- [ ] Documentation updated
- [ ] Stakeholder sign-off
- [ ] Ready for production

---

## 🔗 Useful Links

| Resource              | URL                                  |
| --------------------- | ------------------------------------ |
| **UAT Test Plan**     | `docs/UAT_TEST_PLAN.md`              |
| **UAT Manual (Thai)** | `docs/UAT_MANUAL_TH.md`              |
| **UAT Summary**       | `docs/UAT_IMPLEMENTATION_SUMMARY.md` |
| **Farmer Portal**     | http://localhost:3000                |
| **DTAM Portal**       | http://localhost:3002                |
| **API Backend**       | http://localhost:3001                |
| **API Docs**          | http://localhost:3001/api-docs       |
| **Bug Report Form**   | [Create Issue on GitHub]             |

---

## 📞 Support Contacts

**UAT Team:**

- 📧 Email: uat-support@botanical.test
- 📱 Line: @botanical-uat
- 💬 Slack: #botanical-uat

**Technical Support:**

- 🐛 Bug Tracker: GitHub Issues
- 📖 Documentation: `/docs` folder
- 💻 Source Code: GitHub Repository

---

## 🎉 Ready to Start!

ระบบพร้อมสำหรับการทดสอบ UAT แล้ว!

**Next Actions:**

1. ✅ Start MongoDB
2. ✅ Run `npm run uat:seed`
3. ✅ Run `npm run uat:server`
4. ✅ Begin manual testing
5. ✅ Document findings

**Good luck with UAT testing!** 🚀

---

**Generated by:** GitHub Copilot  
**Date:** October 20, 2025  
**Version:** 1.0
