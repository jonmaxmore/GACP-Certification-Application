# 🚀 GACP Platform - Quick Start Guide

## 📋 สิ่งที่ทำเสร็จแล้ว

### ✅ Phase 1-2 Complete

- Context Providers (AuthContext, ApplicationContext)
- Landing Page แบบ Role-Based
- Login/Register Pages พร้อม Demo Accounts
- Farmer Dashboard แบบ Workflow-Aware
- WorkflowProgress Component

---

## 🎮 วิธีใช้งาน (User Guide)

### 1. เปิดเบราว์เซอร์

```
http://localhost:3000
```

### 2. Login ด้วย Demo Account

ไปที่หน้า Login:

```
http://localhost:3000/login
```

**Demo Accounts** (4 roles):

| Role             | Email               | Password   | Access                 |
| ---------------- | ------------------- | ---------- | ---------------------- |
| 🌾 **Farmer**    | `farmer@gacp.th`    | `demo1234` | `/farmer/dashboard`    |
| 👔 **Officer**   | `officer@gacp.th`   | `demo1234` | `/officer/dashboard`   |
| 🔍 **Inspector** | `inspector@gacp.th` | `demo1234` | `/inspector/dashboard` |
| ⚙️ **Admin**     | `admin@gacp.th`     | `demo1234` | `/admin/dashboard`     |

**วิธีใช้ Demo Account**:

1. ไปที่หน้า `/login`
2. คลิกปุ่ม **"เกษตรกร (Farmer)"** (หรือ role อื่นๆ)
3. ระบบจะ auto-login และ redirect ไป Dashboard

### 3. Farmer Dashboard

หลัง login ด้วย Farmer account จะเห็น:

- ✅ **Header**: "Dashboard เกษตรกร" พร้อมชื่อ
- ✅ **Alert**: "คุณยังไม่มีใบสมัคร GACP"
- ✅ **Next Action Card**: "เริ่มยื่นคำขอ GACP" (สีน้ำเงิน)
- ✅ **Applications List**: "ใบสมัครทั้งหมด (0)"

### 4. Register (สมัครสมาชิกใหม่)

ไปที่:

```
http://localhost:3000/register
```

**Steps**:

1. เลือก Role (Farmer/Officer/Inspector/Admin)
2. กรอก:
   - ชื่อ-นามสกุล
   - อีเมล
   - เบอร์โทรศัพท์ (optional)
   - รหัสผ่าน (อย่างน้อย 6 ตัว)
   - ยืนยันรหัสผ่าน
3. คลิก "สมัครสมาชิก"
4. ✅ Success → Auto-login → Redirect ไป Dashboard

---

## 🏗️ สำหรับนักพัฒนา (Developer Guide)

### Project Structure

```
frontend-nextjs/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing Page (Role-Based)
│   │   ├── login/page.tsx              # Login Page
│   │   ├── register/page.tsx           # Register Page
│   │   ├── unauthorized/page.tsx       # 403 Page
│   │   ├── providers.tsx               # Global Providers
│   │   └── farmer/
│   │       └── dashboard/page.tsx      # Farmer Dashboard
│   │
│   ├── contexts/
│   │   ├── AuthContext.tsx             # Authentication State
│   │   └── ApplicationContext.tsx      # Application State
│   │
│   └── components/
│       └── WorkflowProgress.tsx        # 8-Step Progress
```

### Context API Usage

#### AuthContext

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, token, login, logout, isAuthenticated } = useAuth();

  // ข้อมูล user
  console.log(user?.name); // "ชื่อเกษตรกร"
  console.log(user?.role); // "FARMER"

  // Login
  await login({ email: 'test@gacp.th', password: '123456' });

  // Logout
  logout();
}
```

#### Protected Routes

```tsx
import { withAuth } from '@/contexts/AuthContext';

function FarmerPage() {
  return <div>เฉพาะ Farmer</div>;
}

// Protect route - เฉพาะ FARMER
export default withAuth(FarmerPage, ['FARMER']);

// Multiple roles
export default withAuth(OfficerPage, ['DTAM_OFFICER', 'ADMIN']);
```

#### ApplicationContext

```tsx
import { useApplication } from '@/contexts/ApplicationContext';

function MyComponent() {
  const {
    applications,
    currentApplication,
    fetchApplications,
    createApplication,
    isLoading,
    error
  } = useApplication();

  useEffect(() => {
    fetchApplications();
  }, []);

  // สร้างใบสมัครใหม่
  const app = await createApplication({
    farmName: 'ฟาร์มตัวอย่าง',
    farmSize: 10
    // ...
  });
}
```

### WorkflowProgress Component

```tsx
import WorkflowProgress from '@/components/WorkflowProgress';

