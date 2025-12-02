# 🧙‍♂️ Wizard Systems Summary - ระบบ Wizard ทั้งหมด

**Date**: October 22, 2025  
**Status**: ✅ Complete Inventory

---

## 📊 Wizard ทั้งหมดในระบบ: **3 ตัว**

---

## 1️⃣ GACP Application Wizard (ตัวช่วยยื่นใบสมัคร GACP)

### 📄 ไฟล์:

- `apps/frontend/components/gacp/GACPApplicationWizard.tsx` (1,183 lines)

### 🎯 วัตถุประสงค์:

ช่วยเหลือเกษตรกรในการ**ยื่นคำขอใบรับรอง GACP** แบบทีละขั้นตอน

### 👥 รองรับผู้ขอ 3 ประเภท:

1. **วิสาหกิจชุมชน** (Community Enterprise)
2. **บุคคลธรรมดา** (Individual)
3. **นิติบุคคล** (Juristic Person)

### 📋 Wizard Steps:

1. **applicant_type** - เลือกประเภทผู้ยื่นขอ
2. **applicant_info** - ข้อมูลส่วนตัวและการติดต่อ
3. **land_info** - ข้อมูลที่ดินและเอกสารสิทธิ์
4. **cultivation_plan** - แผนการเพาะปลูก
5. **(อาจมีเพิ่มเติม - ต้องดูไฟล์ทั้งหมด)**

### 🔗 Integration:

- **AI Assistant System** - ให้คำแนะนำระหว่างกรอกฟอร์ม
- **Validation** - ตรวจสอบข้อมูลแบบเรียลไทม์
- **Auto-save** - บันทึกอัตโนมัติ

### 🎨 UI Features:

- Material-UI Stepper (แนวตั้ง)
- Progress tracking
- Validation alerts
- Help tooltips
- Document upload

---

## 2️⃣ SOP Wizard (ตัวช่วย Standard Operating Procedures)

### 📄 ไฟล์:

- **Backend**: `business-logic/gacp-sop-wizard-system.js` (799 lines)
- **Frontend**: `apps/frontend/components/gacp/GACPSOPWizard.tsx` (697+ lines)

### 🎯 วัตถุประสงค์:

ช่วยเหลือเกษตรกรในการ**ทำ SOP (Standard Operating Procedures)** ตามมาตรฐาน GACP

### 🌱 5 Phases (ขั้นตอนหลัก):

1. **Pre-Planting** (ก่อนปลูก) - 5 activities
2. **Planting** (การปลูก) - 4 activities
3. **Growing** (การเพาะปลูก) - 6 activities
4. **Harvesting** (การเก็บเกี่ยว) - 4 activities
5. **Post-Harvest** (หลังการเก็บเกี่ยว) - 5 activities

### 📊 กิจกรรมทั้งหมด: **24 Activities**

**Phase 1: Pre-Planting (80 points)**:

- soil_preparation (15 pts)
- soil_testing (20 pts)
- water_testing (20 pts)
- seed_selection (15 pts)
- area_measurement (10 pts)

**Phase 2: Planting (50 points)**:

- seed_germination (15 pts)
- seedling_transplant (15 pts)
- irrigation_setup (10 pts)
- plant_tagging (10 pts)

**Phase 3: Growing (65 points)**:

- daily_watering (5 pts) - Daily
- weekly_fertilizing (10 pts) - Weekly
- monthly_pruning (10 pts) - Monthly
- pest_monitoring (15 pts) - Weekly
- disease_inspection (15 pts) - Weekly
- growth_measurement (10 pts) - Weekly

**Phase 4: Harvesting (55 points)**:

- maturity_assessment (15 pts)
- harvesting_process (20 pts)
- fresh_weight_recording (10 pts)
- initial_packaging (10 pts)

**Phase 5: Post-Harvest (85 points)**:

- drying_process (20 pts)
- processing (15 pts)
- final_packaging (15 pts)
- storage_conditions (10 pts)
- quality_testing (25 pts)

### 🎯 Total Compliance Points: **335 Points**

### 🏆 Grading System:

- ≥ 90% = **A** (ดีเยี่ยม)
- ≥ 80% = **B** (ดี)
- ≥ 70% = **C** (พอใช้)
- ≥ 60% = **D** (ปรับปรุง)
- < 60% = **F** (ไม่ผ่าน)

