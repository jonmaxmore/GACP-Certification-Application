# ระบบ GACP: กระบวนการทำงานทางธุรกิจ (Business Workflows)

เอกสารนี้อธิบาย 3 หัวใจหลัก (3 Key Pillars) ของระบบ GACP

## 1. เสาหลักที่ 1: การขอใบอนุญาต (Licensing Workflow)
ขั้นตอนหลักในการเปลี่ยน "ผู้ขอ" ให้เป็น "ผู้ได้รับรอง"

### แผนผังลำดับเหตุการณ์ (Sequence Diagram)
```mermaid
sequenceDiagram
    participant Farmer as เกษตรกร
    participant System as ระบบ
    participant Staff as เจ้าหน้าที่
    
    Farmer->>System: 1. ยื่นคำขอ (8 ขั้นตอน)
    System->>Staff: แจ้งเตือน "มีคำขอใหม่"
    Staff->>System: 2. ตรวจสอบเอกสาร
    
    alt เอกสารไม่ผ่าน
        Staff->>System: สั่งแก้ไข (ระบุเหตุผล)
        System->>Farmer: แจ้งเตือน "เอกสารต้องแก้ไข"
        Farmer->>System: ยื่นใหม่ (Resubmit)
    else เอกสารผ่าน
        Staff->>System: 3. ออกใบแจ้งหนี้
        System->>Farmer: ส่งใบแจ้งหนี้ (Invoice)
    end
    
    Farmer->>System: 4. ชำระเงิน (ตัดบัตร/QR)
    System->>System: ตรวจสอบยอดเงิน -> สถานะ: PAID
    
    Staff->>System: 5. นัดหมายตรวจฟาร์ม (Google Calendar Integration)
    System->>Farmer: แจ้งเตือน "นัดหมายการตรวจ" (Auto-Notify)
    Staff->>System: 6. บันทึกผลตรวจ (ผ่าน)
    System->>Farmer: 7. ออกใบรับรอง (PDF)
    System->>System: 8. สร้างฟาร์มอัตโนมัติ (Auto-Farm)
```

### การควบคุมระบบ (Key Logic)
*   **Smart Logic (Land Ownership)**: ระบบตรวจสอบสิทธิ์ที่ดิน
    *   ถ้าเลือก "เช่า" หรือ "ยินยอม" -> ระบบบังคับแนบ "สัญญาเช่า/หนังสือยินยอม" อัตโนมัติ
    *   ถ้าไม่แนบ -> ไม่สามารถส่งคำขอได้
*   **Pre-Submission Protocol**: ก่อนส่งคำขอ เกษตรกรต้องผ่าน Checklist ยืนยันความจริง, ยินยอมให้ตรวจ, และรับทราบโทษทางกฎหมาย
*   **Auto-Farm**: ทันทีที่กด "ออกใบรับรอง" ระบบจะสร้างข้อมูล Farm ให้เกษตรกรทันที เพื่อนำไปใช้ต่อในระบบ Traceability
*   **Scope Lock**: ประเภทโรงเรือนของฟาร์มจะถูกล็อกตามใบรับรอง (เช่น ถ้าขอ Outdoor จะสร้าง Indoor ไม่ได้)

---

## 2. เสาหลักที่ 2: การจ่ายเงิน (Financial Flow)
ระบบการชำระเงินที่ปลอดภัยและตรวจสอบได้

### กระบวนการชำระเงิน
```mermaid
graph TD
    Start[ได้รับใบแจ้งหนี้] -->|กดชำระเงิน| Gateway{Payment Gateway}
    
    Gateway -->|ตัดบัตร/สแกน QR| Processor[ธนาคาร]
    
    Processor -- สำเร็จ --> Webhook[ระบบรับ Webhook]
    Processor -- ล้มเหลว --> UserRetry[ลองใหม่]
    
    Webhook -->|ตรวจสอบ Signature| UpdateDB[อัปเดต Invoice: PAID]
    UpdateDB -->|Trigger| UpdateApp[อัปเดตคำขอ: PENDING_AUDIT]
    UpdateApp -->|Notify| StaffNotify[แจ้งเจ้าหน้าที่]
```

---

## 3. เสาหลักที่ 3: ระบบตรวจสอบย้อนกลับ (Traceability & Quota)
การป้องกันการปลอมปนสินค้าและการควบคุมปริมาณ (Anti-Fraud)

### วงจรทองคำ (The Golden Loop)
```mermaid
graph LR
    Plot[แปลงปลูก] -->|ลงทะเบียน| Cycle[รอบปลูก]
    Cycle -->|ดูแลรักษา| Harvest[เก็บเกี่ยว]
    Harvest -->|แปรรูป| Lot[สินค้า/Lot]
    Lot -->|Generate| QR[QR Code]
```

### ระบบโควต้า (Quota Enforcement)
หัวใจสำคัญของการป้องกันการสวมสิทธิ์:

1.  **บันทึกผลผลิต**: เกษตรกรบันทึกน้ำหนักจริงที่เก็บเกี่ยวได้ (Harvest Yield) เช่น 500 กก.
2.  **สร้าง Lot**: เมื่อนำมาแบ่งบรรจุเป็นสินค้าขายจริง
3.  **เงื่อนไขการตรวจสอบ (Validation Logic)**:
    $$ ผลรวมน้ำหนักที่ออก QR แล้ว + น้ำหนัก Lot ใหม่ \le น้ำหนักที่เก็บเกี่ยวได้ $$
4.  **ผลลัพธ์**: หากพยายามออก QR Code เกินโควต้าที่มีอยู่ ระบบจะ **ปฏิเสธทันที (Block)**

### ระบบทำนายผลผลิต (Yield Prediction)
*   **ก่อนเริ่มปลูก**: ระบบคำนวณ "ผลผลิตสูงสุดทางทฤษฎี" จากพื้นที่ x ระยะปลูก
*   **แจ้งเตือน**: หากเกษตรกรกรอกตัวเลขเก็บเกี่ยว สูงเกินค่ามาตรฐาน ระบบจะติด Flag ให้เจ้าหน้าที่เข้าตรวจสอบพิเศษ
