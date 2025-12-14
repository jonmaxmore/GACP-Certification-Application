# Roadmap การปรับโครงสร้างโฟลเดอร์/ไฟล์ Botanical-Audit-Framework

## 1. สำรวจและจัดกลุ่มระบบหลัก

- ตรวจสอบ modules/ services/ routes/ src/ ว่ามี business logic หรือ API ที่เกี่ยวข้องกับ 6 ระบบหลัก
- จัดกลุ่มไฟล์/โฟลเดอร์ให้ตรงกับระบบหลัก (application, farm-management, survey-system, certificate-management, track-trace, standards-comparison, user-management)

## 2. ปรับโครงสร้างภายในแต่ละ module

- ใช้โครงสร้างเดียวกันทุก module:
  - controllers/
  - domain/
  - infrastructure/
  - presentation/
  - routes/
  - services/
  - README.md
- ลบไฟล์ index.js ที่ไม่จำเป็น (ใช้ชื่อสื่อความหมายแทน)

## 3. รวม shared/config/middleware

- ย้าย utility, middleware, config ที่ใช้ร่วมกันไปไว้ที่ shared/ หรือ root

## 4. รวม API routes

- routes/ เป็นจุดรวม API หลัก เชื่อมต่อแต่ละ module
- ตรวจสอบ modules/\*/routes/ ว่ามีความซ้ำซ้อนกับ routes/ หรือไม่

## 5. เพิ่ม README.md ทุก module

- อธิบายหน้าที่และโครงสร้างของแต่ละ module

## 6. ตรวจสอบ dependencies และความซ้ำซ้อน

- วิเคราะห์ว่า services/ กับ modules/ มี business logic ซ้ำกันหรือไม่
- ย้าย business logic ไปอยู่ใน module ที่เกี่ยวข้อง

## 7. ทดสอบระบบหลังปรับโครงสร้าง

- รัน ESLint, unit test, integration test
- ตรวจสอบว่า API และ business logic ทำงานถูกต้อง

---

## หมายเหตุ

- สามารถดำเนินการทีละขั้น หรือใช้ script สำหรับย้ายไฟล์/โฟลเดอร์
- หากต้องการ script หรือรายละเอียดแต่ละขั้น แจ้งได้เลย
