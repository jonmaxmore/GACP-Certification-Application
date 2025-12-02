# Botanical-Audit-Framework: โครงสร้างโฟลเดอร์และไฟล์ที่แนะนำ

## สรุปปัญหาโครงสร้างเดิม

- มีไฟล์ index.js ซ้ำกันหลายที่
- โครงสร้าง subfolder ในแต่ละ module ไม่เหมือนกัน
- มีไฟล์ config, shared, middleware กระจายหลายที่
- services/ กับ modules/ มี business logic ซ้ำกันบางส่วน
- routes/ กับ modules/\*/routes/ อาจซ้ำซ้อน

---

## โครงสร้างใหม่ที่แนะนำ

```
apps/backend/
  modules/
    application/
      controllers/
      domain/
      infrastructure/
      presentation/
      routes/
      services/
      README.md
    farm-management/
      ...
    survey-system/
      ...
    certificate-management/
      ...
    track-trace/
      ...
    standards-comparison/
      ...
    user-management/
      ...
  shared/
    (utility, middleware, config)
  routes/
    (API routes หลัก)
  server.js
  README.md
```

---

## แนวทางการจัดเรียงและตั้งชื่อ

- ทุก module ใช้โครงสร้างเดียวกัน
- ลบไฟล์ index.js ที่ไม่จำเป็น (ใช้ชื่อสื่อความหมายแทน)
- รวม shared/config/middleware ไว้ที่เดียว
- routes/ เป็นจุดรวม API
- README.md ทุก module

---

## ข้อดี

- ทีมเข้าใจง่าย
- ลดความซ้ำซ้อน
- ค้นหาไฟล์/แก้ไข/ขยายระบบได้ง่าย
- รองรับการเติบโตของระบบ

---

## หมายเหตุ

- หากต้องการ roadmap การย้ายไฟล์, script สำหรับจัดโครงสร้าง, หรือวิเคราะห์ dependencies เพิ่มเติม แจ้งได้เลย
