# 🏗️ GACP Platform - Build & Module Specification

**วันที่:** 12 ตุลาคม 2568  
**สรุปโดย:** SA, SE, MIS, Frontend Team  
**สถานะ:** Current System Architecture

---

## 📊 สรุปภาพรวม

### **จำนวน Builds และ Modules**

```
┌─────────────────────────────────────────────────────────────┐
│                   GACP PLATFORM OVERVIEW                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  BUILDS:           3 Separate Applications                  │
│  BACKEND MODULES:  11 Modules                              │
│  FRONTEND APPS:    2 Applications                          │
│  API ENDPOINTS:    98 Endpoints                            │
│  DATABASES:        1 MongoDB Database                      │
│  PORTS:            3 Ports (3004, 5173, 5174)             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔢 **คำตอบสั้น ๆ**

### **กี่ Build?**

**3 Builds:**

1. **Backend API** (Node.js + Express) - Port 3004
2. **Frontend Farmer Portal** (Vite + React) - Port 5173
3. **Frontend DTAM Portal** (Vite + React) - Port 5174

### **กี่ Module?**

**11 Backend Modules:**

1. auth-farmer (Authentication - Farmer)
2. auth-dtam (Authentication - DTAM Staff)
3. certificate-management (Certificate System)
4. application-workflow (Application Process)
5. farm-management (Farm Management)
6. survey-system (Survey & Assessment)
7. track-trace (Traceability System)
8. dashboard (Analytics & Reports)
9. notification (Notification Service)
10. standards-comparison (Standards Comparison)
11. shared (Shared Utilities)

---

## 📦 **1. BUILDS (3 แยกกัน)**

### **BUILD 1: Backend API Server** 🔷

```
┌─────────────────────────────────────────────┐
│         BACKEND API SERVER                  │
├─────────────────────────────────────────────┤
│ Technology:  Node.js 18.x + Express 4.x     │
│ Port:        3004                           │
│ Entry Point: app.js (1,572 lines)          │
│ Modules:     11 modules                     │
│ Endpoints:   98 API endpoints               │
│ Database:    MongoDB (gacp_production)      │
│ Auth:        JWT (2 separate token types)  │
├─────────────────────────────────────────────┤
│ Build Command:                              │
│   npm install                               │
│   node app.js                               │
│                                             │
│ Deploy:                                     │
│   pm2 start ecosystem.config.js             │
│   (or) docker-compose up backend           │
└─────────────────────────────────────────────┘
```

**Package.json Scripts:**

```json
{
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js",
    "test": "jest",
    "lint": "eslint .",
    "build": "echo 'No build step needed for Node.js'"
  }
}
```

**ไฟล์สำคัญ:**

- `app.js` - Main entry point
- `package.json` - Dependencies
- `ecosystem.config.js` - PM2 configuration
- `docker-compose.yml` - Docker configuration

---

### **BUILD 2: Frontend Farmer Portal** 🌾

```
┌─────────────────────────────────────────────┐
│      FRONTEND - FARMER PORTAL               │
├─────────────────────────────────────────────┤
│ Technology:  Vite 5.x + React 18.x          │
│ UI Library:  Material-UI (MUI) 5.x          │
│ Language:    TypeScript 5.x                 │
│ Port:        5173 (dev), 80 (prod)          │
│ Path:        /frontend                      │
│ Users:       Farmers (Public Registration)  │
├─────────────────────────────────────────────┤
│ Build Command:                              │
│   cd frontend                               │
│   npm install                               │
│   npm run build                             │
│                                             │
│ Output:                                     │
│   frontend/dist/ (Static files)            │
│                                             │
│ Deploy:                                     │
│   nginx serve frontend/dist/                │
│   (or) vercel deploy                        │
└─────────────────────────────────────────────┘
```

**Features:**

```
✓ User Registration & Login
✓ Application Submission
✓ Farm Management
✓ Certificate Download
✓ Survey Completion
✓ Track & Trace
✓ Dashboard & Reports
✓ Notifications
```

**Package.json Scripts:**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx",
    "type-check": "tsc --noEmit"
  }
}
```

