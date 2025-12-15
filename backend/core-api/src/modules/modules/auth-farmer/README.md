# Auth Farmer Module

## Overview

**Farmer Authentication & User Management Module**

This module handles complete authentication flow for farmer users in the GACP Certify Flow platform.

- **Domain**: Farmer Authentication
- **Status**: ✅ Phase 3 Complete
- **Dependencies**: shared module

## ✨ Features

- ✅ Farmer registration with validation
- ✅ Secure login with JWT tokens
- ✅ Profile management (view/update)
- ✅ Password change functionality
- ✅ Account security (login attempts, auto-lock)
- ✅ Token verification
- ✅ Logout support

## 📁 Structure

```
auth-farmer/
├── routes/
│   └── farmer-auth.js          # Authentication routes
├── models/
│   └── User.js                 # User model with bcrypt
├── services/
│   └── logger.js               # Logging service
├── validators/
│   └── auth-validators.js      # Input validation
├── tests/                      # Tests (TBD)
├── index.js                    # Module entry
└── README.md                   # This file
```

## 🚀 Quick Start

### Import & Mount

```javascript
const authFarmer = require('./modules/auth-farmer');

// Mount routes
authFarmer.mountRoutes(app, '/api/auth-farmer');
```

### Use Models

```javascript
const { User } = authFarmer.models;

const user = await User.findByEmail('farmer@example.com');
```

## 📡 API Endpoints

### POST /api/auth-farmer/register

ลงทะเบียนเกษตรกรใหม่

**Request:**

```json
{
  "email": "farmer@example.com",
  "password": "SecurePass123",
  "firstName": "สมชาย",
  "lastName": "ใจดี",
  "phoneNumber": "0812345678"
}
```

### POST /api/auth-farmer/login

เข้าสู่ระบบ

### GET /api/auth-farmer/profile

ดูโปรไฟล์ (requires auth)

### PUT /api/auth-farmer/profile

แก้ไขโปรไฟล์ (requires auth)

### POST /api/auth-farmer/change-password

เปลี่ยนรหัสผ่าน (requires auth)

### POST /api/auth-farmer/logout

ออกจากระบบ (requires auth)

### GET /api/auth-farmer/verify

ตรวจสอบ token

## 🔐 Security Features

- Password hashing (bcrypt, cost: 12)
- Login attempt tracking
- Auto-lock after 5 failed attempts (2 hours)
- JWT token with expiry
- Account status management

## 📦 Dependencies

- `express` - Web framework
- `mongoose` - MongoDB ODM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT tokens
- `express-validator` - Input validation
- `../shared` - Shared utilities

## 🧪 Testing

```bash
npm test modules/auth-farmer
```

## 📚 Documentation

See `MODULAR_ARCHITECTURE_DESIGN.md` for complete architecture details.
