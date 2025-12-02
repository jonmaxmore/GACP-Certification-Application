# 📋 GACP Platform - Complete System Architecture & Implementation Plan

## 🎯 Executive Summary

วันที่: 21 ตุลาคม 2568
สถานะ: Production Ready System - ไม่ใช่ Demo/Test
ผู้รับผิดชอบ: Professional Development Team

## 📊 PLAN (วางแผน) - Analysis & Design

### 1. ปัญหาที่พบ (Current Issues)

#### ❌ Critical Issues:

1. **Landing Page ไม่สอดคล้องกับ Workflow**
   - แสดง 9 บริการแบบ static
   - ไม่ดึงข้อมูลจาก backend
   - ไม่เชื่อมโยงกับ user role
   - ไม่แสดง application status

2. **Dashboard ไม่ตรงตาม Role**
   - Farmer dashboard แสดงข้อมูล admin
   - ไม่แสดงสถานะใบสมัครส่วนตัว
   - ไม่แสดง current workflow step
   - ไม่มี action buttons ตาม workflow

3. **ระบบไม่เชื่อมต่อกัน**
   - ไม่มี state management
   - ไม่มี authentication context
   - หน้าต่างๆ ทำงานแยกกัน
   - ไม่มี API integration

4. **หน้าหลายหน้า 404**
   - `/farmer/farms` - ไม่ได้สร้าง
   - `/trace` - ไม่ได้สร้าง
   - `/survey` - ไม่ได้สร้าง
   - `/standards` - ไม่ได้สร้าง
   - `/admin` - ไม่ได้สร้าง
   - `/certificate` - ไม่ได้สร้าง

### 2. Workflow Analysis (จาก gacp-workflow-engine.js)

