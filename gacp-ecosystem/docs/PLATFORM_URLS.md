# GACP Platform - Complete URL Documentation

> **Single Source of Truth** - ถ้า port เปลี่ยน ให้แก้ไขใน config files เท่านั้น

---

## 🔧 Port Configuration

| Platform | Port | Config File |
|----------|------|-------------|
| Frontend (Next.js) | **3000** | `apps/web-app/src/config/api.config.ts` |
| Backend (Express) | **5000** | `apps/backend/simple-start.js` |
| Mobile (Flutter) | connects to **5000** | `apps/mobile_app/lib/core/config/api_config.dart` |

---

## 🌐 Web Frontend URLs (http://localhost:3000)

### สำหรับ เกษตรกร / ผู้ประกอบการ

| หน้า | URL | คำอธิบาย |
|------|-----|---------|
| 🏠 Homepage | `/` | หน้าแรก เลือกประเภทผู้ใช้ |
| 🔐 Login | `/login` | เข้าสู่ระบบ |
| 📝 Register | `/register` | ลงทะเบียนใหม่ |
| 🔑 Forgot Password | `/forgot-password` | ลืมรหัสผ่าน |
| 📊 Dashboard | `/dashboard` | หน้าหลักหลัง login |
| 📋 Applications | `/applications` | รายการคำขอรับรอง |
| ➕ New Application | `/applications/new` | ยื่นคำขอใหม่ |
| 📄 Application Detail | `/applications/[id]` | รายละเอียดคำขอ |
| 🏭 Establishments | `/establishments` | รายการสถานประกอบการ |
| ➕ New Establishment | `/establishments/new` | เพิ่มสถานประกอบการใหม่ |
| 📜 Certificates | `/certificates` | ใบรับรองที่ได้รับ |
| 📁 Documents | `/documents` | เอกสารประกอบ |
| 💰 Payments | `/payments` | ประวัติการชำระเงิน |
| 📍 Tracking | `/tracking` | ติดตามสถานะ |
| 🔔 Notifications | `/notifications` | การแจ้งเตือน |
| 👤 Profile | `/profile` | จัดการโปรไฟล์ |

### สำหรับ เจ้าหน้าที่ (Staff)

| หน้า | URL | คำอธิบาย |
|------|-----|---------|
| 🔐 Staff Login | `/staff/login` | เข้าสู่ระบบเจ้าหน้าที่ |
| 📊 Staff Dashboard | `/staff/dashboard` | หน้าหลักเจ้าหน้าที่ |
| 📈 Analytics | `/staff/analytics` | วิเคราะห์ข้อมูล |
| 📋 Applications | `/staff/applications` | ตรวจสอบคำขอ |
| 🔍 Audits | `/staff/audits` | การตรวจสอบ |
| 📅 Calendar | `/staff/calendar` | ปฏิทินนัดหมาย |

### Admin

| หน้า | URL | คำอธิบาย |
|------|-----|---------|
| 🔐 Admin Login | `/admin` | เข้าสู่ระบบ Admin |

---

## 🔌 Backend API URLs (http://localhost:5000)

### Health & Status

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/health` | GET | API health check |
| `/api/v2/health` | GET | V2 API health check |

### Authentication - เกษตรกร

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth-farmer/register` | POST | ลงทะเบียน |
| `/api/auth-farmer/login` | POST | เข้าสู่ระบบ |
| `/api/auth-farmer/logout` | POST | ออกจากระบบ |
| `/api/auth-farmer/me` | GET | ข้อมูลผู้ใช้ปัจจุบัน |

### V2 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v2/establishments` | GET/POST | CRUD สถานประกอบการ |
| `/api/v2/applications` | GET/POST | CRUD คำขอรับรอง |
| `/api/v2/documents` | GET/POST | CRUD เอกสาร |
| `/api/v2/files/upload` | POST | อัพโหลดไฟล์ |
| `/api/v2/reports/*` | GET | รายงานสำหรับเจ้าหน้าที่ |
| `/api/v2/metrics` | GET | Prometheus metrics |
| `/api/v2/audit` | GET | Audit logs |

### Documentation

| URL | Description |
|-----|-------------|
| `/api-docs` | Swagger UI - API Documentation |

---

## 📱 Mobile App (Flutter)

### Config Location
```
apps/mobile_app/lib/core/config/api_config.dart
```

### Port Configuration (In api_config.dart)
```dart
static const int backendPort = 5000;  // ← เปลี่ยนที่นี่
```

### Platform-specific URLs (Auto-generated)
- **Web**: `http://localhost:5000/api`
- **Android Emulator**: `http://10.0.2.2:5000/api`
- **iOS Simulator**: `http://localhost:5000/api`

---

## 🔄 ถ้าต้องการเปลี่ยน Port

### วิธีที่ 1: แก้ไข Config File เดียว (Recommended)

**Web Frontend:**
```typescript
// apps/web-app/src/config/api.config.ts
const BACKEND_PORT = 5000;  // ← เปลี่ยนที่นี่
```

**Mobile App:**
```dart
// apps/mobile_app/lib/core/config/api_config.dart
static const int backendPort = 5000;  // ← เปลี่ยนที่นี่
```

**Backend:**
```javascript
// apps/backend/simple-start.js
const port = process.env.PORT || 5000;  // ← เปลี่ยนที่นี่
```

### วิธีที่ 2: ใช้ Environment Variables

```bash
# Backend
PORT=5000 node simple-start.js

# Frontend (สร้าง .env.local)
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## ✅ Quick Reference

```
🌐 Frontend:  http://localhost:3000
🔌 Backend:   http://localhost:5000
📱 Mobile:    connects to → :5000

👨‍🌾 เกษตรกร Click: "เข้าสู่ระบบ" → /login
🏢 เจ้าหน้าที่ Click: "🛡️ เจ้าหน้าที่" → /staff/login
```
