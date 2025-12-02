# 🎯 User Acceptance Testing (UAT) Guide

## 📋 Overview

ระบบทดสอบการยอมรับจากผู้ใช้งานจริง (UAT) สำหรับ GACP Platform ครอบคลุม:

- **5 User Roles** - ทุกบทบาทผู้ใช้งาน
- **6 Main Systems** - ระบบหลักทั้งหมด
- **4 Supporting Systems** - ระบบสนับสนุน
- **Real-world Scenarios** - สถานการณ์การใช้งานจริง
- **Business Acceptance Criteria** - เกณฑ์การยอมรับทางธุรกิจ

---

## 🎯 UAT Coverage

### 👥 User Roles (5 Roles)

| Role                   | Scenarios | Focus Area                              |
| ---------------------- | --------- | --------------------------------------- |
| 👨‍🌾 เกษตรกร             | 4         | Registration → Application → Tracking   |
| 📄 พนักงานตรวจเอกสาร   | 2         | Document Review → Approval/Revision     |
| 🔍 พนักงานตรวจสอบฟาร์ม | 1         | Farm Inspection → Compliance Check      |
| ✅ พนักงานอนุมัติ      | 1         | Final Approval → Certificate Generation |
| ⚙️ ผู้ดูแลระบบ         | 1         | System Management → Reports             |

### 🔧 Systems (10 Systems)

| System                     | Scenarios | Type           |
| -------------------------- | --------- | -------------- |
| 🔐 Auth/SSO System         | 1         | Infrastructure |
| 📋 GACP Application System | 1         | Main           |
| 🌾 Farm Management System  | 1         | Main           |
| 📍 Track & Trace System    | 1         | Main           |
| 📊 Survey System           | 1         | Standalone     |
| ⚖️ Standards Comparison    | 1         | Standalone     |
| 📁 Document Management     | 1         | Supporting     |
| 🔔 Notification System     | 1         | Supporting     |
| 🎓 Certificate Generation  | 1         | Supporting     |
| 📈 Reporting System        | 1         | Supporting     |

**Total UAT Scenarios: 19**

---

## 🚀 How to Run UAT

### Prerequisites

```bash
# 1. Start Mock API Server
node test/mock-api-server.js

# 2. Verify environment
node scripts/verify-test-environment.js
```

### Run UAT Tests

```bash
# Method 1: Direct execution
node test/uat-test-suite.js

# Method 2: Using runner script
node scripts/run-uat-tests.js

# Method 3: PowerShell (Windows)
.\start-uat-testing.ps1
```

---

## 📊 UAT Scenarios Detail

### 👨‍🌾 เกษตรกร (Farmer) - 4 Scenarios

#### UAT-F-001: เกษตรกรใหม่สมัครสมาชิกและยื่นขอรับรองครั้งแรก

**Scenario:**
เกษตรกรคนใหม่ต้องการสมัครสมาชิกและยื่นขอรับรอง GACP

**Steps:**

1. สมัครสมาชิกใหม่ (Register)
2. เข้าสู่ระบบ (Login)
3. ดู Dashboard
4. ลงทะเบียนฟาร์ม (Register Farm)
5. สร้างคำขอรับรอง GACP

**Acceptance Criteria:**

- ✅ สมัครสมาชิกสำเร็จ
- ✅ เข้าสู่ระบบได้
- ✅ ลงทะเบียนฟาร์มสำเร็จ
- ✅ สร้างคำขอรับรองสำเร็จ

#### UAT-F-002: เกษตรกรอัปโหลดเอกสารและส่งคำขอรับรอง

**Scenario:**
เกษตรกรต้องอัปโหลดเอกสารที่จำเป็นและส่งคำขอ

**Steps:**

1. อัปโหลดเอกสาร 5 ประเภท:
   - โฉนดที่ดิน
   - แผนผังฟาร์ม
   - บัตรประชาชน
   - ผลตรวจน้ำ
   - ผลตรวจดิน
2. ส่งคำขอรับรอง (Submit)

**Acceptance Criteria:**

- ✅ อัปโหลดเอกสารสำเร็จทั้ง 5 ประเภท
- ✅ ส่งคำขอรับรองสำเร็จ
- ✅ สถานะเปลี่ยนเป็น "submitted"

