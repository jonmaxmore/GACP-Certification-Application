# Auth DTAM Module

## Overview

**DTAM Staff Authentication & Management Module**

This module handles authentication and management for DTAM (กรมส่งเสริมการเกษตร) government staff. Completely separate from farmer authentication for security.

- **Domain**: DTAM Staff Authentication
- **Status**: ✅ Phase 4 Complete
- **Dependencies**: shared module
- **Security**: Separate JWT secret, no self-registration

## ✨ Key Features

- ✅ DTAM staff login (separate from farmers)
- ✅ **NO self-registration** - admin creates accounts only
- ✅ Role-based access control (admin, reviewer, manager, inspector)
- ✅ Separate JWT secret for enhanced security
- ✅ Staff management (create, list, deactivate)
- ✅ Profile management
- ✅ Login attempt tracking & account locking

## 📁 Structure

```
auth-dtam/
├── routes/
│   └── dtam-auth.js           # DTAM authentication routes
├── models/
│   └── DTAMStaff.js           # DTAM staff model
├── middleware/
│   └── dtam-auth.js           # DTAM-specific middleware
├── services/
│   └── logger.js              # Logging service
├── index.js                   # Module entry
└── README.md                  # This file
```

## 🚀 Quick Start

### Import & Mount

```javascript
const authDTAM = require('./modules/auth-dtam');

// Mount routes
authDTAM.mountRoutes(app, '/api/auth-dtam');

// Add DTAM middleware to shared
const shared = require('./modules/shared');
shared.middleware.dtamAuth = authDTAM.middleware.dtamAuth;
shared.middleware.requireDTAMAdmin = authDTAM.middleware.requireDTAMAdmin;
```

### Use Models

```javascript
const { DTAMStaff } = authDTAM.models;

// Find staff
const staff = await DTAMStaff.findByIdentifier('admin.dtam');

// Authenticate
const result = await DTAMStaff.authenticate('admin.dtam', 'password');
```

### Use Middleware

```javascript
// Protect DTAM routes
router.get('/dtam-only', authDTAM.middleware.dtamAuth, (req, res) => {
  // req.user contains DTAM staff info
});

// Admin only
router.post(
  '/admin-only',
  authDTAM.middleware.dtamAuth,
  authDTAM.middleware.requireDTAMAdmin,
  (req, res) => {
    /* ... */
  },
);

// Multiple roles
router.post(
  '/manager-or-admin',
  authDTAM.middleware.dtamAuth,
  authDTAM.middleware.requireDTAMRole(['admin', 'manager']),
  (req, res) => {
    /* ... */
  },
);
```

## 📡 API Endpoints

### POST /api/auth-dtam/login

เข้าสู่ระบบเจ้าหน้าที่ DTAM (DTAM staff login)

**Request:**

```json
{
  "username": "admin.dtam",
  "password": "password123",
  "userType": "DTAM_STAFF"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "เข้าสู่ระบบสำเร็จ",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "userId": "dtam-001",
      "username": "admin.dtam",
      "email": "admin@dtam.go.th",
      "firstName": "ผู้ดูแลระบบ",
      "lastName": "DTAM",
      "userType": "DTAM_STAFF",
      "role": "admin",
      "department": "กรมส่งเสริมการเกษตร"
    }
  }
}
```

### POST /api/auth-dtam/register

**BLOCKED** - ไม่สามารถสมัครสมาชิกด้วยตนเองได้

**Response (403):**

```json
{
  "success": false,
  "error": "ไม่สามารถสมัครสมาชิกด้วยตนเองได้ - บัญชีเจ้าหน้าที่ต้องสร้างโดยผู้ดูแลระบบเท่านั้น"
}
```

### GET /api/auth-dtam/verify

ตรวจสอบ DTAM token

**Headers:**

```
Authorization: Bearer <dtam_token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "valid": true,
    "user": {
      "userId": "dtam-001",
      "username": "admin.dtam",
      "userType": "DTAM_STAFF",
      "role": "admin"
    }
  }
}
```

### GET /api/auth-dtam/profile

ดูโปรไฟล์เจ้าหน้าที่ (requires DTAM auth)

### GET /api/auth-dtam/staff-list

ดูรายชื่อเจ้าหน้าที่ทั้งหมด (admin only)

### POST /api/auth-dtam/create-staff

สร้างบัญชีเจ้าหน้าที่ใหม่ (admin only)

**Request:**

```json
{
  "username": "reviewer01",
  "email": "reviewer01@dtam.go.th",
  "password": "SecurePass123",
  "firstName": "สมชาย",
  "lastName": "ใจดี",
  "role": "reviewer",
  "department": "กรมส่งเสริมการเกษตร"
}
```

### GET /api/auth-dtam/health

ตรวจสอบสถานะ service

## 🔐 Security Features

### Separate JWT Secret

- ใช้ `DTAM_JWT_SECRET` แยกจาก farmer authentication
- Token มีอายุสั้นกว่า (8 ชั่วโมง vs 7 วัน)
- ป้องกันการใช้ farmer token เข้าถึงระบบ DTAM

### NO Self-Registration

- ไม่มีหน้า register สำหรับ DTAM staff
- บัญชีสร้างโดย admin เท่านั้น
- ป้องกันการสร้างบัญชี unauthorized