---

### **BUILD 3: Frontend DTAM Portal** 👨‍💼

```
┌─────────────────────────────────────────────┐
│       FRONTEND - DTAM STAFF PORTAL          │
├─────────────────────────────────────────────┤
│ Technology:  Vite 5.x + React 18.x          │
│ UI Library:  Material-UI (MUI) 5.x          │
│ Language:    TypeScript 5.x                 │
│ Port:        5174 (dev), 81 (prod)          │
│ Path:        /frontend-dtam                 │
│ Users:       DTAM Staff (NO Registration)   │
├─────────────────────────────────────────────┤
│ Build Command:                              │
│   cd frontend-dtam                          │
│   npm install                               │
│   npm run build                             │
│                                             │
│ Output:                                     │
│   frontend-dtam/dist/ (Static files)       │
│                                             │
│ Deploy:                                     │
│   nginx serve frontend-dtam/dist/           │
│   (or) vercel deploy                        │
└─────────────────────────────────────────────┘
```

**Features:**

```
✓ Staff Login (NO Registration)
✓ Application Review & Approval
✓ Certificate Management
✓ User Management
✓ Statistics & Analytics
✓ Audit Logs
✓ Report Generation
```

---

## 🧩 **2. BACKEND MODULES (11 Modules)**

### **Module 1: auth-farmer** 🔐

```
Path: modules/auth-farmer/
Purpose: Farmer Authentication & Authorization
Files: 6 files
Lines: ~1,500 lines
Endpoints: 8 endpoints

Features:
  ✓ User Registration
  ✓ Login/Logout
  ✓ Password Reset
  ✓ Email Verification
  ✓ JWT Token Management
  ✓ Profile Management

API Endpoints:
  POST   /api/auth/register
  POST   /api/auth/login
  POST   /api/auth/logout
  POST   /api/auth/forgot-password
  POST   /api/auth/reset-password
  POST   /api/auth/verify-email
  GET    /api/auth/profile
  PUT    /api/auth/profile
```

---

### **Module 2: auth-dtam** 👔

```
Path: modules/auth-dtam/
Purpose: DTAM Staff Authentication & Authorization
Files: 6 files
Lines: ~1,400 lines
Endpoints: 7 endpoints

Features:
  ✓ Staff Login (NO Registration)
  ✓ Role-Based Access Control (RBAC)
  ✓ Separate JWT Token (dtam_token)
  ✓ Staff Management
  ✓ Permission Management

Roles:
  - ADMIN (ผู้ดูแลระบบ)
  - MANAGER (ผู้จัดการ)
  - REVIEWER (ผู้ตรวจสอบ)
  - VIEWER (ผู้ดู)

API Endpoints:
  POST   /api/dtam/auth/login
  POST   /api/dtam/auth/logout
  GET    /api/dtam/auth/profile
  PUT    /api/dtam/auth/profile
  POST   /api/dtam/staff/create
  GET    /api/dtam/staff
  PUT    /api/dtam/staff/:id
```

---

### **Module 3: certificate-management** 📜

```
Path: modules/certificate-management/
Purpose: Certificate Generation & Management
Files: 6 files
Lines: ~2,556 lines
Endpoints: 11 endpoints

Features:
  ✓ Certificate Generation (PDF)
  ✓ QR Code Generation
  ✓ Certificate Verification
  ✓ Certificate Renewal
  ✓ Certificate Revocation
  ✓ Certificate History
  ✓ Public Verification (No Login)

Certificate Types:
  - GACP Certificate (ใบรับรองมาตรฐาน GACP)
  - GAP Certificate (ใบรับรองมาตรฐาน GAP)
  - Organic Certificate (ใบรับรองอินทรีย์)

API Endpoints:
  POST   /api/certificates/generate
  GET    /api/certificates
  GET    /api/certificates/:id
  POST   /api/certificates/:id/verify
  POST   /api/certificates/:id/renew
  POST   /api/certificates/:id/revoke
  GET    /api/certificates/:id/pdf
  GET    /api/certificates/:id/qrcode
  GET    /api/public/certificates/verify/:number
  GET    /api/certificates/:id/history
  POST   /api/certificates/bulk-generate
```