### 🤖 AI Integration:

- Real-time guidance
- Activity recommendations
- Compliance checking
- Error detection
- Best practice suggestions

### 🔗 API Endpoints:

```
POST /api/sop/sessions           # Start SOP session
GET  /api/sop/sessions/:id/progress   # Get progress
POST /api/sop/sessions/:id/activities # Record activity
GET  /api/sop/cultivation/:id/activities  # Get activities
```

### 📸 Features:

- Photo upload per activity
- GPS tagging
- Progress tracking
- Compliance score display
- Phase navigation
- Activity checklist

---

## 3️⃣ Survey Wizard (ตัวช่วยทำแบบสอบถาม)

### 📄 ไฟล์:

- **Backend**: `apps/backend/modules/survey-system/services/survey-system.service.js`
- **Related**: `business-logic/gacp-survey-system.js`

### 🎯 วัตถุประสงค์:

ช่วยเหลือในการ**สร้างและทำแบบสอบถาม** สำหรับประเมินความพร้อม GACP

### 📋 7-Step Survey Wizard:

1. **Step 1**: ข้อมูลเบื้องต้น
2. **Step 2**: ข้อมูลฟาร์ม
3. **Step 3**: การเพาะปลูก
4. **Step 4**: การจัดการศัตรูพืช
5. **Step 5**: การเก็บเกี่ยว
6. **Step 6**: การแปรรูป
7. **Step 7**: สรุปและประเมิน

### 🗺️ 4 ภูมิภาค (Regional Support):

- ภาคเหนือ (North)
- ภาคกลาง (Central)
- ภาคตะวันออกเฉียงเหนือ (Northeast)
- ภาคใต้ (South)

### 🔧 Backend Methods:

```javascript
async createSurveyResponse(data)        // Start wizard
async updateWizardStep(surveyId, stepId, data)  // Update step
async submitWizard(surveyId)            // Submit & calculate
```

### 📊 Features:

- Step-by-step validation
- Regional customization
- Auto-scoring
- Progress saving
- Multi-language support (TH/EN)

---

## 📊 Comparison Table

| Feature                  | Application Wizard | SOP Wizard               | Survey Wizard      |
| ------------------------ | ------------------ | ------------------------ | ------------------ |
| **Purpose**              | ยื่นใบสมัคร GACP   | ทำ SOP ตามมาตรฐาน        | ประเมินความพร้อม   |
| **Steps**                | 4-7 steps          | 5 phases (24 activities) | 7 steps            |
| **Location**             | Frontend only      | Backend + Frontend       | Backend only       |
| **AI Integration**       | ✅ Yes             | ✅ Yes                   | ⚠️ Limited         |
| **Photo Upload**         | ✅ Yes             | ✅ Yes + GPS             | ❌ No              |
| **Scoring**              | ❌ No              | ✅ Yes (335 pts)         | ✅ Yes             |
| **Real-time Validation** | ✅ Yes             | ✅ Yes                   | ✅ Yes             |
| **Auto-save**            | ✅ Yes             | ✅ Yes                   | ✅ Yes             |
| **Multi-user Type**      | ✅ 3 types         | ❌ Farmer only           | ❌ Generic         |
| **Integration**          | Application System | Digital Logbook          | Application System |

---

## 🔗 Wizards Integration Map

```
┌─────────────────────────────────────────────────────────┐
│                  GACP Certification Flow                 │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │   1. Survey Wizard (Optional)        │
        │   ประเมินความพร้อมก่อนยื่น           │
        │   7 steps → ผลคะแนนแนะนำ             │
        └──────────────────┬───────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │   2. Application Wizard (Required)   │
        │   ยื่นใบสมัคร GACP                   │
        │   4-7 steps → ส่งใบสมัครสำเร็จ       │
        └──────────────────┬───────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │   3. SOP Wizard (Ongoing)            │
        │   ทำ SOP ระหว่างเพาะปลูก            │
        │   5 phases, 24 activities            │
        │   → สะสมคะแนน compliance             │
        └──────────────────┬───────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │   Inspector Review                    │
        │   ตรวจสอบ Application + SOP           │
        │   → ตรวจเอกสาร + ตรวจฟาร์ม          │
        └──────────────────┬───────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │   Admin Approval                      │
        │   อนุมัติสุดท้าย                     │
        │   → ออกใบรับรอง GACP                 │
        └──────────────────────────────────────┘
```