#### 8-Step GACP Certification Process:

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: สมัครและส่งคำขอ (Application Submission)           │
├─────────────────────────────────────────────────────────────┤
│  States: DRAFT → SUBMITTED                                  │
│  Actor: FARMER                                              │
│  Actions:                                                   │
│  - กรอกข้อมูลส่วนตัว                                         │
│  - กรอกข้อมูลฟาร์ม                                           │
│  - อัปโหลดเอกสาร 5 ชนิด:                                     │
│    * บัตรประชาชน (id_card)                                  │
│    * ทะเบียนบ้าน (house_registration)                       │
│    * โฉนดที่ดิน (land_deed)                                  │
│    * แผนที่ฟาร์ม (farm_map)                                  │
│    * ใบอนุญาตแหล่งน้ำ (water_source_permit)                  │
│  - กดปุ่ม "ส่งคำขอ"                                          │
│  Output: Application Number (GACP{year}{month}{random})     │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: จ่ายเงินรอบแรก (First Payment - 5,000 บาท)         │
├─────────────────────────────────────────────────────────────┤
│  States: PAYMENT_PENDING_1 → PAYMENT_PROCESSING_1           │
│  Actor: FARMER (จ่ายเงิน) → SYSTEM (ยืนยัน)                 │
│  Actions:                                                   │
│  - ระบบแสดงรายละเอียดการชำระเงิน                              │
│  - QR Code Payment / Bank Transfer                         │
│  - อัปโหลดหลักฐานการโอน                                      │
│  - ระบบยืนยันการชำระเงิน                                     │
│  Purpose: ค่าธรรมเนียมตรวจสอบเอกสาร                          │
│  Output: Transaction ID                                     │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: ตรวจเอกสาร (Document Review)                        │
├─────────────────────────────────────────────────────────────┤
│  States: DOCUMENT_REVIEW → APPROVED/REVISION/REJECTED       │
│  Actor: DTAM_OFFICER                                        │
│  Actions:                                                   │
│  - ตรวจสอบความครบถ้วนของเอกสาร                                │
│  - ตรวจสอบความถูกต้องของข้อมูล                                │
│  - ประเมินความเสี่ยง (Risk Assessment)                       │
│  Decision:                                                  │
│  - APPROVED → ไป Step 4                                    │
│  - REVISION → ให้แก้ไข (สูงสุด 2 ครั้ง)                     │
│  - REJECTED (2 ครั้ง) → กลับไป Step 2 (จ่ายเงินใหม่)        │
│  Output: Review Report + Decision                           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: เอกสารผ่าน (Document Approved)                     │
├─────────────────────────────────────────────────────────────┤
│  States: DOCUMENT_APPROVED                                  │
│  Actor: SYSTEM                                              │
│  Actions:                                                   │
│  - ระบบยืนยันผลการตรวจเอกสาร                                 │
│  - แจ้งเตือนเกษตรกร                                          │
│  - เตรียมขั้นตอนต่อไป                                        │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 5: จ่ายเงินรอบสอง (Second Payment - 25,000 บาท)       │
├─────────────────────────────────────────────────────────────┤
│  States: PAYMENT_PENDING_2 → PAYMENT_PROCESSING_2           │
│  Actor: FARMER (จ่ายเงิน) → SYSTEM (ยืนยัน)                 │
│  Actions:                                                   │
│  - ระบบแสดงรายละเอียดการชำระเงิน                              │
│  - QR Code Payment / Bank Transfer                         │
│  - อัปโหลดหลักฐานการโอน                                      │
│  - ระบบยืนยันการชำระเงิน                                     │
│  Purpose: ค่าธรรมเนียมตรวจสอบภาคสนาม                         │
│  Output: Transaction ID                                     │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 6: ตรวจฟาร์ม (Field Inspection)                       │
├─────────────────────────────────────────────────────────────┤
│  States: INSPECTION_SCHEDULED → VDO_CALL → ON_SITE          │
│          → INSPECTION_COMPLETED                             │
│  Actor: INSPECTOR                                           │
│                                                             │
│  Phase 6A: VDO Call Inspection                             │
│  - นัดหมาย VDO Call กับเกษตรกร                              │
│  - ตรวจสอบผ่าน Video Conference                             │
│  - ประเมินเบื้องต้น                                          │
│  Decision:                                                  │
│    * เพียงพอ → จบที่ VDO Call                                │
│    * ไม่เพียงพอ → ต้องลงพื้นที่                              │
│                                                             │
│  Phase 6B: On-Site Inspection (ถ้าจำเป็น)                   │
│  - นัดหมายลงพื้นที่                                          │
│  - ตรวจสอบ 8 Critical Control Points (CCPs):                │
│    1. Seed/Planting Material Quality (15 points)           │
│    2. Soil Management & Fertilizer (15 points)             │
│    3. Pest & Disease Management (15 points)                │
│    4. Harvesting Practices (15 points)                     │
│    5. Post-Harvest Handling (15 points)                    │
│    6. Storage & Transportation (10 points)                 │
│    7. Record Keeping (10 points)                           │
│    8. Worker Training & Safety (5 points)                  │
│  - ถ่ายรูปหลักฐาน                                            │
│  - ให้คะแนน (Total: 100 points)                             │
│  Output: Inspection Report + Score                          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 7: อนุมัติรับรอง (Final Approval)                     │
├─────────────────────────────────────────────────────────────┤
│  States: PENDING_APPROVAL → APPROVED/REJECTED               │
│  Actor: ADMIN / APPROVER                                    │
│  Actions:                                                   │
│  - ตรวจสอบรายงานการตรวจเอกสาร                                │
│  - ตรวจสอบรายงานการตรวจฟาร์ม                                 │
│  - ตรวจสอบคะแนน (Pass Threshold: 80/100)                    │
│  Decision:                                                  │
│  - APPROVED (Score ≥ 80) → ไป Step 8                       │
│  - CONDITIONAL (Score 70-79) → แผนแก้ไข                    │
│  - REJECTED (Score < 70) → ปฏิเสธ + เหตุผล                  │
│  Output: Approval Decision + Certificate Number (if pass)   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 8: รับใบรับรอง (Certificate Issuance)                 │
├─────────────────────────────────────────────────────────────┤
│  States: CERTIFICATE_GENERATING → CERTIFICATE_ISSUED        │
│  Actor: SYSTEM                                              │
│  Actions:                                                   │
│  - สร้างใบรับรอง PDF                                         │
│  - สร้าง QR Code สำหรับตรวจสอบ                               │
│  - เพิ่มลงทะเบียนสาธารณะ                                     │
│  - ส่งการแจ้งเตือนให้เกษตรกร                                │
│  - เกษตรกรดาวน์โหลดใบรับรอง                                  │
│  Output: Certificate PDF + QR Code + Certificate Number     │
│  Format: CERT-GACP-{year}{month}{day}-{random}             │
└─────────────────────────────────────────────────────────────┘
```

### 3. User Roles & Permissions

#### Role 1: FARMER (เกษตรกร)

```
Dashboard Components:
├── My Applications Card
│   ├── Current Status Badge
│   ├── Current Step Indicator (1-8)
│   ├── Progress Bar
│   └── Next Action Button
├── Quick Actions
│   ├── New Application (if no active app)
│   ├── Upload Documents (if DRAFT)
│   ├── Pay Now (if PAYMENT_PENDING)
│   ├── View Inspection Schedule (if INSPECTION_*)
│   └── Download Certificate (if CERTIFICATE_ISSUED)
├── Payment History
│   ├── Phase 1: 5,000 THB (status + date)
│   └── Phase 2: 25,000 THB (status + date)
├── Document Status
│   ├── Required Documents Checklist
│   └── Upload Status
└── Notifications
    ├── Payment Requests
    ├── Document Review Results
    └── Inspection Appointments