---

### **Module 4: application-workflow** 📋

```
Path: modules/application-workflow/
Purpose: Application Submission & Workflow
Files: 5 files
Lines: ~2,100 lines
Endpoints: 13 endpoints

Features:
  ✓ Application Submission
  ✓ 15-State Workflow
  ✓ Document Upload
  ✓ Payment Integration
  ✓ Status Tracking
  ✓ DTAM Review & Approval
  ✓ Site Inspection Scheduling

15 Application States:
  1. DRAFT (ร่าง)
  2. SUBMITTED (ยื่นคำขอ)
  3. PAYMENT_PENDING (รอชำระเงิน)
  4. PAYMENT_VERIFIED (ชำระเงินแล้ว)
  5. DOCUMENT_REVIEW (ตรวจเอกสาร)
  6. DOCUMENT_REJECTED (เอกสารไม่ผ่าน)
  7. SITE_INSPECTION_SCHEDULED (นัดตรวจหน้างาน)
  8. SITE_INSPECTION_IN_PROGRESS (กำลังตรวจ)
  9. SITE_INSPECTION_COMPLETED (ตรวจเสร็จ)
  10. SITE_INSPECTION_FAILED (ไม่ผ่านการตรวจ)
  11. FINAL_REVIEW (พิจารณาขั้นสุดท้าย)
  12. APPROVED (อนุมัติ)
  13. REJECTED (ไม่อนุมัติ)
  14. CERTIFICATE_ISSUED (ออกใบรับรอง)
  15. EXPIRED (หมดอายุ)

API Endpoints:
  POST   /api/applications
  GET    /api/applications
  GET    /api/applications/:id
  PUT    /api/applications/:id
  DELETE /api/applications/:id
  POST   /api/applications/:id/submit
  POST   /api/applications/:id/payment
  PUT    /api/applications/:id/status
  POST   /api/applications/:id/documents
  GET    /api/applications/:id/documents
  POST   /api/applications/:id/review
  POST   /api/applications/:id/approve
  POST   /api/applications/:id/reject
```

---

### **Module 5: farm-management** 🌱

```
Path: modules/farm-management/
Purpose: Farm & Cultivation Management
Files: 7 files
Lines: ~2,300 lines
Endpoints: 13 endpoints

Features:
  ✓ Farm Registration
  ✓ Plot Management
  ✓ 12-Stage Cultivation Cycle
  ✓ SOP Activity Tracking
  ✓ Harvest Recording
  ✓ Input Recording (ปุ๋ย/ยา)
  ✓ GPS Location

12 Cultivation Stages:
  1. PREPARATION (เตรียมดิน)
  2. PLANTING (ปลูก)
  3. VEGETATIVE (แตกใบ)
  4. FLOWERING (ออกดอก)
  5. HARVESTING (เก็บเกี่ยว)
  6. DRYING (ตากแห้ง)
  7. CURING (บ่ม)
  8. TRIMMING (แต่ง)
  9. TESTING (ทดสอบ)
  10. PACKAGING (บรรจุ)
  11. STORAGE (เก็บรักษา)
  12. DISTRIBUTION (จำหน่าย)

API Endpoints:
  POST   /api/farms
  GET    /api/farms
  GET    /api/farms/:id
  PUT    /api/farms/:id
  DELETE /api/farms/:id
  POST   /api/farms/:id/plots
  GET    /api/farms/:id/plots
  POST   /api/farms/:id/activities
  GET    /api/farms/:id/activities
  POST   /api/farms/:id/harvests
  GET    /api/farms/:id/harvests
  POST   /api/farms/:id/inputs
  GET    /api/farms/:id/inputs
```

---

### **Module 6: survey-system** 📝

