# 🏢 GACP Platform - Main Services Catalog

## บริการหลักของระบบ GACP Platform

> **เอกสารนี้เป็นแหล่งอ้างอิงหลักสำหรับระบุบริการทั้งหมดของแพลตฟอร์ม**
>
> Last Updated: October 21, 2025

---

## 📋 **รายการบริการหลัก (Main Services)**

### **1. ระบบสมาชิกและการยืนยันตัวตน (Authentication & SSO)**

- **Service ID**: `AUTH-SSO-001`
- **ชื่อระบบ**: Single Sign-On & User Authentication System
- **ประเภท**: Core Infrastructure Service
- **สถานะ**: ✅ Production Ready
- **ไฟล์หลัก**:
  - `apps/backend/modules/auth-farmer/` - Farmer Authentication
  - `apps/backend/modules/auth-dtam/` - DTAM Staff Authentication
  - `apps/backend/modules/user-management/` - User Management
- **คุณสมบัติหลัก**:
  - ✅ Single Sign-On (SSO) สำหรับทุกระบบ
  - ✅ JWT Token-based Authentication
  - ✅ Role-based Access Control (RBAC)
  - ✅ Multi-factor Authentication (MFA) Ready
  - ✅ Session Management
- **ผู้ใช้งาน**: เกษตรกร, เจ้าหน้าที่ DTAM, ผู้ตรวจสอบ, ผู้อนุมัติ, ผู้ดูแลระบบ
- **API Endpoints**: `/api/auth/*`, `/api/users/*`

---

### **2. ระบบยื่นเอกสารเพื่อขอรับรองการปลูกกัญชา (GACP Application System)**

- **Service ID**: `GACP-APP-002`
- **ชื่อระบบ**: GACP Cannabis Certification Application System
- **ประเภท**: Core Business Service
- **สถานะ**: ✅ Production Ready
- **ไฟล์หลัก**:
  - `apps/backend/modules/application-workflow/` - Application Workflow Engine
  - `apps/backend/modules/cannabis-survey/` - Cannabis Survey Management
  - `apps/backend/modules/document-management/` - Document Management
  - `business-logic/gacp-workflow-engine.js` - Workflow Business Logic
- **Dashboard**:
  - 👨‍🌾 **Farmer Portal**: `apps/farmer-portal/` - ยื่นคำขอ, ติดตามสถานะ
  - 👔 **DTAM Panel**: `apps/admin-portal/` - ตรวจสอบ, อนุมัติ, จัดการคำขอ
- **คุณสมบัติหลัก**:
  - ✅ 7-Step Application Wizard
  - ✅ Document Upload & Management
  - ✅ Multi-stage Approval Workflow
  - ✅ Payment Integration
  - ✅ Notification System
  - ✅ Status Tracking
- **การทำงาน**:
  - เกษตรกรยื่นคำขอ → ตรวจสอบเอกสาร → ตรวจสอบภาคสนาม → อนุมัติ → ออกใบรับรอง
- **ผู้ใช้งาน**: เกษตรกร (ยื่นคำขอ), DTAM Staff (ตรวจสอบ/อนุมัติ)
- **API Endpoints**: `/api/applications/*`, `/api/cannabis-survey/*`
- **การเชื่อมต่อ**:
  - ✅ ใช้ระบบ #1 สำหรับ Login
  - ✅ เชื่อมต่อกับระบบ #4 สำหรับ Track and Trace
  - ✅ เชื่อมต่อกับระบบ #3 สำหรับข้อมูลฟาร์ม

---

### **3. ระบบบริหารจัดการฟาร์ม (Farm Management System)**

- **Service ID**: `FARM-MGT-003`
- **ชื่อระบบ**: Farm Management & Monitoring System
- **ประเภท**: Standalone Business Service (with Backend Control)
- **สถานะ**: ✅ Production Ready
- **ไฟล์หลัก**:
  - `apps/backend/modules/farm-management/` - Farm Management Module
  - `business-logic/gacp-business-rules-engine.js` - Business Rules
  - `business-logic/gacp-field-inspection-system.js` - Inspection System
- **คุณสมบัติหลัก**:
  - ✅ Farm Registration & Profile Management
  - ✅ Crop Management (Cannabis Strains)
  - ✅ Cultivation Cycle Tracking
  - ✅ GAP/GACP Compliance Monitoring
  - ✅ Farm Inspection Scheduling
  - ✅ Digital Farm Documentation
  - ✅ Backend Control Panel สำหรับควบคุมเกษตรกร