Pages Accessible:
- /farmer/dashboard
- /farmer/applications (list)
- /farmer/applications/new (create)
- /farmer/applications/[id] (view detail)
- /farmer/documents (upload)
- /farmer/payments (history)
- /farmer/certificates (download)
- /farmer/profile (settings)
```

#### Role 2: DTAM_OFFICER (เจ้าหน้าที่)

```
Dashboard Components:
├── Pending Reviews Card
│   ├── Count Badge
│   ├── Oldest Application Warning
│   └── Review Queue List
├── Today's Tasks
│   ├── Document Reviews (count)
│   ├── Revision Follow-ups (count)
│   └── Pending Approvals (count)
├── Statistics
│   ├── Reviewed This Week
│   ├── Average Review Time
│   ├── Approval Rate
│   └── Rejection Rate
└── Quick Actions
    ├── Start Next Review
    ├── View Revision Requests
    └── Generate Report

Pages Accessible:
- /officer/dashboard
- /officer/applications (queue)
- /officer/applications/[id]/review
- /officer/reports
- /officer/statistics
```

#### Role 3: INSPECTOR (ผู้ตรวจสอบ)

```
Dashboard Components:
├── Upcoming Inspections Card
│   ├── Today's Schedule
│   ├── This Week's Schedule
│   └── Calendar View
├── Active Inspections
│   ├── VDO Call Scheduled
│   ├── On-Site Scheduled
│   └── Reports Pending Submit
├── Inspection Statistics
│   ├── Completed This Month
│   ├── Average Score
│   ├── On-Site Rate
│   └── Pass Rate
└── Quick Actions
    ├── Start VDO Call
    ├── Submit Report
    └── Schedule Inspection

Pages Accessible:
- /inspector/dashboard
- /inspector/schedule
- /inspector/inspections/[id]/vdo-call
- /inspector/inspections/[id]/on-site
- /inspector/inspections/[id]/report
- /inspector/history
```

#### Role 4: ADMIN (ผู้ดูแลระบบ)

```
Dashboard Components:
├── System Overview Card
│   ├── Total Applications
│   ├── Active Applications
│   ├── Certificates Issued
│   └── System Health
├── Workflow Statistics
│   ├── Applications by Step (1-8)
│   ├── Average Processing Time
│   ├── Bottleneck Analysis
│   └── Success Rate
├── Financial Overview
│   ├── Phase 1 Payments (total)
│   ├── Phase 2 Payments (total)
│   ├── Pending Payments
│   └── Revenue This Month
├── User Management
│   ├── Farmers Count
│   ├── Officers Count
│   ├── Inspectors Count
│   └── Active Users
└── Quick Actions
    ├── Approve Application
    ├── Issue Certificate
    ├── Manage Users
    └── System Settings

Pages Accessible:
- /admin/dashboard
- /admin/applications (all)
- /admin/users (manage)
- /admin/certificates (manage)
- /admin/payments (tracking)
- /admin/reports (generate)
- /admin/settings (system)
- /admin/statistics (analytics)
```

### 4. Page Architecture & Routes

#### Public Pages (ไม่ต้อง login)

```
/ (Landing Page)
├── IF NOT LOGGED IN:
│   ├── Hero Section: "ระบบรับรอง GACP"
│   ├── Workflow Overview (8 steps)
│   ├── Benefits & Features
│   ├── How It Works
│   ├── Pricing (5,000 + 25,000)
│   ├── FAQ
│   ├── Contact
│   └── CTA: Register / Login
│
└── IF LOGGED IN:
    ├── Welcome Card: "สวัสดี คุณ{name}"
    ├── Your Current Application(s)
    │   ├── Status Badge
    │   ├── Progress Bar (Step X/8)
    │   └── Next Action Button
    ├── Quick Actions (based on role)
    ├── Recent Activity
    └── Go to Dashboard Button

