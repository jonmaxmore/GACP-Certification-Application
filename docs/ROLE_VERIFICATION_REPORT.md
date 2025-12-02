# 🔍 GACP Platform - Role Verification Report

**Date**: October 22, 2025  
**Issue**: Phase 4 Roles ไม่ตรงกับ Workflow

---

## ❌ ปัญหาที่พบ

คุณถูกต้องครับ! Phase 4 planning มี roles **ไม่ตรงกับ workflow จริง**

### ❌ Roles ที่เขียนผิด (Phase 4 Planning):

```
Phase 4: Other Roles
- Officer Dashboard & Review Pages
- Inspector Dashboard & Inspection Pages
- Admin Dashboard & Management Pages
```

### ✅ Roles ที่ถูกต้อง (ตาม Workflow):

```
Step 3: ตรวจเอกสาร → Actor: DTAM_OFFICER (เจ้าหน้าที่ตรวจเอกสาร)
Step 6: ตรวจฟาร์ม → Actor: INSPECTOR (พนักงานตรวจสอบพื้นที่)
Step 7: อนุมัติรับรอง → Actor: ADMIN / APPROVER (พนักงานอนุมัติ)
Step 8: รับใบรับรอง → Actor: SYSTEM (ระบบออกใบรับรอง)
```

---

## ✅ การแก้ไข - Correct Roles Mapping

### ตาม Workflow 8 Steps:

| Step | ชื่อขั้นตอน          | Actor              | หน้าที่            | Pages ที่ต้องสร้าง                                                                |
| ---- | -------------------- | ------------------ | ------------------ | --------------------------------------------------------------------------------- |
| 1    | สมัครและส่งคำขอ      | **FARMER**         | ยื่นคำขอ           | ✅ /farmer/applications/new                                                       |
| 2    | จ่ายเงินรอบแรก (5K)  | **FARMER**         | ชำระเงิน           | ✅ /farmer/payments                                                               |
| 3    | **ตรวจเอกสาร**       | **DTAM_OFFICER**   | **ตรวจสอบเอกสาร**  | 🔴 /officer/applications/[id]/review                                              |
| 4    | เอกสารผ่าน           | **SYSTEM**         | Auto-notify        | ✅ System (no UI)                                                                 |
| 5    | จ่ายเงินรอบสอง (25K) | **FARMER**         | ชำระเงิน           | ✅ /farmer/payments                                                               |
| 6    | **ตรวจฟาร์ม**        | **INSPECTOR**      | **ตรวจสอบภาคสนาม** | 🔴 /inspector/inspections/[id]/vdo-call<br>🔴 /inspector/inspections/[id]/on-site |
| 7    | **อนุมัติรับรอง**    | **ADMIN/APPROVER** | **อนุมัติคำขอ**    | 🔴 /admin/applications/[id]/approve                                               |
| 8    | รับใบรับรอง          | **SYSTEM**         | ออกใบรับรอง        | ✅ System (download UI exists)                                                    |

---

## 📊 Role Breakdown (Correct Version)

### Role 1: FARMER (เกษตรกร) ✅ DONE

**Steps**: 1, 2, 5
**Responsibilities**:

- ยื่นคำขอ GACP
- อัปโหลดเอกสาร 5 ชนิด
- ชำระเงิน Phase 1 (5,000 THB)
- ชำระเงิน Phase 2 (25,000 THB)
- ดาวน์โหลดใบรับรอง

**Pages Created** (Phase 3):

- ✅ `/farmer/dashboard` - แสดงสถานะใบสมัคร + Smart Next Action
- ✅ `/farmer/applications/new` - ยื่นคำขอใหม่
- ✅ `/farmer/applications/[id]` - ดูรายละเอียดใบสมัคร
- ✅ `/farmer/documents` - อัปโหลดเอกสาร
- ✅ `/farmer/payments` - ชำระเงิน

---

### Role 2: DTAM_OFFICER (เจ้าหน้าที่ตรวจเอกสาร) 🔴 NOT DONE

**Step**: 3
**Responsibilities**:

