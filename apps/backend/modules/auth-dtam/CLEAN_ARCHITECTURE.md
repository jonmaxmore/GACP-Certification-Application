# Auth DTAM Module - Clean Architecture

## Overview

Authentication and user management system for DTAM staff in the GACP platform. Built with Clean Architecture principles, featuring role-based access control (RBAC) and admin-only staff creation.

## Key Differences from auth-farmer

| Feature            | auth-farmer     | auth-dtam                                   |
| ------------------ | --------------- | ------------------------------------------- |
| Self-Registration  | ✅ Yes          | ❌ No (Admin only)                          |
| Roles              | Single (farmer) | 4 Roles (ADMIN, MANAGER, REVIEWER, AUDITOR) |
| Permissions        | Basic           | 17 Granular permissions                     |
| JWT Type           | `farmer`        | `dtam_staff`                                |
| Email Verification | Required        | Pre-verified                                |
| User Type          | Public          | Internal staff                              |

## Architecture

```
auth-dtam/
├── domain/                    # Business logic (pure)
│   ├── entities/
│   │   └── DTAMStaff.js      # Staff entity with RBAC
│   ├── events/
│   │   ├── DTAMStaffCreated.js
│   │   ├── DTAMStaffLoggedIn.js
│   │   └── DTAMStaffPasswordResetRequested.js
│   └── interfaces/
│       └── IDTAMStaffRepository.js
│
├── application/               # Business orchestration
│   └── use-cases/
│       ├── CreateDTAMStaffUseCase.js
│       ├── LoginDTAMStaffUseCase.js
│       ├── RequestDTAMStaffPasswordResetUseCase.js
│       ├── ResetDTAMStaffPasswordUseCase.js
│       ├── GetDTAMStaffProfileUseCase.js
│       ├── UpdateDTAMStaffProfileUseCase.js
│       ├── ListDTAMStaffUseCase.js
│       └── UpdateDTAMStaffRoleUseCase.js
│
├── infrastructure/            # Technical implementations
│   └── database/
│       └── MongoDBDTAMStaffRepository.js
│   # Reuses BcryptPasswordHasher & JWTService from auth-farmer
│
├── presentation/              # HTTP/API layer
│   ├── controllers/
│   │   └── DTAMStaffAuthController.js
│   ├── routes/
│   │   └── dtam.routes.js
│   ├── validators/
│   │   └── dtam.validator.js
│   └── dto/
│       └── DTAMStaffDTO.js
│
└── module.container.js        # Dependency injection
```

## Features

### Staff Management (Admin Only)

- Create staff accounts
- Assign roles and permissions
- No self-registration
- Pre-verified email addresses

### Authentication

- Email and password login
- Account locking after 5 failed attempts (30 minutes)
- JWT token with role and permissions
- Login tracking (IP, user agent)

### Role-Based Access Control

#### 4 Staff Roles

1. **ADMIN** - Full system access
   - All 17 permissions
   - Can create/manage staff
   - System configuration

2. **MANAGER** - Management level
   - Review and approve applications
   - Issue certificates
   - View reports and staff

3. **REVIEWER** - Review level
   - Review applications
   - View certificates and audits
   - View reports

4. **AUDITOR** - Audit level
   - View applications and certificates
   - Create and view audits
   - View reports

#### 17 Permissions

**Application Permissions:**

- `view_applications`
- `review_applications`
- `approve_applications`
- `reject_applications`

**Certificate Permissions:**

- `view_certificates`
- `issue_certificates`
- `revoke_certificates`

**Audit Permissions:**

- `view_audits`
- `create_audits`
- `approve_audits`

**Staff Management Permissions:**

- `view_staff`
- `create_staff`
- `update_staff`
- `delete_staff`

**System Permissions:**

- `view_reports`
- `export_data`
- `manage_settings`

### Password Management

- Same requirements as auth-farmer
- Secure password reset flow
- 1-hour reset token expiry

### Profile Management

- View staff profile
- Update profile information
- Role and permission updates (admin only)

### Security Features

- Bcrypt password hashing (12 salt rounds)
- JWT authentication (24-hour tokens)
- Separate token type (`dtam_staff`)
- Account status management (ACTIVE, SUSPENDED, INACTIVE)
- Failed login attempt tracking
- Permission-based route protection

## API Endpoints

### Public Endpoints

#### 1. Login DTAM Staff