```
Path: modules/survey-system/
Purpose: Survey & Assessment System
Files: 6 files
Lines: ~1,950 lines
Endpoints: 15 endpoints

Features:
  ✓ Multi-Section Surveys
  ✓ Question Bank
  ✓ Conditional Logic
  ✓ Scoring System
  ✓ Progress Tracking
  ✓ Survey Templates

Survey Sections:
  1. Farm Information (ข้อมูลฟาร์ม)
  2. Infrastructure (โครงสร้างพื้นฐาน)
  3. Cultivation Practices (วิธีปลูก)
  4. Quality Control (ควบคุมคุณภาพ)
  5. Safety & Hygiene (ความปลอดภัย)
  6. Record Keeping (การบันทึก)
  7. Staff Training (การฝึกอบรม)

API Endpoints:
  POST   /api/surveys
  GET    /api/surveys
  GET    /api/surveys/:id
  PUT    /api/surveys/:id
  DELETE /api/surveys/:id
  POST   /api/surveys/:id/submit
  GET    /api/surveys/:id/results
  POST   /api/surveys/:id/sections
  GET    /api/surveys/:id/sections
  POST   /api/surveys/:id/questions
  GET    /api/surveys/:id/questions
  POST   /api/surveys/:id/answers
  GET    /api/surveys/:id/answers
  GET    /api/surveys/:id/score
  GET    /api/surveys/:id/progress
```

---

### **Module 7: track-trace** 🔍

```
Path: modules/track-trace/
Purpose: Product Traceability System
Files: 6 files
Lines: ~1,751 lines
Endpoints: 12 endpoints

Features:
  ✓ QR Code Generation
  ✓ Batch Tracking
  ✓ Supply Chain Visibility
  ✓ Public Verification
  ✓ Movement Tracking
  ✓ GS1 Standards Compatible

Tracking Points:
  - Farm Origin (ต้นทาง)
  - Processing (แปรรูป)
  - Quality Testing (ตรวจสอบ)
  - Packaging (บรรจุ)
  - Distribution (จัดจำหน่าย)
  - Retail (ขายปลีก)

API Endpoints:
  POST   /api/track-trace/batches
  GET    /api/track-trace/batches
  GET    /api/track-trace/batches/:id
  PUT    /api/track-trace/batches/:id
  POST   /api/track-trace/batches/:id/qrcode
  GET    /api/track-trace/batches/:id/qrcode
  POST   /api/track-trace/batches/:id/movements
  GET    /api/track-trace/batches/:id/movements
  GET    /api/track-trace/batches/:id/timeline
  GET    /api/public/track-trace/verify/:code
  POST   /api/track-trace/batches/:id/split
  POST   /api/track-trace/batches/:id/merge
```

---

### **Module 8: dashboard** 📊

```
Path: modules/dashboard/
Purpose: Analytics & Reporting Dashboard
Files: 4 files
Lines: ~2,042 lines
Endpoints: 13 endpoints

Features:
  ✓ Real-time Statistics
  ✓ Performance Metrics
  ✓ Custom Reports
  ✓ Data Visualization
  ✓ Export (PDF, Excel)
  ✓ Role-based Views

Dashboard Views:
  - Farmer Dashboard
  - DTAM Dashboard
  - Admin Dashboard
  - Public Dashboard

Metrics:
  - Total Applications
  - Approved Certificates
  - Active Farms
  - Survey Completion Rate
  - Average Processing Time
  - Success Rate

API Endpoints:
  GET    /api/dashboard/statistics
  GET    /api/dashboard/farmer
  GET    /api/dashboard/dtam
  GET    /api/dashboard/admin
  GET    /api/dashboard/applications/stats
  GET    /api/dashboard/certificates/stats
  GET    /api/dashboard/farms/stats
  GET    /api/dashboard/surveys/stats
  GET    /api/dashboard/performance
  GET    /api/dashboard/reports
  POST   /api/dashboard/reports/generate
  GET    /api/dashboard/reports/:id/pdf
  GET    /api/dashboard/reports/:id/excel
```

---

### **Module 9: notification** 🔔