---

## 🎯 ใช้งาน Wizard ไหนเมื่อไหร่?

### **Survey Wizard** (ก่อนยื่น):

```
เมื่อ: เกษตรกรยังไม่แน่ใจว่าพร้อมยื่นหรือไม่
ทำ: ทำแบบประเมิน 7 ขั้นตอน
ผลลัพธ์: คะแนนความพร้อม + คำแนะนำปรับปรุง
ระยะเวลา: 15-30 นาที
```

### **Application Wizard** (เริ่มยื่น):

```
เมื่อ: พร้อมยื่นใบสมัคร GACP
ทำ: กรอกข้อมูลทีละขั้นตอน
ผลลัพธ์: ใบสมัครสำเร็จ → เข้าสู่ขั้นตอนตรวจสอบ
ระยะเวลา: 30-60 นาที
```

### **SOP Wizard** (ระหว่างเพาะปลูก):

```
เมื่อ: เริ่มเพาะปลูกแล้ว
ทำ: บันทึก activities ตาม 5 phases
ผลลัพธ์: ข้อมูล compliance สำหรับ Inspector
ระยะเวลา: ตลอดฤดูการเพาะปลูก (3-6 เดือน)
```

---

## ✅ Status ของแต่ละ Wizard

### 1. Application Wizard:

- ✅ **Frontend**: Implemented (React/MUI)
- ⚠️ **Backend**: Partial (needs API integration)
- ⚠️ **Next.js 14**: Not ported yet
- 📍 **Location**: `apps/frontend/components/gacp/`

### 2. SOP Wizard:

- ✅ **Backend**: Fully implemented (799 lines)
- ✅ **Frontend**: Implemented (old React)
- ⚠️ **Next.js 14**: Not ported yet
- ✅ **API Routes**: Complete (`/api/sop/*`)
- 📍 **Location**: `business-logic/` + `apps/frontend/`

### 3. Survey Wizard:

- ✅ **Backend**: Fully implemented
- ❌ **Frontend**: Not implemented
- ✅ **API Routes**: Complete
- 📍 **Location**: `apps/backend/modules/survey-system/`

---

## 🚀 Recommendations for Phase 5

### Priority 1 - Core Certification (Phase 5A-5D):

ทำ **Application Flow** ของ Next.js 14 ที่สร้างไว้แล้ว:

- ✅ Farmer Application (4 pages) - Done
- ✅ Officer Review (3 pages) - Done
- ✅ Inspector Inspection (4 pages) - Done
- ✅ Admin Approval (3 pages) - Done
- ⏳ Backend Integration - **Todo**

### Priority 2 - SOP Integration (Phase 5E):

เพิ่ม **SOP Wizard** เข้า Next.js 14:

- Create 3 new pages:
  - `/farmer/sop/session` - Start SOP
  - `/farmer/sop/[sessionId]` - Active wizard
  - `/farmer/sop/history` - History
- Connect to existing APIs
- Show in Inspector/Admin pages

### Priority 3 - Survey (Optional):

เพิ่ม **Survey Wizard** (ถ้ามีเวลา):

- Create assessment page
- Use for pre-qualification
- Generate readiness report

---

## 📝 Summary

### มี Wizard ทั้งหมด: **3 ตัว**

1. **Application Wizard** - ยื่นใบสมัคร (Frontend เก่า, ต้อง port)
2. **SOP Wizard** - ทำ SOP (Backend พร้อม, Frontend ต้อง port)
3. **Survey Wizard** - ประเมินความพร้อม (Backend พร้อม, ไม่มี Frontend)

### ใน Next.js 14 ใหม่:

- ✅ **Core Flow Pages** - 18 pages (Done ✅)
- ❌ **Application Wizard** - ยังไม่ได้ port (ใช้ form ปกติแทน)
- ❌ **SOP Wizard** - ยังไม่ได้ port
- ❌ **Survey Wizard** - ยังไม่มี

### แนะนำ:

เน้น **Backend Integration** ของ 18 pages ที่มีอยู่ก่อน (Phase 5)  
ค่อยเพิ่ม Wizards ทีหลัง (Phase 6 หรือ Enhancement)

---

**ผมอธิบายถูกต้องแล้วไหมครับ?** หรือมีอะไรที่ต้องแก้ไข? 🤔
