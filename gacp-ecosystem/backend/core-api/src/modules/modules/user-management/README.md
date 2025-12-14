# User Management Module

โฟลเดอร์นี้สำหรับระบบ "สมาชิก/บัญชี" (Membership System)

## โครงสร้าง

- controllers/ : ควบคุมการรับส่งข้อมูลระหว่าง client และ business logic
- domain/ : กำหนด business entity, model, validation
- infrastructure/ : เชื่อมต่อฐานข้อมูล, external service
- presentation/ : จัดการรูปแบบข้อมูลที่แสดงผล
- routes/ : กำหนด API endpoint
- services/ : business logic หลัก

## หมายเหตุ

- ทุกไฟล์ควรตั้งชื่อให้สื่อความหมาย
- ไม่ควรมี index.js ที่ซ้ำกันทุกโฟลเดอร์
- หากมีไฟล์ที่ไม่จำเป็น ให้ลบออก