#### UAT-F-003: เกษตรกรทำแบบสอบถามและเปรียบเทียบมาตรฐาน

**Scenario:**
เกษตรกรใช้ระบบ Survey และ Standards Comparison (Standalone)

**Steps:**

1. ทำแบบสอบถาม GACP
2. เปรียบเทียบมาตรฐาน (GACP, GAP, Organic)

**Acceptance Criteria:**

- ✅ ส่งแบบสอบถามสำเร็จ
- ✅ ได้ผลการเปรียบเทียบมาตรฐาน

#### UAT-F-004: เกษตรกรติดตามสถานะคำขอและรับการแจ้งเตือน

**Scenario:**
เกษตรกรติดตามความคืบหน้าของคำขอ

**Steps:**

1. ตรวจสอบสถานะคำขอ
2. ดูการแจ้งเตือน

**Acceptance Criteria:**

- ✅ ดูสถานะปัจจุบันได้
- ✅ รับการแจ้งเตือนได้

---

### 📄 พนักงานตรวจเอกสาร - 2 Scenarios

#### UAT-DR-001: พนักงานตรวจสอบเอกสารคำขอรับรอง

**Scenario:**
พนักงานตรวจสอบเอกสารที่เกษตรกรส่งมา

**Steps:**

1. ดูรายการคำขอที่รอตรวจสอบ
2. เปิดดูรายละเอียดคำขอ
3. ตรวจสอบเอกสารแต่ละชิ้น

**Acceptance Criteria:**

- ✅ ดูรายการคำขอได้
- ✅ เข้าถึงรายละเอียดคำขอได้
- ✅ ดูเอกสารทั้งหมดได้

#### UAT-DR-002: พนักงานอนุมัติและขอแก้ไขเอกสาร

**Scenario:**
พนักงานอนุมัติเอกสารบางส่วน และขอแก้ไขบางส่วน

**Steps:**

1. อนุมัติเอกสารที่ถูกต้อง
2. ขอแก้ไขเอกสารที่ไม่ครบ
3. ทำการตรวจสอบเสร็จสมบูรณ์

**Acceptance Criteria:**

- ✅ อนุมัติเอกสารได้
- ✅ ขอแก้ไขเอกสารได้
- ✅ บันทึกผลการตรวจสอบได้

---

### 🔍 พนักงานตรวจสอบฟาร์ม - 1 Scenario

#### UAT-I-001: พนักงานตรวจสอบฟาร์มแบบออนไลน์

**Scenario:**
พนักงานตรวจสอบฟาร์มผ่านระบบออนไลน์

**Steps:**

1. เริ่มการตรวจสอบ
2. บันทึกผลการตรวจสอบ 3 ด้าน:
   - การจัดการดิน
   - การจัดการน้ำ
   - การจัดการศัตรูพืช
3. ตรวจสอบมาตรฐาน GACP
4. สรุปผลการตรวจสอบ

**Acceptance Criteria:**

- ✅ เริ่มการตรวจสอบได้
- ✅ บันทึกผลการตรวจสอบได้
- ✅ ตรวจสอบความสอดคล้องมาตรฐาน GACP ได้
- ✅ สรุปผลการตรวจสอบได้

---

### ✅ พนักงานอนุมัติ - 1 Scenario

#### UAT-A-001: พนักงานอนุมัติคำขอและออกใบรับรอง

**Scenario:**
พนักงานพิจารณาอนุมัติและออกใบรับรอง

**Steps:**

1. ดูสรุปคำขอทั้งหมด
2. อนุมัติคำขอรับรอง
3. ออกใบรับรอง GACP

**Acceptance Criteria:**

- ✅ ดูสรุปคำขอได้
- ✅ อนุมัติคำขอได้
- ✅ ออกใบรับรองได้

---

### ⚙️ ผู้ดูแลระบบ - 1 Scenario

#### UAT-ADM-001: ผู้ดูแลระบบจัดการผู้ใช้และตั้งค่า

**Scenario:**
ผู้ดูแลระบบจัดการระบบและสร้างรายงาน

**Steps:**

1. ดู Dashboard ระบบ
2. สร้างพนักงานใหม่
3. ตั้งค่าระบบ
4. สร้างรายงานประจำเดือน

**Acceptance Criteria:**