- **การทำงาน**:
  - **Standalone**: เกษตรกรสามารถจัดการฟาร์มได้เอง
  - **Backend Control**: ระบบหลังบ้านสำหรับ DTAM ควบคุมและตรวจสอบ
- **ผู้ใช้งาน**:
  - เกษตรกร (จัดการฟาร์มของตัวเอง)
  - DTAM Staff (ควบคุม/ตรวจสอบฟาร์มทั้งหมด)
- **API Endpoints**: `/api/farm-management/*`, `/api/farms/*`
- **การเชื่อมต่อ**:
  - ✅ ใช้ระบบ #1 สำหรับ Login
  - ✅ เชื่อมต่อกับระบบ #4 สำหรับ Track and Trace
  - ⚠️ **Standalone แต่มีระบบควบคุมหลังบ้าน**

---

### **4. ระบบติดตามสินค้า (Track and Trace System)**

- **Service ID**: `TRACK-004`
- **ชื่อระบบ**: Cannabis Track and Trace System
- **ประเภท**: Core Business Service (Integrated)
- **สถานะ**: ✅ Production Ready
- **ไฟล์หลัก**:
  - `apps/backend/modules/track-trace/` - Track & Trace Module
  - `business-logic/gacp-workflow-engine.js` - Tracking Workflow
- **คุณสมบัติหลัก**:
  - ✅ Seed-to-Sale Tracking
  - ✅ QR Code Generation & Scanning
  - ✅ Batch/Lot Tracking
  - ✅ Real-time Location Tracking
  - ✅ Supply Chain Visibility
  - ✅ Product Genealogy
  - ✅ Compliance Reporting
- **การทำงาน**:
  - เมล็ด → การปลูก → การเก็บเกี่ยว → การแปรรูป → การจำหน่าย
- **ผู้ใช้งาน**: เกษตรกร, ผู้แปรรูป, ผู้จำหน่าย, DTAM
- **API Endpoints**: `/api/track-trace/*`, `/api/traceability/*`
- **การเชื่อมต่อ**:
  - ✅ เชื่อมต่อกับระบบ #2 (Application System)
  - ✅ เชื่อมต่อกับระบบ #3 (Farm Management)
  - ✅ เชื่อมต่อกับระบบ Certificate Portal

---

### **5. ระบบสำรวจและแบบสอบถาม (Survey System)**

- **Service ID**: `SURVEY-005`
- **ชื่อระบบ**: GACP Survey & Questionnaire System
- **ประเภท**: **Standalone Service** (ไม่รวมกับใคร)
- **สถานะ**: ✅ Production Ready
- **ไฟล์หลัก**:
  - `business-logic/gacp-survey-system.js` - Main Survey System
  - `apps/backend/modules/survey-system/` - Survey Module
- **คุณสมบัติหลัก**:
  - ✅ **7-Step Survey Wizard** (ตัวช่วยสร้างแบบสอบถาม 7 ขั้นตอน)
  - ✅ **4-Region Analytics** (เหนือ, อีสาน, กลาง, ใต้)
  - ✅ Multi-language Support (Thai/English)
  - ✅ Pre-built Survey Templates
  - ✅ Real-time Analytics & Reporting
  - ✅ Survey Response Management
  - ✅ Data Export (Excel, PDF, CSV)
  - ✅ Custom Survey Builder
- **การทำงาน**:
  - **100% Standalone** - ไม่ขึ้นกับระบบอื่น
  - สร้างแบบสอบถาม → แจกจ่าย → เก็บข้อมูล → วิเคราะห์ผล → รายงาน
- **ผู้ใช้งาน**: เจ้าหน้าที่ DTAM, นักวิจัย, ผู้จัดการโครงการ
- **API Endpoints**: `/api/survey/*`, `/api/surveys-4regions/*`
- **การเชื่อมต่อ**:
  - ✅ ใช้ระบบ #1 สำหรับ Login เท่านั้น
  - ⚠️ **ไม่เชื่อมต่อกับระบบอื่นๆ (Standalone)**

---

### **6. ระบบเปรียบเทียบมาตรฐาน GACP (Standards Comparison System)**