### Role-Based Access Control

```javascript
// Roles and permissions
{
  admin: ['*'],              // All permissions
  manager: [
    'view_all_applications',
    'approve_applications',
    'manage_staff',
    'export_data'
  ],
  reviewer: [
    'view_applications',
    'review_applications',
    'create_reports'
  ],
  inspector: [
    'view_applications',
    'conduct_inspections',
    'upload_documents'
  ]
}
```

### Account Protection

- Login attempt tracking
- Auto-lock after 5 failed attempts
- Account status management (active/inactive)
- Password hashing (bcrypt, cost: 12)

## 🏗️ Models

### DTAMStaff Model

**Collection**: `dtam_staff`

**Fields:**

- `username` (String, unique, required)
- `email` (String, unique, required)
- `password` (String, hashed, required)
- `firstName`, `lastName` (String, required)
- `userType` (String, always 'DTAM_STAFF')
- `role` (String: admin/reviewer/manager/inspector)
- `department` (String)
- `isActive` (Boolean)
- `lastLoginAt`, `loginCount`, `failedLoginAttempts`
- `createdBy` (Reference to admin who created)

**Instance Methods:**

- `comparePassword(password)` - Verify password
- `isAccountLocked()` - Check lock status
- `getPermissions()` - Get role permissions
- `updateLastLogin()` - Update login time
- `getSafeProfile()` - Get profile without password

**Static Methods:**

- `findByIdentifier(username_or_email)` - Find by username or email
- `createStaff(staffData, creator)` - Create new staff
- `authenticate(identifier, password)` - Authenticate staff
- `getStaffList(options)` - Get paginated staff list

## 🛡️ Middleware

### dtamAuth

ตรวจสอบ DTAM token และ attach user info ไปที่ `req.user`

### requireDTAMRole(roles)

ตรวจสอบว่า user มี role ที่กำหนด

```javascript
router.post(
  '/approve',
  authDTAM.middleware.dtamAuth,
  authDTAM.middleware.requireDTAMRole(['admin', 'manager']),
  (req, res) => {
    /* ... */
  },
);
```

### requireDTAMAdmin

ตรวจสอบว่าเป็น admin เท่านั้น

### requireDTAMManagerOrAdmin

ตรวจสอบว่าเป็น manager หรือ admin

## 📦 Dependencies

- `express` - Web framework
- `mongoose` - MongoDB ODM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT tokens
- `express-validator` - Input validation
- `../shared` - Shared utilities

## 🔗 Integration with Shared Module

```javascript
// Response format
shared.utils.response.success();
shared.utils.response.error();

// Constants
shared.constants.statusCodes;
shared.constants.userRoles;

// Database
shared.database.connection;
shared.database.mongoosePlugins;
```

## 🆚 Difference from Auth Farmer

| Feature          | Auth Farmer            | Auth DTAM                           |
| ---------------- | ---------------------- | ----------------------------------- |
| **User Type**    | Farmer (public)        | DTAM Staff (government)             |
| **Registration** | ✅ Allowed             | ❌ Admin only                       |
| **JWT Secret**   | `JWT_SECRET`           | `DTAM_JWT_SECRET`                   |
| **Token Expiry** | 7 days                 | 8 hours                             |
| **Roles**        | farmer, premium_farmer | admin, reviewer, manager, inspector |
| **Permissions**  | Basic + premium        | Role-based RBAC                     |

## 🧪 Testing

### Manual Testing

```bash
# Login as admin
curl -X POST http://localhost:3004/api/auth-dtam/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin.dtam","password":"password123","userType":"DTAM_STAFF"}'

# Verify token
curl -X GET http://localhost:3004/api/auth-dtam/verify \
  -H "Authorization: Bearer <dtam_token>"

# Try to register (should fail)
curl -X POST http://localhost:3004/api/auth-dtam/register \
  -H "Content-Type: application/json" \
  -d '{"username":"hacker","password":"123456"}'
```

## 📚 Migration Notes

### Source Files

- ✅ `microservices/auth-service/src/routes/auth-dtam.js` → `routes/dtam-auth.js`
- ✅ `microservices/auth-service/src/middleware/dtam-auth.js` → `middleware/dtam-auth.js`
- ✅ In-memory staff → `models/DTAMStaff.js` (MongoDB)
- ✅ New: `services/logger.js`

### Changes from Original

1. **Database**: Changed from in-memory array to MongoDB model
2. **Import Updates**: Using shared module
3. **Response Format**: Standardized with `utils.response`
4. **Error Handling**: Using shared error handler
5. **Middleware**: Enhanced with more role checks
6. **Logging**: Dedicated logger service

## 📝 Pre-configured Staff

### Default Accounts (for testing)

```javascript
// Create these via POST /api/auth-dtam/create-staff

1. admin.dtam / password123 (Admin)
2. reviewer.dtam / password123 (Reviewer)
3. manager.dtam / password123 (Manager)
```

## 🔮 Future Enhancements

- [ ] Password reset for staff
- [ ] 2FA for admin accounts
- [ ] Audit log for staff actions
- [ ] Session management
- [ ] IP whitelist for admin access
- [ ] Staff invitation via email

## 📚 Documentation

See `MODULAR_ARCHITECTURE_DESIGN.md` for complete architecture details.