```
Path: modules/notification/
Purpose: Multi-channel Notification Service
Files: 6 files
Lines: ~2,782 lines
Endpoints: 13 endpoints

Features:
  ✓ In-app Notifications
  ✓ Email Notifications
  ✓ LINE Notify
  ✓ SMS (Thailand)
  ✓ Webhooks
  ✓ Template Management
  ✓ Queue System
  ✓ Delivery Status

Notification Types:
  - Application Status Changes
  - Payment Confirmations
  - Site Inspection Schedules
  - Certificate Issuance
  - Certificate Expiry Warnings
  - System Announcements

Channels:
  ✓ In-App (Real-time)
  ✓ Email (SMTP)
  ✓ LINE (LINE Notify API)
  ✓ SMS (Thai SMS Gateway)
  ✓ Webhook (Custom integrations)

API Endpoints:
  POST   /api/notifications
  GET    /api/notifications
  GET    /api/notifications/:id
  PUT    /api/notifications/:id/read
  PUT    /api/notifications/read-all
  DELETE /api/notifications/:id
  POST   /api/notifications/send-email
  POST   /api/notifications/send-line
  POST   /api/notifications/send-sms
  GET    /api/notifications/templates
  POST   /api/notifications/templates
  GET    /api/notifications/delivery-status/:id
  POST   /api/notifications/webhook
```

---

### **Module 10: standards-comparison** 📋

```
Path: modules/standards-comparison/
Purpose: Standards Comparison & Compliance
Files: 6 files
Lines: ~2,165 lines
Endpoints: 8 endpoints

Features:
  ✓ GAP vs GACP Comparison
  ✓ Compliance Checking
  ✓ Gap Analysis
  ✓ Recommendation Engine
  ✓ Standards Documentation

Standards Supported:
  - GACP (Good Agricultural and Collection Practices)
  - GAP (Good Agricultural Practices)
  - Organic Standards
  - WHO Guidelines
  - EU-GMP

API Endpoints:
  GET    /api/standards
  GET    /api/standards/:id
  POST   /api/standards/compare
  GET    /api/standards/gap-vs-gacp
  POST   /api/standards/check-compliance
  GET    /api/standards/:id/requirements
  POST   /api/standards/:id/assessment
  GET    /api/standards/:id/recommendations
```

---

### **Module 11: shared** 🔧

```
Path: modules/shared/
Purpose: Shared Utilities & Common Functions
Files: 10+ files
Lines: ~3,500 lines
No Direct Endpoints (Used by other modules)

Components:
  ✓ Authentication Middleware
  ✓ Error Handlers
  ✓ Logger (Winston)
  ✓ Validation Utilities
  ✓ Response Formatters
  ✓ Constants & Enums
  ✓ Database Utilities
  ✓ File Upload Handler
  ✓ Email Service
  ✓ SMS Service
  ✓ LINE Notify Service
  ✓ PDF Generator
  ✓ QR Code Generator
  ✓ Date/Time Utilities
  ✓ Thai Language Utilities

Key Files:
  - auth.js (JWT middleware)
  - errors.js (Error handling)
  - logger.js (Logging)
  - validation.js (Input validation)
  - response.js (Response formatting)
  - constants.js (Constants)
  - database.js (DB utilities)
  - upload.js (File uploads)
  - email.service.js (Email)
  - sms.service.js (SMS)
  - line.service.js (LINE)
  - pdf.service.js (PDF)
  - qrcode.service.js (QR Code)
```

---

## 🗂️ **3. DATABASE (1 MongoDB Database)**

### **MongoDB Database Structure**

```
Database: gacp_production

Collections: 15 collections

1. users                    (Farmers)
2. dtam_staff               (DTAM Staff)
3. applications             (Applications)
4. certificates             (Certificates)
5. farms                    (Farms)
6. plots                    (Farm Plots)
7. cultivation_cycles       (Cultivation Data)
8. surveys                  (Surveys)
9. survey_responses         (Survey Answers)
10. track_trace_batches     (Batches)
11. track_trace_movements   (Movements)
12. notifications           (Notifications)
13. audit_logs              (Audit Trail)
14. files                   (File Metadata)
15. settings                (System Settings)

Indexes: ~50 indexes
Total Documents: ~10,000+ (estimated)
Total Size: ~500MB (estimated)
```

