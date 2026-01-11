# GACP System: User Guide / คู่มือการใช้งานด่วน

## For Farmer (สำหรับเกษตรกร)

### 1. Registration (การสมัคร)
1.  Go to `/register`.
2.  Fill Email/Password.
3.  Check Email > Click Link to Verify.
4.  Login.

### 2. Certification (การขอใบรับรอง)
1.  **Dashboard** > Click "New Application" (ยื่นคำขอใหม่).
2.  **Step 1-8 Wizard**:
    *   **Info**: กรอกข้อมูลส่วนตัว
    *   **Production**: เลือกพืช, ระยะปลูก, จำนวนต้น (สำคัญ!)
    *   **Location**: ปักหมุดพิกัดแปลง
    *   **Docs**: อัปโหลดโฉนด/บัตรปชช.
3.  **Submit**: กดยืนยันคำขอ
4.  **Wait**: รอเจ้าหน้าที่ตรวจ (ประมาณ 1-3 วัน)

### 3. Payment (การจ่ายเงิน)
1.  When notified, go to **Payments** menu.
2.  Click "Pay with Ksher".
3.  Scan QR or Enter Credit Card.
4.  Status updates to "Pending Audit".

### 4. Traceability (การใช้งานระบบปลูก)
*After Approval Only (ต้องผ่านการอนุมัติก่อน)*

1.  **Setup Plot (สร้างแปลง)**:
    *   Go to **Tracking** > **Plots**.
    *   Click "+ New Plot".
    *   Select Type (Outdoor/Indoor) - *Must match certificate*.
2.  **Start Cycle (เริ่มปลูก)**:
    *   Go to **Tracking** > **Planting Cycles**.
    *   Click "+ Start Cycle".
    *   Select Plot + Start Date.
3.  **Harvest (เก็บเกี่ยว)**:
    *   Click on Cycle > "Harvest".
    *   Enter Weight (kg) - *Be accurate!*
    *   Result: "Harvest Batch".
4.  **Pack & QR (ออก QR)**:
    *   Go to **Tracking** > **Lots**.
    *   Click "+ Create Lot from Batch".
    *   Select Batch.
    *   Enter Pack Size (e.g., 1kg) and Quantity (e.g., 100).
    *   System checks Quota.
    *   **Print**: Click "Print QR" > Stick on products.

---

## For Staff (สำหรับเจ้าหน้าที่)

### 1. Application Review (ตรวจคำขอ)
1.  Go to `staff/dashboard`.
2.  View "Submitted Applications".
3.  **Action**:
    *   **Request Info**: Send back to farmer.
    *   **Approve Docs**: Click "Approve & Issue Invoice".

### 2. Audit (ตรวจหน้างาน/ออนไลน์)
1.  View "Pending Audit" applications.
2.  Click "Schedule" (นัดหมาย).
    *   **Audit Mode**: Select Online (Google Meet) or Onsite.
    *   **Calendar**: Click **"Add to Google Calendar"** in the success popup.
3.  After site visit/call, click "Approve Audit".

### 3. Certificate (ออกใบรับรอง)
1.  Upon Audit Approval, click "Generate Certificate".
2.  System generates PDF and activates Farmer's account mode.