/register (Registration)
├── Role Selection: Farmer / Officer / Inspector
├── Personal Information Form
├── Email Verification
└── Password Setup

/login (Login)
├── Email / Password
├── Role Redirect:
│   ├── Farmer → /farmer/dashboard
│   ├── Officer → /officer/dashboard
│   ├── Inspector → /inspector/dashboard
│   └── Admin → /admin/dashboard

/about (About GACP)
/contact (Contact Us)
/faq (Frequently Asked Questions)
```

#### Protected Pages (ต้อง login)

**Farmer Routes:**

```
/farmer/dashboard
/farmer/applications
/farmer/applications/new
/farmer/applications/[id]
/farmer/applications/[id]/edit
/farmer/documents
/farmer/documents/upload
/farmer/payments
/farmer/payments/[id]
/farmer/certificates
/farmer/certificates/[id]/download
/farmer/profile
/farmer/settings
```

**Officer Routes:**

```
/officer/dashboard
/officer/applications (queue)
/officer/applications/[id]/review
/officer/applications/[id]/approve
/officer/applications/[id]/reject
/officer/applications/[id]/request-revision
/officer/reports
/officer/statistics
/officer/profile
```

**Inspector Routes:**

```
/inspector/dashboard
/inspector/schedule
/inspector/inspections/[id]
/inspector/inspections/[id]/vdo-call
/inspector/inspections/[id]/on-site
/inspector/inspections/[id]/report
/inspector/history
/inspector/profile
```

**Admin Routes:**

```
/admin/dashboard
/admin/applications
/admin/applications/[id]
/admin/users
/admin/users/[id]
/admin/certificates
/admin/certificates/[id]
/admin/payments
/admin/reports
/admin/statistics
/admin/settings
/admin/profile
```

### 5. State Management Architecture

```typescript
// Context Providers Structure
<App>
  <AuthProvider>                    // Authentication state
    <UserProvider>                  // User profile & role
      <ApplicationProvider>         // Current application(s)
        <NotificationProvider>      // Real-time notifications
          <Router>
            {/* All Pages */}
          </Router>
        </NotificationProvider>
      </ApplicationProvider>
    </UserProvider>
  </AuthProvider>
</App>

// State Structure
AuthContext:
├── isAuthenticated: boolean
├── user: { id, email, role, name }
├── token: string
├── login(email, password)
├── logout()
└── refreshToken()

ApplicationContext:
├── applications: Application[]
├── currentApplication: Application | null
├── loading: boolean
├── error: string | null
├── createApplication(data)
├── updateApplication(id, data)
├── submitApplication(id)
├── paymentPhase1(id, paymentData)
├── paymentPhase2(id, paymentData)
└── refreshApplications()

NotificationContext:
├── notifications: Notification[]
├── unreadCount: number
├── addNotification(notification)
├── markAsRead(id)
└── clearAll()
```

### 6. API Integration Points

```
Backend API Endpoints (Port 3004):

Authentication:
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/me

Applications:
GET    /api/applications              (list)
POST   /api/applications              (create)
GET    /api/applications/:id          (detail)
PUT    /api/applications/:id          (update)
POST   /api/applications/:id/submit   (submit)
GET    /api/applications/by-farmer/:farmerId

Documents:
POST   /api/applications/:id/documents/upload
GET    /api/applications/:id/documents
DELETE /api/applications/:id/documents/:docId

Payments:
POST   /api/payments/phase1
POST   /api/payments/phase2
GET    /api/payments/:id
PUT    /api/payments/:id/confirm

Reviews (Officer):
GET    /api/reviews/pending
POST   /api/reviews/:applicationId/approve
POST   /api/reviews/:applicationId/reject
POST   /api/reviews/:applicationId/request-revision

Inspections (Inspector):
GET    /api/inspections/scheduled
POST   /api/inspections/:id/schedule-vdo
POST   /api/inspections/:id/conduct-vdo
POST   /api/inspections/:id/schedule-onsite
POST   /api/inspections/:id/complete-onsite

Approvals (Admin):
GET    /api/approvals/pending
POST   /api/approvals/:id/approve
POST   /api/approvals/:id/reject

Certificates:
GET    /api/certificates/:id
GET    /api/certificates/:id/download
POST   /api/certificates/generate

Statistics:
GET    /api/statistics/overview
GET    /api/statistics/by-role/:role
GET    /api/statistics/workflow