```http
POST /api/auth/dtam/login
Content-Type: application/json

{
  "email": "admin@dtam.go.th",
  "password": "SecurePass123"
}

Response 200:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "staff": {
      "id": "507f1f77bcf86cd799439011",
      "email": "admin@dtam.go.th",
      "firstName": "สมชาย",
      "lastName": "ผู้จัดการ",
      "employeeId": "DTAM001",
      "department": "Cannabis Regulation",
      "position": "Director",
      "role": "ADMIN",
      "permissions": ["view_applications", "review_applications", ...],
      "status": "ACTIVE"
    }
  }
}
```

#### 2. Request Password Reset

```http
POST /api/auth/dtam/request-password-reset
Content-Type: application/json

{
  "email": "admin@dtam.go.th"
}

Response 200:
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

#### 3. Reset Password

```http
POST /api/auth/dtam/reset-password
Content-Type: application/json

{
  "token": "reset-token-here",
  "newPassword": "NewSecurePass123"
}

Response 200:
{
  "success": true,
  "message": "Password reset successful. You can now login with your new password."
}
```

### Protected Endpoints (Requires DTAM Authentication)

#### 4. Get Profile

```http
GET /api/auth/dtam/profile
Authorization: Bearer <dtam_token>

Response 200:
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "admin@dtam.go.th",
    "firstName": "สมชาย",
    "lastName": "ผู้จัดการ",
    "fullName": "สมชาย ผู้จัดการ",
    "employeeId": "DTAM001",
    "department": "Cannabis Regulation",
    "position": "Director",
    "role": "ADMIN",
    "permissions": [...],
    "phoneNumber": "0812345678",
    "status": "ACTIVE",
    "isEmailVerified": true,
    "lastLoginAt": "2025-10-13T10:30:00.000Z",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-10-13T10:30:00.000Z"
  }
}
```

#### 5. Update Profile

```http
PUT /api/auth/dtam/profile
Authorization: Bearer <dtam_token>
Content-Type: application/json

{
  "firstName": "สมชาย",
  "lastName": "ผู้จัดการ",
  "phoneNumber": "0812345678",
  "department": "Cannabis Regulation",
  "position": "Senior Director"
}

Response 200:
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { ... }
}
```

#### 6. List Staff (Requires `view_staff` permission)

```http
GET /api/auth/dtam/staff?role=ADMIN&page=1&limit=20
Authorization: Bearer <dtam_token>

Response 200:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "...",
        "email": "admin@dtam.go.th",
        "firstName": "สมชาย",
        "lastName": "ผู้จัดการ",
        "fullName": "สมชาย ผู้จัดการ",
        "employeeId": "DTAM001",
        "department": "Cannabis Regulation",
        "position": "Director",
        "role": "ADMIN",
        "status": "ACTIVE"
      }
    ],
    "total": 15,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

#### 7. Create Staff (Requires `create_staff` permission)

```http
POST /api/auth/dtam/staff
Authorization: Bearer <dtam_token>
Content-Type: application/json

{
  "email": "reviewer@dtam.go.th",
  "password": "SecurePass123",
  "firstName": "สมหญิง",
  "lastName": "ผู้ตรวจ",
  "employeeId": "DTAM005",
  "department": "Cannabis Regulation",
  "position": "Reviewer",
  "role": "REVIEWER",
  "phoneNumber": "0823456789"
}

Response 201:
{
  "success": true,
  "message": "DTAM staff created successfully",
  "data": {
    "staffId": "507f1f77bcf86cd799439012",
    "email": "reviewer@dtam.go.th",
    "role": "REVIEWER"
  }
}
```

#### 8. Update Staff Role (Requires `update_staff` permission)

```http
PUT /api/auth/dtam/staff/:id/role
Authorization: Bearer <dtam_token>
Content-Type: application/json

{
  "role": "MANAGER",
  "permissions": ["view_applications", "review_applications", ...]
}

Response 200:
{
  "success": true,
  "message": "Staff role updated successfully",
  "data": { ... }
}
```

## Integration Guide

### 1. Add to Express App

```javascript
const express = require('express');
const mongoose = require('mongoose');
const createAuthDTAMModule = require('./modules/auth-dtam/module.container');

const app = express();
app.use(express.json());

// Create auth DTAM module
const authDTAMModule = createAuthDTAMModule({
  database: mongoose.connection,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: '24h',
  bcryptSaltRounds: 12,
});

// Mount router
app.use('/api/auth/dtam', authDTAMModule.router);

app.listen(3000);
```