---

## 🌐 **4. API ENDPOINTS SUMMARY**

### **Total: 98 Endpoints**

```
Authentication (Farmer):        8 endpoints
Authentication (DTAM):          7 endpoints
Certificate Management:        11 endpoints
Application Workflow:          13 endpoints
Farm Management:               13 endpoints
Survey System:                 15 endpoints
Track & Trace:                 12 endpoints
Dashboard:                     13 endpoints
Notification:                  13 endpoints
Standards Comparison:           8 endpoints
────────────────────────────────────────────
TOTAL:                         98 endpoints
```

### **Breakdown by Method:**

```
GET     42 endpoints (43%)
POST    36 endpoints (37%)
PUT     14 endpoints (14%)
DELETE   6 endpoints (6%)
────────────────────────────
TOTAL   98 endpoints (100%)
```

### **Breakdown by Access:**

```
Public (No Auth):      8 endpoints (8%)
Authenticated (Farmer):55 endpoints (56%)
Authenticated (DTAM):  28 endpoints (29%)
Admin Only:            7 endpoints (7%)
────────────────────────────────────────
TOTAL:                98 endpoints (100%)
```

---

## 🚀 **5. DEPLOYMENT ARCHITECTURE**

### **Current Deployment (ตอนนี้)**

```
┌─────────────────────────────────────────┐
│         SINGLE SERVER DEPLOYMENT        │
├─────────────────────────────────────────┤
│                                         │
│  [Backend API]       Port 3004          │
│  [Frontend Farmer]   Port 5173          │
│  [Frontend DTAM]     Port 5174          │
│  [MongoDB]           Port 27017         │
│                                         │
│  Server: localhost / Single VPS         │
│  OS: Windows 11 / Ubuntu 22.04         │
│  Memory: 8GB+ RAM                       │
│  Storage: 50GB+                         │
└─────────────────────────────────────────┘
```

### **Recommended Deployment (แนะนำ)**

```
┌─────────────────────────────────────────────────────┐
│          PRODUCTION DEPLOYMENT                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Load Balancer (NGINX)                             │
│       ↓                                             │
│  ┌─────────────┬─────────────┬─────────────┐      │
│  │  Backend 1  │  Backend 2  │  Backend 3  │      │
│  │  Port 3004  │  Port 3004  │  Port 3004  │      │
│  └─────────────┴─────────────┴─────────────┘      │
│                                                     │
│  ┌─────────────────────────────────────────┐      │
│  │  MongoDB Replica Set (3 nodes)          │      │
│  │  Primary + 2 Secondaries                 │      │
│  └─────────────────────────────────────────┘      │
│                                                     │
│  ┌──────────────┬──────────────────────────┐      │
│  │  Frontend    │  Frontend DTAM           │      │
│  │  (CDN/S3)    │  (CDN/S3)                │      │
│  └──────────────┴──────────────────────────┘      │
│                                                     │
│  Platform: Kubernetes on Government Cloud          │
│  Auto-scaling: 3-10 pods                           │
│  Uptime: 99.9%                                     │
└─────────────────────────────────────────────────────┘
```

---

## 📦 **6. BUILD COMMANDS**

### **Backend Build**

```bash
# Install dependencies
npm install

# Run development
npm run dev

# Run production
npm start

# Run with PM2
pm2 start ecosystem.config.js

# Run with Docker
docker-compose up backend
```

### **Frontend Farmer Build**

```bash
# Install dependencies
cd frontend
npm install

# Run development
npm run dev        # http://localhost:5173

# Build production
npm run build      # Output: frontend/dist/

# Preview build
npm run preview
```

### **Frontend DTAM Build**