- ตรวจสอบความครบถ้วนของเอกสาร
- ตรวจสอบความถูกต้องของข้อมูล
- ประเมินความเสี่ยง (Risk Assessment)
- **อนุมัติ** (APPROVED) / **ขอแก้ไข** (REVISION) / **ปฏิเสธ** (REJECTED)
- ติดตามเอกสารที่ขอแก้ไข (สูงสุด 2 ครั้ง)

**Pages to Create**:

- 🔴 `/officer/dashboard` - Dashboard แสดง pending reviews
  - Pending Reviews Card (count + list)
  - Today's Tasks (document reviews count)
  - Statistics (reviewed this week, approval rate)
  - Quick Actions (Start Next Review button)
- 🔴 `/officer/applications` - รายการใบสมัครที่รอตรวจ
  - Filter by status (PAYMENT_PROCESSING_1, DOCUMENT_REVIEW, DOCUMENT_REVISION)
  - Sort by submission date
  - Priority indicators (older applications)
- 🔴 `/officer/applications/[id]/review` - หน้าตรวจสอบเอกสาร
  - Application details (farm info, farmer info)
  - **Document checklist**:
    - บัตรประชาชน (ID Card) - View + Approve/Reject
    - ทะเบียนบ้าน (House Registration) - View + Approve/Reject
    - โฉนดที่ดิน (Land Deed) - View + Approve/Reject
    - แผนที่ฟาร์ม (Farm Map) - View + Approve/Reject
    - ใบอนุญาตแหล่งน้ำ (Water Permit) - View + Approve/Reject
  - **Review form**:
    - Completeness Score (ความครบถ้วน)
    - Accuracy Score (ความถูกต้อง)
    - Risk Assessment (ประเมินความเสี่ยง)
    - Comments/Notes
  - **Decision buttons**:
    - **อนุมัติทั้งหมด** (APPROVED) → state = DOCUMENT_APPROVED
    - **ขอแก้ไข** (REVISION) → state = DOCUMENT_REVISION (+ specify which docs)
    - **ปฏิเสธ** (REJECTED) → state = DOCUMENT_REJECTED (+ reason)

- 🔴 `/officer/reports` - รายงานการตรวจสอบ
  - Weekly/Monthly summary
  - Approval/Rejection statistics
  - Average review time

---

### Role 3: INSPECTOR (พนักงานตรวจสอบพื้นที่/ฟาร์ม) 🔴 NOT DONE

**Step**: 6
**Responsibilities**:

- **Phase 6A: VDO Call Inspection**
  - นัดหมาย VDO Call กับเกษตรกร
  - ตรวจสอบผ่าน Video Conference
  - ประเมินเบื้องต้น
  - ตัดสินใจ: เพียงพอ (จบ) หรือ ต้องลงพื้นที่
- **Phase 6B: On-Site Inspection**
  - นัดหมายลงพื้นที่
  - ตรวจสอบ **8 Critical Control Points (CCPs)**:
    1. Seed/Planting Material Quality (15 pts)
    2. Soil Management & Fertilizer (15 pts)
    3. Pest & Disease Management (15 pts)
    4. Harvesting Practices (15 pts)
    5. Post-Harvest Handling (15 pts)
    6. Storage & Transportation (10 pts)
    7. Record Keeping (10 pts)
    8. Worker Training & Safety (5 pts)
  - ถ่ายรูปหลักฐาน
  - ให้คะแนนรวม (Total: 100 points)
  - เขียนรายงาน

**Pages to Create**:

- 🔴 `/inspector/dashboard` - Dashboard แสดงตารางตรวจ
  - Upcoming Inspections Card (today + this week)
  - Active Inspections (VDO Call, On-Site, Pending Submit)
  - Inspection Statistics (completed, average score, pass rate)
  - Calendar View
- 🔴 `/inspector/schedule` - ตารางนัดหมายตรวจ
  - Calendar view (วันที่, เวลา, เกษตรกร)
  - Filter by type (VDO Call / On-Site)
  - Accept/Reschedule appointments
- 🔴 `/inspector/inspections/[id]/vdo-call` - หน้าบันทึกผล VDO Call
  - Application summary
  - VDO Call checklist (preliminary assessment)
  - **Decision**:
    - **เพียงพอ** → state = INSPECTION_COMPLETED (skip on-site)
    - **ต้องลงพื้นที่** → state = INSPECTION_ON_SITE (schedule on-site)
  - Upload screenshots/photos
  - Notes/Comments