- ✅ ดู Dashboard ได้
- ✅ สร้างพนักงานใหม่ได้
- ✅ ตั้งค่าระบบได้
- ✅ สร้างรายงานได้

---

## 🔧 System UAT Scenarios

### 🔐 UAT-AUTH-001: ระบบ Authentication

**Test:**

- Registration
- Login
- Token validation

### 📋 UAT-GACP-001: GACP Application System

**Test:**

- Create application
- Submit application
- Track status

### 🌾 UAT-FARM-001: Farm Management System

**Test:**

- Create farm (C)
- Read farm (R)
- Update farm (U)
- Delete farm (D)

### 📍 UAT-TRACK-001: Track & Trace System

**Test:**

- Track application status
- View history

### 📊 UAT-SURVEY-001: Survey System (Standalone)

**Test:**

- Submit survey
- View results

### ⚖️ UAT-STD-001: Standards Comparison (Standalone)

**Test:**

- Compare multiple standards
- View comparison results

### 📁 UAT-DOC-001: Document Management

**Test:**

- Upload documents
- Review documents

### 🔔 UAT-NOTIF-001: Notification System

**Test:**

- Receive notifications
- Send notifications (admin)

### 🎓 UAT-CERT-001: Certificate Generation

**Test:**

- Generate certificate
- Validate certificate

### 📈 UAT-RPT-001: Reporting System

**Test:**

- Generate reports
- View reports

---

## 📊 UAT Results Format

```
🎯 GACP Platform - User Acceptance Testing (UAT)
═══════════════════════════════════════════════════════════════

👨‍🌾 UAT: เกษตรกร (Farmer Role)
────────────────────────────────────────────────────────────────
  ✓ UAT-F-001: เกษตรกรใหม่สมัครสมาชิกและยื่นขอรับรองครั้งแรก (1234ms)
  ✓ UAT-F-002: เกษตรกรอัปโหลดเอกสารและส่งคำขอรับรอง (567ms)
  ✓ UAT-F-003: เกษตรกรทำแบบสอบถามและเปรียบเทียบมาตรฐาน (890ms)
  ✓ UAT-F-004: เกษตรกรติดตามสถานะคำขอและรับการแจ้งเตือน (234ms)

...

📊 UAT FINAL REPORT
═══════════════════════════════════════════════════════════════

👥 USER ROLES UAT RESULTS:

👨‍🌾 เกษตรกร (Farmer)
  ✓ Passed: 4 | ✗ Failed: 0 | Success: 100.0%

📄 พนักงานตรวจเอกสาร (Document Reviewer)
  ✓ Passed: 2 | ✗ Failed: 0 | Success: 100.0%

...

🔧 SYSTEMS UAT RESULTS:

🔐 Auth/SSO System
  ✓ Passed: 1 | ✗ Failed: 0 | Success: 100.0%

...

📈 OVERALL UAT RESULTS:
  ✓ Total Passed: 19
  ✗ Total Failed: 0
  📊 Success Rate: 100.0%
  📝 Total Scenarios: 19

🎉 ✅ UAT PASSED! System ready for production!
```

---

## 🎯 Acceptance Criteria

### Excellent (90-100%)

🎉 ✅ **UAT PASSED!** System ready for production!

### Good (75-89%)

⚠️ **UAT NEEDS ATTENTION!** Some scenarios require fixes.

### Failed (< 75%)

❌ **UAT FAILED!** Critical issues found.

---

## 📚 Documentation

- 📖 [UAT Guide](./docs/UAT_GUIDE.md) - This file
- 📊 [UAT Summary Report](./docs/UAT_SUMMARY_REPORT.md) - Detailed results
- 📝 [UAT Test Cases](./docs/UAT_TEST_CASES.md) - All test cases

---

## 🚨 Troubleshooting

### UAT Fails

1. Check console output for errors
2. Verify mock server is running
3. Check test data setup
4. Review acceptance criteria

### Network Issues

```bash
# Check if port 3000 is available
netstat -ano | findstr :3000

# Restart mock server
node test/mock-api-server.js
```

---

## 🎓 Best Practices

1. **Run UAT after QA tests pass**
2. **Test with realistic data**
3. **Validate business requirements**
4. **Get stakeholder sign-off**
5. **Document all issues**

---

**Last Updated:** October 21, 2025  
**Version:** 1.0.0  
**Status:** ✅ Ready for UAT
