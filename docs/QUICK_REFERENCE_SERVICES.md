# 📇 GACP Platform - Quick Reference Card

## บัตรอ้างอิงด่วน - บริการหลักทั้งหมด

---

## 🎯 6 บริการหลัก (Main Services)

| #   | บริการ                 | Service ID   | ประเภท             | Standalone |
| --- | ---------------------- | ------------ | ------------------ | ---------- |
| 1   | ระบบสมาชิก SSO         | AUTH-SSO-001 | Infrastructure     | ❌         |
| 2   | ระบบยื่นเอกสารขอรับรอง | GACP-APP-002 | Business           | ❌         |
| 3   | ระบบบริหารจัดการฟาร์ม  | FARM-MGT-003 | Standalone+Control | ✅         |
| 4   | ระบบ Track and Trace   | TRACK-004    | Business           | ❌         |
| 5   | ระบบสำรวจ              | SURVEY-005   | Standalone         | ✅         |
| 6   | ระบบเปรียบเทียบมาตรฐาน | STD-CMP-006  | Standalone         | ✅         |

---

## 🔗 การเชื่อมต่อระหว่างระบบ

```
┌─────────────────────────────────────────────────────┐
│  #1 Auth/SSO (ทุกคนต้องใช้)                        │
└────┬──────────┬──────────┬────────────┬─────────────┘
     │          │          │            │
     ▼          ▼          ▼            ▼
  ┌──────┐  ┌──────┐  ┌──────┐     ┌──────┐
  │  #2  │◄─┤  #3  │◄─┤  #4  │     │  #5  │ Standalone
  │ GACP │  │ Farm │  │Track │     │Survey│ (ไม่รวมกับใคร)
  └──────┘  └──────┘  └──────┘     └──────┘
                                   ┌──────┐
                                   │  #6  │ Standalone
                                   │ Std. │ (ไม่รวมกับใคร)
                                   └──────┘
```

---

## 📋 คำตอบมาตรฐาน (Standard Answer)

### **คำถาม**: "ระบบของเรามีอะไรบ้าง?"

### **คำตอบ**:

```
GACP Platform มี 6 บริการหลัก:

1. ✅ ระบบสมาชิก SSO (AUTH-SSO-001)
   - ทุกคนต้องใช้สำหรับ Login

2. ✅ ระบบยื่นเอกสารขอรับรอง GACP (GACP-APP-002)
   - Farmer Portal + DTAM Panel

3. ✅ ระบบบริหารจัดการฟาร์ม (FARM-MGT-003)
   - Standalone + มีระบบควบคุมหลังบ้าน

4. ✅ ระบบ Track and Trace (TRACK-004)
   - Seed-to-Sale Tracking

5. ✅ ระบบสำรวจ (SURVEY-005)
   - 100% Standalone (ไม่รวมกับใคร)
   - 7-Step Wizard, 4 ภูมิภาค

6. ✅ ระบบเปรียบเทียบมาตรฐาน GACP (STD-CMP-006)
   - 100% Standalone (ไม่รวมกับใคร)
   - รองรับ 8 มาตรฐาน

+ 4 บริการเสริม: Certificate, Notification, Reporting, SOP
```

---

## 🎯 Standalone Services

### **3 ระบบที่เป็น Standalone:**

#### **#3 Farm Management**

- ✅ Standalone
- ⚠️ แต่มีระบบควบคุมหลังบ้าน (DTAM ควบคุมได้)

#### **#5 Survey System**

- ✅ 100% Standalone
- ❌ ไม่เชื่อมต่อกับระบบอื่น (นอกจาก Auth)

#### **#6 Standards Comparison**

- ✅ 100% Standalone
- ❌ ไม่เชื่อมต่อกับระบบอื่น (นอกจาก Auth)

---

## 📊 Statistics

- **Total Services**: 10 (6 Main + 4 Supporting)
- **Standalone**: 3 services
- **Integrated**: 3 services
- **Infrastructure**: 1 service (Auth/SSO)
- **Production Ready**: 100% (10/10)

---

## 🔍 Quick Commands

```bash
# Display service catalog
node config/services-catalog.js

# Run system verification
node scripts/verify-systems.js

# Check all services
node config/services-catalog.js | grep "Main Services"
```

---

## 📚 Documentation Files

| File                                    | Purpose                |
| --------------------------------------- | ---------------------- |
| `docs/MAIN_SERVICES_CATALOG.md`         | รายละเอียดครบทุกบริการ |
| `docs/HOW_TO_IDENTIFY_MAIN_SERVICES.md` | วิธีการระบุบริการ      |
| `config/services-catalog.js`            | Service Config         |
| `COMPLETE_SYSTEM_INVENTORY.md`          | สินค้าคงคลังระบบ       |

---

## 🚀 Key Takeaways

1. **6 Main Services** = บริการหลักที่ต้องจำ
2. **3 Standalone** = Farm, Survey, Standards
3. **Auth/SSO** = ทุกคนต้องใช้
4. **Application + Farm + Track** = เชื่อมต่อกันแน่นหนา
5. **Survey + Standards** = ไม่รวมกับใคร (100% Standalone)

---

**Print & Keep This Card!** 📌

_Last Updated: October 21, 2025_  
_Version: 2.0.0_