- **Service ID**: `STD-CMP-006`
- **ชื่อระบบ**: GACP Multi-Standards Comparison System
- **ประเภท**: **Standalone Service** (ไม่รวมกับใคร)
- **สถานะ**: ✅ Production Ready
- **ไฟล์หลัก**:
  - `business-logic/gacp-standards-comparison-system.js` - Main Comparison System
  - `apps/backend/modules/standards-comparison/` - Standards Module
- **มาตรฐานที่รองรับ (8 Standards)**:
  - ✅ **GACP** - Good Agricultural and Collection Practices
  - ✅ **GAP** - Good Agricultural Practices (Thailand)
  - ✅ **Organic** - Organic Agriculture Standards
  - ✅ **EU-GMP** - European Good Manufacturing Practice
  - ✅ **USP** - United States Pharmacopeia
  - ✅ **WHO-GMP** - World Health Organization GMP
  - ✅ **ISO-22000** - Food Safety Management
  - ✅ **HACCP** - Hazard Analysis Critical Control Points
- **คุณสมบัติหลัก**:
  - ✅ Multi-Standards Comparison (เปรียบเทียบหลายมาตรฐาน)
  - ✅ Gap Analysis (วิเคราะห์ช่องว่าง)
  - ✅ Implementation Roadmap (แผนการดำเนินการ)
  - ✅ Cost Analysis (วิเคราะห์ต้นทุน)
  - ✅ Compliance Assessment (ประเมินความสอดคล้อง)
  - ✅ Certification Planning (วางแผนรับรอง)
  - ✅ Requirements Mapping (แผนที่ความต้องการ)
- **การทำงาน**:
  - **100% Standalone** - ไม่ขึ้นกับระบบอื่น
  - เลือกมาตรฐาน → เปรียบเทียบ → วิเคราะห์ Gap → สร้าง Roadmap → รายงาน
- **ผู้ใช้งาน**: เกษตรกร, ที่ปรึกษา, DTAM Staff, นักวิชาการ
- **API Endpoints**: `/api/standards-comparison/*`, `/api/standards/*`
- **การเชื่อมต่อ**:
  - ✅ ใช้ระบบ #1 สำหรับ Login เท่านั้น
  - ⚠️ **ไม่เชื่อมต่อกับระบบอื่นๆ (Standalone)**

---

## 🔧 **บริการเสริม (Supporting Services)**

### **7. ระบบออกใบรับรอง (Certificate Management)**

- **Service ID**: `CERT-007`
- **ไฟล์**: `apps/certificate-portal/`, `apps/backend/modules/certificate-management/`
- **คุณสมบัติ**: ออกใบรับรอง GACP, ตรวจสอบใบรับรอง, QR Code Verification
- **เชื่อมต่อกับ**: ระบบ #2 (Application)

### **8. ระบบแจ้งเตือน (Notification System)**

- **Service ID**: `NOTIFY-008`
- **ไฟล์**: `apps/backend/modules/notification/`
- **คุณสมบัติ**: Email, SMS, In-app Notifications, Push Notifications
- **เชื่อมต่อกับ**: ทุกระบบ

### **9. ระบบรายงานและวิเคราะห์ (Reporting & Analytics)**

- **Service ID**: `REPORT-009`
- **ไฟล์**: `apps/backend/modules/reporting-analytics/`
- **คุณสมบัติ**: Dashboard, KPI Reports, Compliance Reports
- **เชื่อมต่อกับ**: ทุกระบบ

### **10. ระบบ SOP Wizard (Standard Operating Procedures)**

- **Service ID**: `SOP-010`
- **ไฟล์**: `business-logic/gacp-sop-wizard-system.js`
- **คุณสมบัติ**: สร้าง SOP, จัดการ SOP, อบรม SOP
- **เชื่อมต่อกับ**: ระบบ #3 (Farm Management)

---

## 📊 **สรุปสถาปัตยกรรมระบบ**

### **ระบบหลักที่เชื่อมต่อกัน (Integrated Core Services)**

```
1. Auth/SSO ──────────┐
                      ├──> 2. GACP Application ──> 4. Track & Trace
                      │            │
                      ├──> 3. Farm Management ────┘
                      │
                      └──> 7. Certificate Management
```

### **ระบบ Standalone (ไม่เชื่อมต่อกับระบบอื่น)**

```
1. Auth/SSO ──> 5. Survey System (Standalone)
              └─> 6. Standards Comparison (Standalone)
```