### 2. Authentication Middleware

Update `middleware/auth.js`:

```javascript
const JWTService = require('./modules/auth-farmer/infrastructure/security/JWTService');

const jwtService = new JWTService(process.env.JWT_SECRET);

// Authenticate DTAM staff
exports.authenticateDTAMStaff = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const payload = jwtService.verify(token);

    if (payload.type !== 'dtam_staff') {
      return res.status(403).json({
        success: false,
        message: 'Invalid user type',
      });
    }

    req.staff = payload;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

// Check permission
exports.requirePermission = permission => {
  return (req, res, next) => {
    if (!req.staff) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!req.staff.permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: `Permission denied. Required: ${permission}`,
      });
    }

    next();
  };
};

// Check role
exports.requireRole = role => {
  return (req, res, next) => {
    if (!req.staff) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (req.staff.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${role}`,
      });
    }

    next();
  };
};
```

### 3. Seed Initial Admin

Create `scripts/seed-dtam-admin.js`:

```javascript
const mongoose = require('mongoose');
const createAuthDTAMModule = require('../modules/auth-dtam/module.container');

async function seedAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);

  const authDTAMModule = createAuthDTAMModule({
    database: mongoose.connection,
    jwtSecret: process.env.JWT_SECRET,
  });

  const createStaffUseCase = authDTAMModule.services.createStaffUseCase;

  await createStaffUseCase.execute({
    email: 'admin@dtam.go.th',
    password: 'Admin123!@#',
    firstName: 'System',
    lastName: 'Administrator',
    employeeId: 'DTAM001',
    department: 'Administration',
    position: 'System Administrator',
    role: 'ADMIN',
    createdBy: 'SYSTEM',
  });

  console.log('✅ Admin staff created successfully');
  await mongoose.disconnect();
}

seedAdmin().catch(console.error);
```

## Database Schema

### Collection: `dtam_staff`

```javascript
{
  email: String (unique, indexed),
  password: String (hashed),
  firstName: String,
  lastName: String,
  employeeId: String (unique, indexed),
  department: String,
  position: String,
  role: String (ADMIN, MANAGER, REVIEWER, AUDITOR) (indexed),
  permissions: [String],
  phoneNumber: String,
  status: String (ACTIVE, SUSPENDED, INACTIVE) (indexed),
  isEmailVerified: Boolean (default: false),
  emailVerificationToken: String,
  emailVerifiedAt: Date,
  passwordResetToken: String (indexed),
  passwordResetTokenExpiresAt: Date,
  failedLoginAttempts: Number,
  lastFailedLoginAt: Date,
  accountLockedUntil: Date,
  lastLoginAt: Date,
  lastLoginIp: String,
  lastLoginUserAgent: String,
  createdBy: String,
  updatedBy: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

- `email` (unique)
- `employeeId` (unique)
- `role` (single)
- `status` (single)
- `department` (single)
- `passwordResetToken` (single)
- `email + status` (compound)
- `role + status` (compound)
- `createdAt` (descending)

## Security Considerations

1. **No Self-Registration**
   - Only admins can create staff accounts
   - Prevents unauthorized access

2. **Role-Based Access Control**
   - 4 distinct roles with specific permissions
   - Permission checking on all protected routes
   - Principle of least privilege

3. **Separate Authentication**
   - Different JWT token type (`dtam_staff` vs `farmer`)
   - Cannot use farmer token for staff endpoints
   - Clear separation of concerns

4. **Account Protection**
   - Same as auth-farmer module
   - Account locking, password policies, etc.

5. **Audit Trail**
   - Track who created/updated staff
   - Login history
   - Role/permission changes

## Testing

### Unit Tests (Coming Soon)

```bash
npm test modules/auth-dtam
```

### Integration Tests (Coming Soon)

```bash
npm run test:integration
```

## Dependencies

Same as auth-farmer module:

- bcryptjs
- jsonwebtoken
- mongoose
- express
- express-validator

## Future Enhancements

- [ ] Multi-factor authentication (2FA)
- [ ] Session management
- [ ] Advanced audit logging
- [ ] Role hierarchy
- [ ] Custom permission sets
- [ ] Department-based access control
- [ ] Activity dashboards
- [ ] Email notifications
- [ ] API rate limiting per role

---

**Module Version:** 1.0.0  
**Clean Architecture Implementation:** Phase 1.3  
**Status:** ✅ Complete