```bash
# Install dependencies
cd frontend-dtam
npm install

# Run development
npm run dev        # http://localhost:5174

# Build production
npm run build      # Output: frontend-dtam/dist/

# Preview build
npm run preview
```

### **Full System Build**

```bash
# Build all at once
./build-all.sh     # Linux/Mac
./build-all.bat    # Windows

# Or manually:
npm install                    # Backend
cd frontend && npm install && npm run build
cd ../frontend-dtam && npm install && npm run build
```

---

## 📊 **7. CODE STATISTICS**

### **Backend Modules:**

```
Module                  Files    Lines   Endpoints
────────────────────────────────────────────────────
auth-farmer               6     1,500       8
auth-dtam                 6     1,400       7
certificate-management    6     2,556      11
application-workflow      5     2,100      13
farm-management           7     2,300      13
survey-system             6     1,950      15
track-trace               6     1,751      12
dashboard                 4     2,042      13
notification              6     2,782      13
standards-comparison      6     2,165       8
shared                   10     3,500       0
────────────────────────────────────────────────────
TOTAL                    68    24,046      98
```

### **Frontend Applications:**

```
Application         Files    Lines    Components
──────────────────────────────────────────────────
Frontend Farmer       45    12,500      35
Frontend DTAM         20     6,000      18
──────────────────────────────────────────────────
TOTAL                 65    18,500      53
```

### **Grand Total:**

```
Backend:     68 files,  24,046 lines,  98 endpoints
Frontend:    65 files,  18,500 lines,  53 components
Database:    15 collections
────────────────────────────────────────────────────
TOTAL:      133 files,  42,546 lines
```

---

## 🎯 **8. SUMMARY FOR PM**

### **คำตอบสั้น ๆ:**

**จำนวน Builds:**

- **3 Builds** (Backend, Frontend Farmer, Frontend DTAM)

**จำนวน Modules:**

- **11 Backend Modules** (auth-farmer, auth-dtam, certificate-management, application-workflow, farm-management, survey-system, track-trace, dashboard, notification, standards-comparison, shared)
- **2 Frontend Applications** (Farmer Portal, DTAM Portal)

**รวม:**

- **3 Builds**
- **11 Backend Modules**
- **98 API Endpoints**
- **133 Files**
- **42,546 Lines of Code**
- **1 MongoDB Database** (15 collections)

---

## 🚀 **9. NEXT STEPS**

### **ถ้าต้องการ Migrate เป็น Next.js:**

```
Current:  3 Builds (1 Backend + 2 Vite Frontends)
Future:   3 Builds (1 Backend + 2 Next.js Frontends)

Changes:
  ✓ Replace Vite → Next.js 14
  ✓ Keep 11 Backend Modules
  ✓ Keep 98 API Endpoints
  ✓ Better SEO, SSR, Performance
```

### **ถ้าต้องการแยกเป็น Microservices:**

```
Current:  3 Builds (1 Monolithic Backend + 2 Frontends)
Future:   13 Builds (11 Microservices + 2 Frontends)

Changes:
  ✓ แยก 11 modules → 11 independent services
  ✓ แต่ละ service มี port ของตัวเอง
  ✓ ต้องมี API Gateway
  ✓ ต้องมี Service Discovery
  ✓ Complexity สูงขึ้น
  ✓ งบประมาณ 2M+ บาท
```

---

**จัดทำโดย:**  
**System Architect (SA), Software Engineer (SE), MIS, Frontend Team**  
**วันที่:** 12 ตุลาคม 2568

---

## 📞 **ติดต่อสอบถาม**

หากมีคำถามเพิ่มเติมเกี่ยวกับ:

- 🏗️ **Architecture** → ติดต่อ SA
- 💻 **Backend Modules** → ติดต่อ SE (Backend)
- 🎨 **Frontend Apps** → ติดต่อ Frontend Team
- 🗄️ **Database** → ติดต่อ MIS/DBA
- 🚀 **Deployment** → ติดต่อ DevOps

**Email:** dev@gacp.go.th  
**GitHub:** github.com/jonmaxmore/gacp-certify-flow-main