- 🔴 `/inspector/inspections/[id]/on-site` - หน้าบันทึกผล On-Site
  - Application summary
  - **8 CCPs Scoring Form**:
    - Each CCP: Input score (0-15 or 0-10 or 0-5)
    - Upload photos for each CCP
    - Notes for each CCP
  - **Total Score Display**: X / 100 points
  - **Pass/Fail Indicator**:
    - ≥80 = Pass (green)
    - 70-79 = Conditional (yellow)
    - <70 = Fail (red)
  - Final notes/recommendations
  - Submit Report button → state = INSPECTION_COMPLETED
- 🔴 `/inspector/history` - ประวัติการตรวจ
  - Past inspections list
  - Filter by date, farm, result
  - Export reports

---

### Role 4: ADMIN / APPROVER (พนักงานอนุมัติ) 🔴 NOT DONE

**Step**: 7
**Responsibilities**:

- ตรวจสอบรายงานการตรวจเอกสาร (จาก DTAM_OFFICER)
- ตรวจสอบรายงานการตรวจฟาร์ม (จาก INSPECTOR)
- ตรวจสอบคะแนน (Pass Threshold: 80/100)
- **อนุมัติ** (APPROVED) หรือ **ปฏิเสธ** (REJECTED)
- เมื่ออนุมัติ → trigger Certificate Generation (Step 8)

**Pages to Create**:

- 🔴 `/admin/dashboard` - System Overview
  - Total applications by status
  - Applications by workflow step (1-8)
  - Average processing time
  - Financial overview (payments)
  - User statistics (farmers, officers, inspectors)
  - System health
- 🔴 `/admin/applications` - All Applications List
  - Filter by status, date, step
  - Search by application number, farmer name
  - Quick actions (view, approve, reject)
- 🔴 `/admin/applications/[id]/approve` - หน้าอนุมัติคำขอ
  - **Application Summary**:
    - Farmer info
    - Farm info
    - Application date
  - **Document Review Result**:
    - Officer name
    - Review date
    - Decision + comments
    - All 5 documents status
  - **Inspection Report**:
    - Inspector name
    - Inspection date
    - Inspection type (VDO Call / On-Site)
    - **Score: X / 100** (color-coded)
    - 8 CCPs breakdown
    - Photos evidence
  - **Approval Form**:
    - Overall assessment
    - Final notes
  - **Decision Buttons**:
    - **อนุมัติ** (APPROVED) → state = APPROVED → trigger CERTIFICATE_GENERATING
    - **ปฏิเสธ** (REJECTED) → state = REJECTED (+ reason)
    - **ขอข้อมูลเพิ่มเติม** (PENDING) → request more info
- 🔴 `/admin/certificates` - Certificate Management
  - Issued certificates list
  - Generate certificate manually (if needed)
  - Revoke certificate
  - Certificate statistics
- 🔴 `/admin/users` - User Management
  - List all users (farmers, officers, inspectors, admins)
  - Create new user
  - Edit user roles
  - Deactivate user
- 🔴 `/admin/reports` - Analytics & Reports
  - Application statistics
  - Processing time analysis
  - Approval rate trends
  - Revenue reports
  - Export data

---

## 🎯 Corrected Phase 4 Plan

### Phase 4A: DTAM_OFFICER (เจ้าหน้าที่ตรวจเอกสาร) - **4-5 hours**

**Priority**: HIGH (Step 3 - ขั้นตอนแรกหลังเกษตรกรยื่นคำขอ)

**Tasks**:

1. Create `/officer/dashboard` (1 hour)
   - Pending reviews card
   - Today's tasks
   - Statistics

2. Create `/officer/applications` (1 hour)
   - Queue list with filters
   - Priority sorting

3. Create `/officer/applications/[id]/review` (2-3 hours)
   - Document viewer
   - 5 documents checklist (approve/reject each)
   - Review form (completeness, accuracy, risk)
   - Decision buttons (Approve/Revision/Reject)

---

### Phase 4B: INSPECTOR (พนักงานตรวจสอบพื้นที่) - **4-5 hours**