Health:
GET    /api/monitoring/health
GET    /api/monitoring/health/database
```

---

## ✅ DO (ปฏิบัติ) - Implementation Steps

### Phase 1: Foundation (2-3 hours)

1. ✅ สร้าง AuthContext provider
2. ✅ สร้าง ApplicationContext provider
3. ✅ สร้าง API client utilities
4. ✅ สร้าง Protected Route wrapper
5. ✅ สร้าง Layout components (Farmer/Officer/Inspector/Admin)

### Phase 2: Authentication (1-2 hours)

6. ✅ สร้างหน้า /register
7. ✅ สร้างหน้า /login
8. ✅ เชื่อมต่อ API authentication
9. ✅ ทดสอบ login flow

### Phase 3: Landing Page (1-2 hours)

10. ✅ สร้าง Landing Page แบบ conditional:
    - Guest: Hero + Workflow + Benefits + CTA
    - Logged In: Welcome + Applications + Quick Actions

### Phase 4: Farmer Pages (3-4 hours)

11. ✅ /farmer/dashboard (role-based)
12. ✅ /farmer/applications/new (form)
13. ✅ /farmer/applications/[id] (detail + actions)
14. ✅ /farmer/documents/upload
15. ✅ /farmer/payments
16. ✅ /farmer/certificates

### Phase 5: Officer Pages (2-3 hours)

17. ✅ /officer/dashboard
18. ✅ /officer/applications (queue)
19. ✅ /officer/applications/[id]/review

### Phase 6: Inspector Pages (2-3 hours)

20. ✅ /inspector/dashboard
21. ✅ /inspector/inspections/[id]/vdo-call
22. ✅ /inspector/inspections/[id]/on-site

### Phase 7: Admin Pages (2-3 hours)

23. ✅ /admin/dashboard (overview)
24. ✅ /admin/applications (all)
25. ✅ /admin/users (management)
26. ✅ /admin/certificates

### Phase 8: Integration & Testing (2-3 hours)

27. ✅ เชื่อมต่อ API ทุกหน้า
28. ✅ ทดสอบ workflow ทั้ง 8 steps
29. ✅ ทดสอบทุก role
30. ✅ แก้ไข bugs

---

## 🔍 CHECK (ตรวจสอบ) - Quality Checklist

### Functionality Checks

- [ ] ทุกหน้าโหลดได้ (ไม่มี 404)
- [ ] Authentication ทำงานถูกต้อง
- [ ] Role-based access control ทำงานถูกต้อง
- [ ] Workflow transitions ถูกต้องตาม business logic
- [ ] API integration ทำงานสมบูรณ์
- [ ] State management ทำงานถูกต้อง
- [ ] Form validation ครบถ้วน
- [ ] Error handling เหมาะสม

### User Experience Checks

- [ ] Navigation ชัดเจน
- [ ] Current step indicator แสดงถูกต้อง
- [ ] Loading states แสดงเหมาะสม
- [ ] Error messages เข้าใจง่าย
- [ ] Success messages แจ้งชัดเจน
- [ ] Responsive design ทำงานทุก device

### Performance Checks

- [ ] Page load time < 3 seconds
- [ ] API response time เหมาะสม
- [ ] No memory leaks
- [ ] Images optimized
- [ ] Code splitting ทำงานถูกต้อง

---

## 🎬 ACTION (ปรับปรุง) - Next Steps

1. **Immediate (ต้องทำทันที)**
   - แก้ไข Landing Page ให้ role-based
   - สร้าง Context Providers
   - เชื่อมต่อ API

2. **Short-term (1-2 วัน)**
   - สร้างหน้าครบทุก role
   - ทดสอบ end-to-end workflow
   - แก้ไข bugs

3. **Medium-term (1 สัปดาห์)**
   - Real-time notifications
   - Email notifications
   - Payment gateway integration
   - PDF certificate generation

4. **Long-term (1 เดือน)**
   - Mobile app
   - Advanced analytics
   - Blockchain integration
   - AI-powered document verification

---

## 📊 Success Metrics

- ✅ 0 pages with 404 error
- ✅ 100% role-based access control
- ✅ 100% API integration
- ✅ < 3 seconds page load time
- ✅ All 8 workflow steps functional
- ✅ All 4 user roles can complete their tasks

---

**สถานะ**: เอกสารวิเคราะห์เสร็จสมบูรณ์ - พร้อมเริ่ม implementation
**ขั้นตอนถัดไป**: เริ่มสร้าง Context Providers และ Landing Page แบบ role-based