---

## 🎯 **การใช้งานตามกลุ่มผู้ใช้**

### **👨‍🌾 เกษตรกร (Farmer)**

- ✅ ระบบ #1: Login
- ✅ ระบบ #2: ยื่นคำขอรับรอง
- ✅ ระบบ #3: จัดการฟาร์ม
- ✅ ระบบ #4: Track and Trace สินค้า
- ✅ ระบบ #6: เปรียบเทียบมาตรฐาน

### **👔 เจ้าหน้าที่ DTAM (DTAM Staff)**

- ✅ ระบบ #1: Login
- ✅ ระบบ #2: ตรวจสอบ/อนุมัติคำขอ
- ✅ ระบบ #3: ควบคุมฟาร์มทั้งหมด
- ✅ ระบบ #5: สร้างแบบสอบถาม/วิเคราะห์
- ✅ ระบบ #6: เปรียบเทียบมาตรฐาน
- ✅ ระบบ #9: รายงานและวิเคราะห์

### **🔬 นักวิจัย/ที่ปรึกษา (Researcher/Consultant)**

- ✅ ระบบ #5: Survey System
- ✅ ระบบ #6: Standards Comparison
- ✅ ระบบ #9: Reporting & Analytics

---

## 📝 **วิธีการระบุบริการหลักที่ถูกต้อง**

### ✅ **คำสั่งที่แนะนำ**

```
"แสดงรายการบริการหลักทั้งหมด"
"Main services ของระบบมีอะไรบ้าง"
"บอกบริการหลัก 6 อย่างของแพลตฟอร์ม"
"แสดง Service Catalog"
```

### ✅ **ตัวอย่างการตอบที่ถูกต้อง**

```
ระบบมี 6 บริการหลัก (Main Services):

1. ✅ ระบบสมาชิก SSO (AUTH-SSO-001)
2. ✅ ระบบยื่นเอกสารขอรับรอง GACP (GACP-APP-002)
3. ✅ ระบบบริหารจัดการฟาร์ม (FARM-MGT-003) - Standalone + Backend Control
4. ✅ ระบบ Track and Trace (TRACK-004)
5. ✅ ระบบสำรวจ (SURVEY-005) - 100% Standalone
6. ✅ ระบบเปรียบเทียบมาตรฐาน GACP (STD-CMP-006) - 100% Standalone

และมี 4 บริการเสริม (Supporting Services):
7-10. Certificate, Notification, Reporting, SOP Wizard
```

---

## 🔐 **Service Dependencies (การเชื่อมต่อระหว่างระบบ)**

| Service            | Depends On  | Used By        |
| ------------------ | ----------- | -------------- |
| #1 Auth/SSO        | -           | ทุกระบบ        |
| #2 Application     | #1, #3, #4  | #7 Certificate |
| #3 Farm Management | #1          | #2, #4         |
| #4 Track & Trace   | #1, #3      | #2             |
| #5 Survey          | #1 เท่านั้น | - (Standalone) |
| #6 Standards       | #1 เท่านั้น | - (Standalone) |

---

## 📌 **Key Points สำคัญ**

### ✅ **ระบบที่เป็น Standalone**

1. **Survey System (#5)** - ไม่เชื่อมต่อกับระบบอื่นนอกจาก Auth
2. **Standards Comparison (#6)** - ไม่เชื่อมต่อกับระบบอื่นนอกจาก Auth

### ✅ **ระบบที่มี Backend Control**

- **Farm Management (#3)** - เกษตรกรใช้งานได้เอง แต่ DTAM ควบคุมได้จากหลังบ้าน

### ✅ **ระบบที่เชื่อมต่อกันแน่นหนา**

- Application (#2) + Farm (#3) + Track & Trace (#4) = ทำงานร่วมกันเป็นระบบเดียว

---

## 📚 **เอกสารอ้างอิง**

- **ไฟล์นี้**: `docs/MAIN_SERVICES_CATALOG.md`
- **API Documentation**: `docs/API_DOCUMENTATION.md`
- **System Architecture**: `docs/01_SYSTEM_ARCHITECTURE/`
- **Complete System Inventory**: `COMPLETE_SYSTEM_INVENTORY.md`

---

**Last Updated**: October 21, 2025  
**Version**: 2.0.0  
**Maintained By**: GACP Platform Development Team