**Priority**: HIGH (Step 6 - ขั้นตอนหลังจ่ายเงินรอบ 2)

**Tasks**:

1. Create `/inspector/dashboard` (1 hour)
   - Upcoming inspections
   - Active inspections
   - Statistics + calendar

2. Create `/inspector/schedule` (1 hour)
   - Calendar view
   - Accept/Reschedule appointments

3. Create `/inspector/inspections/[id]/vdo-call` (1 hour)
   - VDO Call checklist
   - Decision (เพียงพอ / ต้องลงพื้นที่)

4. Create `/inspector/inspections/[id]/on-site` (2 hours)
   - **8 CCPs Scoring Form** (most complex)
   - Photo uploads for each CCP
   - Total score calculation
   - Pass/Fail indicator
   - Submit report

---

### Phase 4C: ADMIN / APPROVER (พนักงานอนุมัติ) - **4-5 hours**

**Priority**: HIGH (Step 7 - ขั้นตอนสุดท้ายก่อนออกใบรับรอง)

**Tasks**:

1. Create `/admin/dashboard` (1 hour)
   - System overview
   - Application statistics
   - Financial overview

2. Create `/admin/applications/[id]/approve` (2 hours)
   - View document review result
   - View inspection report (with score)
   - Approval form
   - Decision buttons (Approve/Reject)

3. Create `/admin/certificates` (1 hour)
   - Certificate management
   - List issued certificates

4. Create `/admin/users` (1 hour)
   - User management CRUD

---

## 📈 Updated Overall Progress

| Phase        | Description          | Old Name  | **Correct Name**              | Status             | Progress |
| ------------ | -------------------- | --------- | ----------------------------- | ------------------ | -------- |
| Phase 1      | Planning & Analysis  | -         | -                             | ✅ Complete        | 100%     |
| Phase 2      | Foundation           | -         | -                             | ✅ Complete        | 100%     |
| Phase 3      | Farmer Flow          | -         | **FARMER (เกษตรกร)**          | ✅ Complete        | 100%     |
| **Phase 4A** | ~~Officer~~          | Officer   | **DTAM_OFFICER (ตรวจเอกสาร)** | 🔴 Not Started     | 0%       |
| **Phase 4B** | Inspector            | Inspector | **INSPECTOR (ตรวจพื้นที่)**   | 🔴 Not Started     | 0%       |
| **Phase 4C** | ~~Admin~~            | Admin     | **ADMIN/APPROVER (อนุมัติ)**  | 🔴 Not Started     | 0%       |
| Phase 5      | Backend API          | -         | -                             | 🔴 Not Started     | 0%       |
| Phase 6      | Testing & Deployment | -         | -                             | 🔴 Not Started     | 0%       |
| **Overall**  | **GACP Platform**    | -         | -                             | **🟡 In Progress** | **50%**  |

---

## ✅ สรุป

### คุณถูกต้อง 100%! 🎯

**ปัญหา**:

- Phase 4 planning เขียนแค่ "Officer, Inspector, Admin" แบบทั่วไป
- ไม่ได้ระบุชัดว่าแต่ละ role ทำหน้าที่อะไรใน workflow

**การแก้ไข**:

- **Phase 4A**: DTAM_OFFICER (เจ้าหน้าที่ตรวจเอกสาร) - Step 3
- **Phase 4B**: INSPECTOR (พนักงานตรวจสอบพื้นที่) - Step 6
- **Phase 4C**: ADMIN/APPROVER (พนักงานอนุมัติ) - Step 7

**Workflow 8 Steps**:

```
1. Farmer: สมัคร ✅
2. Farmer: จ่าย 5K ✅
3. DTAM_OFFICER: ตรวจเอกสาร 🔴
4. System: เอกสารผ่าน ✅
5. Farmer: จ่าย 25K ✅
6. INSPECTOR: ตรวจฟาร์ม 🔴
7. ADMIN/APPROVER: อนุมัติ 🔴
8. System: ออกใบรับรอง ✅
```

---

**พร้อมเริ่ม Phase 4A (DTAM_OFFICER) ได้เลยครับ? 🚀**

หรือต้องการให้ update เอกสาร Phase 3 Complete ก่อน?