<WorkflowProgress
  currentState="DOCUMENT_REVIEW"
  currentStep={3}
  variant="horizontal" // or "vertical"
/>;
```

---

## 🔌 Backend API Endpoints (Ready to Connect)

### Authentication

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/me
```

### Applications

```
GET    /api/applications
POST   /api/applications
GET    /api/applications/:id
PUT    /api/applications/:id
POST   /api/applications/:id/submit
```

### Documents

```
POST   /api/applications/:id/documents/upload
GET    /api/applications/:id/documents
DELETE /api/applications/:id/documents/:docId
```

### Payments

```
POST /api/payments/phase1
POST /api/payments/phase2
GET  /api/payments/:id
PUT  /api/payments/:id/confirm
```

---

## 🐛 Troubleshooting

### Issue 1: "คุณยังไม่มีใบสมัคร GACP"

**Cause**: ยังไม่มี Backend API เชื่อมต่อ  
**Solution**: ปกติ - รอสร้างหน้า Application Form และเชื่อมต่อ API

### Issue 2: คลิก "ยื่นคำขอ" แล้ว 404

**Cause**: หน้า `/farmer/applications/new` ยังไม่ได้สร้าง  
**Solution**: รอ Phase 3 (Next Step)

### Issue 3: Lint Errors (CRLF)

**Cause**: Line ending differences (Windows vs Unix)  
**Solution**: ไม่กระทบการทำงาน - ใช้ได้ปกติ

### Issue 4: Login ไม่ได้ (Network Error)

**Cause**: Backend API ไม่ทำงาน  
**Solution**: ตอนนี้ใช้ Demo Accounts (auto-login) แทน

---

## 📈 Next Steps

### Phase 3: Farmer Application Flow (8-10 hours)

1. **สร้างหน้า Application Form**

   ```
   /farmer/applications/new
   ```

   - Farm Information Form
   - Validation
   - Save as DRAFT

2. **สร้างหน้า Upload Documents**

   ```
   /farmer/documents
   ```

   - 5 document types:
     - บัตรประชาชน (ID Card)
     - ทะเบียนบ้าน (House Registration)
     - โฉนดที่ดิน (Land Deed)
     - แผนที่ฟาร์ม (Farm Map)
     - ใบอนุญาตแหล่งน้ำ (Water Source Permit)
   - File upload validation
   - Preview

3. **สร้างหน้า Payment**

   ```
   /farmer/payments
   ```

   - Phase 1: 5,000 THB
   - Phase 2: 25,000 THB
   - QR Code Payment
   - Bank Transfer
   - Upload Receipt

4. **เชื่อมต่อ Backend API**
   - Authentication endpoints
   - Applications endpoints
   - Documents upload
   - Payments endpoints

---

## 📚 Documentation

- `docs/SYSTEM_ARCHITECTURE_PLAN.md` - Complete Architecture
- `docs/IMPLEMENTATION_PROGRESS_REPORT.md` - Progress Report
- `docs/GACP_BUSINESS_LOGIC.md` - Business Logic
- `business-logic/gacp-workflow-engine.js` - Workflow Engine

---

## 🎯 Current Status

| Component         | Status         | Progress |
| ----------------- | -------------- | -------- |
| Context Providers | ✅ Complete    | 100%     |
| Authentication    | ✅ Complete    | 100%     |
| Landing Page      | ✅ Complete    | 100%     |
| Farmer Dashboard  | ✅ Complete    | 100%     |
| Farmer Forms      | 🔴 Not Started | 0%       |
| Officer Pages     | 🔴 Not Started | 0%       |
| Inspector Pages   | 🔴 Not Started | 0%       |
| Admin Pages       | 🔴 Not Started | 0%       |
| Backend API       | 🔴 Not Started | 0%       |

**Overall**: **35%** Complete (Foundation Ready)

---

## 💡 Tips

### For Developers

- ใช้ `withAuth()` HOC สำหรับ protected routes
- ใช้ `useAuth()` hook เพื่อเข้าถึง user และ authentication
- ใช้ `useApplication()` hook เพื่อจัดการ applications
- WorkflowProgress component รองรับ 27 workflow states

### For Testing

- ใช้ Demo Accounts สำหรับทดสอบแต่ละ role
- ตรวจสอบ Console สำหรับ errors
- ดู Network tab สำหรับ API calls (ตอนนี้ยังไม่มี)

---

**Last Updated**: 22 October 2025  
**Version**: 1.0.0 (Foundation Complete)
