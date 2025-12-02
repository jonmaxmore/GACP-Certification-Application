# Clean Architecture Authentication Integration Guide

## Overview

This guide explains how to integrate the Clean Architecture authentication system into the GACP Certification Platform. The system supports two separate authentication types:

1. **Farmer Authentication** - Public users (farmers) registration and login
2. **DTAM Staff Authentication** - Internal staff with role-based access control (RBAC)

## Table of Contents

- [Quick Start](#quick-start)
- [Authentication Types](#authentication-types)
- [Middleware Usage](#middleware-usage)
- [Integration Steps](#integration-steps)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Security Considerations](#security-considerations)

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create or update `.env` file:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/gacp_certification

# JWT Configuration
JWT_SECRET=your-very-secure-secret-key-change-in-production
JWT_EXPIRES_IN=24h

# Bcrypt Salt Rounds
BCRYPT_SALT_ROUNDS=12
```

### 3. Seed Initial DTAM Admin

```bash
node scripts/seed-dtam-admin.js
```

Default admin credentials:

- **Email**: `admin@dtam.go.th`
- **Password**: `Admin@2025`
- **Role**: ADMIN (all 17 permissions)

⚠️ **Change password after first login!**

### 4. Run Integration Tests

```bash
# Start the server
npm run dev

# In another terminal, run tests
node tests/integration/test-auth-clean.js
```

---

## Authentication Types

### Farmer Authentication

**Purpose**: Public users (farmers) who apply for GACP certification

**Features**:

- Self-registration
- Email/password login
- Profile management
- Application submission
- Certificate viewing

**JWT Token Type**: `farmer`

**Token Payload**:

```json
{
  "userId": "user-id-here",
  "email": "farmer@example.com",
  "type": "farmer",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### DTAM Staff Authentication

**Purpose**: Internal staff who review/approve applications

**Features**:

- Admin-only staff creation (NO self-registration)
- Email/password login
- Role-based access control (4 roles)
- Permission-based access control (17 permissions)
- Staff management

**JWT Token Type**: `dtam_staff`

**Token Payload**:

```json
{
  "staffId": "staff-id-here",
  "email": "staff@dtam.go.th",
  "type": "dtam_staff",
  "role": "ADMIN",
  "permissions": ["view_applications", "approve_applications", ...],
  "iat": 1234567890,
  "exp": 1234567890
}
```

**Roles & Permissions**:

| Role         | Permissions    | Description             |
| ------------ | -------------- | ----------------------- |
| **ADMIN**    | 17 permissions | Full system access      |
| **MANAGER**  | 11 permissions | Management and approval |
| **REVIEWER** | 5 permissions  | Review applications     |
| **AUDITOR**  | 5 permissions  | Audit and reports       |

**All 17 Permissions**:

- Applications: `view_applications`, `review_applications`, `approve_applications`, `reject_applications`
- Certificates: `view_certificates`, `issue_certificates`, `revoke_certificates`
- Audits: `view_audits`, `create_audits`, `approve_audits`
- Staff: `view_staff`, `create_staff`, `update_staff`, `delete_staff`
- System: `view_reports`, `export_data`, `manage_settings`

---

## Middleware Usage

### Import Middleware

```javascript
const auth = require('./middleware/auth-clean');
```

### Farmer Authentication

```javascript
// Protect farmer endpoints
router.get('/profile', auth.authenticateFarmer, (req, res) => {
  // req.user contains: { userId, email, type: 'farmer' }
  res.json({ user: req.user });
});

// Update farmer profile
router.put('/profile', auth.authenticateFarmer, farmerController.updateProfile);
```

### DTAM Staff Authentication

```javascript
// Protect staff endpoints
router.get('/profile', auth.authenticateDTAMStaff, (req, res) => {
  // req.staff contains: { staffId, email, type: 'dtam_staff', role, permissions }
  res.json({ staff: req.staff });
});
```

### Permission-Based Access Control

```javascript
// Single permission
router.post(
  '/staff',
  auth.authenticateDTAMStaff,
  auth.requirePermission('create_staff'),
  staffController.createStaff
);

// Multiple permissions (ALL required)
router.put(
  '/certificate/:id/approve',
  auth.authenticateDTAMStaff,
  auth.requireAllPermissions(['view_certificates', 'issue_certificates']),
  certificateController.approveCertificate
);

// Any permission (at least ONE required)
router.get(
  '/reports',
  auth.authenticateDTAMStaff,
  auth.requireAnyPermission(['view_reports', 'export_data']),
  reportController.getReports
);
```

### Role-Based Access Control

```javascript
// Single role
router.delete(
  '/staff/:id',
  auth.authenticateDTAMStaff,
  auth.requireRole('ADMIN'),
  staffController.deleteStaff
);

// Multiple roles
router.get(
  '/applications',
  auth.authenticateDTAMStaff,
  auth.requireAnyRole(['ADMIN', 'MANAGER', 'REVIEWER']),
  applicationController.listApplications
);

// Admin shorthand
router.post(
  '/system/settings',
  auth.authenticateDTAMStaff,
  auth.requireAdmin,
  systemController.updateSettings
);
```

### Mixed Authentication

```javascript
// Accept both farmer and staff
router.get('/public-data', auth.authenticateAny, (req, res) => {
  if (req.user) {
    // Farmer authenticated
  } else if (req.staff) {
    // Staff authenticated
  }
});

// Optional authentication (show different data if authenticated)
router.get('/certificates', auth.optionalAuth, (req, res) => {
  if (req.user || req.staff) {
    // Show detailed view
  } else {
    // Show public view only
  }
});
```

---

## Integration Steps

### Step 1: Update app.js

```javascript
const express = require('express');
const mongoose = require('mongoose');
const app = express();

// Middleware
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Import Clean Architecture modules
const { router: farmerRouter } = require('./modules/auth-farmer/module.container')({
  database: mongoose.connection.db,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12')
});

const { router: dtamRouter } = require('./modules/auth-dtam/module.container')({
  database: mongoose.connection.db,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12')
});

// Mount routes
app.use('/api/farmers', farmerRouter);
app.use('/api/dtam', dtamRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    authentication: {
      farmer: 'enabled',
      dtam_staff: 'enabled'
    }
  });
});

// Start server
const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

### Step 2: Create Other Modules

When creating other modules (farm, audit, training, etc.), follow this pattern:

```javascript
// Example: Farm Management Module Routes
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth-clean');

// Farmer endpoints (authenticated)
router.get('/my-farms', auth.authenticateFarmer, farmController.getMyFarms);
router.post('/farms', auth.authenticateFarmer, farmController.createFarm);
router.put('/farms/:id', auth.authenticateFarmer, farmController.updateFarm);

// DTAM Staff endpoints (with permissions)
router.get(
  '/farms',
  auth.authenticateDTAMStaff,
  auth.requireAnyPermission(['view_applications', 'review_applications']),
  farmController.listAllFarms
);

router.put(
  '/farms/:id/verify',
  auth.authenticateDTAMStaff,
  auth.requirePermission('review_applications'),
  farmController.verifyFarm
);

module.exports = router;
```

### Step 3: Frontend Integration

**Farmer Login** (Public Portal):

```javascript
// Login
const response = await fetch('http://localhost:3004/api/farmers/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const data = await response.json();
if (data.success) {
  // Store token
  localStorage.setItem('farmerToken', data.token);
  localStorage.setItem('userType', 'farmer');
}

// Use token in subsequent requests
fetch('http://localhost:3004/api/farmers/profile', {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('farmerToken')}`
  }
});
```

**DTAM Staff Login** (Internal Portal):

```javascript
// Login
const response = await fetch('http://localhost:3004/api/dtam/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const data = await response.json();
if (data.success) {
  // Store token and metadata
  localStorage.setItem('dtamToken', data.token);
  localStorage.setItem('userType', 'dtam_staff');
  localStorage.setItem('role', data.staff.role);
  localStorage.setItem('permissions', JSON.stringify(data.staff.permissions));
}

// Use token in subsequent requests
fetch('http://localhost:3004/api/dtam/profile', {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('dtamToken')}`
  }
});

// Check permissions in frontend
const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
if (permissions.includes('create_staff')) {
  // Show "Create Staff" button
}
```

---

## API Endpoints

### Farmer Endpoints (`/api/farmers`)

| Method | Endpoint                  | Auth   | Description               |
| ------ | ------------------------- | ------ | ------------------------- |
| POST   | `/register`               | No     | Register new farmer       |
| POST   | `/login`                  | No     | Login farmer              |
| GET    | `/profile`                | Farmer | Get farmer profile        |
| PUT    | `/profile`                | Farmer | Update farmer profile     |
| POST   | `/request-password-reset` | No     | Request password reset    |
| POST   | `/reset-password`         | No     | Reset password with token |

### DTAM Staff Endpoints (`/api/dtam`)

| Method | Endpoint                  | Auth  | Permission     | Description               |
| ------ | ------------------------- | ----- | -------------- | ------------------------- |
| POST   | `/login`                  | No    | -              | Login DTAM staff          |
| GET    | `/profile`                | Staff | -              | Get staff profile         |
| PUT    | `/profile`                | Staff | -              | Update staff profile      |
| POST   | `/request-password-reset` | No    | -              | Request password reset    |
| POST   | `/reset-password`         | No    | -              | Reset password with token |
| GET    | `/staff`                  | Staff | `view_staff`   | List all staff            |
| POST   | `/staff`                  | Staff | `create_staff` | Create new staff          |
| PUT    | `/staff/:id/role`         | Staff | `update_staff` | Update staff role         |

---

## Testing

### Manual Testing

1. **Start Server**:

   ```bash
   npm run dev
   ```

2. **Test Farmer Flow**:

   ```bash
   # Register
   curl -X POST http://localhost:3004/api/farmers/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"Test@123","firstName":"John","lastName":"Doe","phoneNumber":"0812345678","address":"123 Test St"}'

   # Login
   curl -X POST http://localhost:3004/api/farmers/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"Test@123"}'

   # Get Profile (use token from login)
   curl http://localhost:3004/api/farmers/profile \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

3. **Test DTAM Flow**:

   ```bash
   # Login as admin
   curl -X POST http://localhost:3004/api/dtam/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@dtam.go.th","password":"Admin@2025"}'

   # Get Profile
   curl http://localhost:3004/api/dtam/profile \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

   # Create Staff
   curl -X POST http://localhost:3004/api/dtam/staff \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     -d '{"email":"reviewer@dtam.go.th","password":"Test@123","firstName":"Jane","lastName":"Smith","employeeId":"EMP001","role":"REVIEWER","department":"QA","position":"Senior Reviewer","phoneNumber":"0823456789"}'
   ```

### Automated Testing

```bash
# Run integration tests
node tests/integration/test-auth-clean.js
```

Expected output:

```
═══════════════════════════════════════════════════════════════
  CLEAN ARCHITECTURE AUTHENTICATION TEST SUITE
═══════════════════════════════════════════════════════════════

FARMER AUTHENTICATION
  ✅ Farmer Registration
  ✅ Farmer Login
  ✅ Farmer Profile Access

DTAM STAFF AUTHENTICATION
  ✅ DTAM Admin Login
  ✅ DTAM Staff Creation
  ✅ DTAM Staff Login
  ✅ DTAM Staff Profile Access

SECURITY & PERMISSIONS
  ✅ Token Separation
  ✅ Permission Check
  ✅ List Staff (with permission)

TEST SUMMARY
  Total Tests: 10
  Passed: 10
  Failed: 0
  Success Rate: 100.00%

🎉 ALL TESTS PASSED! 🎉
```

---

## Security Considerations

### 1. Token Separation

✅ **Implemented**: Farmer tokens (`type: 'farmer'`) cannot access DTAM endpoints and vice versa

```javascript
// Farmer token rejected at DTAM endpoint
GET /api/dtam/profile
Authorization: Bearer <farmer-token>
Response: 403 Forbidden
```

### 2. No Self-Registration for DTAM Staff

✅ **Implemented**: Only ADMINs can create staff accounts

```javascript
// Requires ADMIN authentication and 'create_staff' permission
POST / api / dtam / staff;
```

### 3. Permission-Based Access Control

✅ **Implemented**: Routes protected by specific permissions

```javascript
// REVIEWER cannot create staff (missing 'create_staff' permission)
POST /api/dtam/staff
Authorization: Bearer <reviewer-token>
Response: 403 Permission denied
```

### 4. Password Security

✅ **Implemented**:

- Minimum 8 characters
- Must contain: uppercase, lowercase, number
- Hashed with bcrypt (12 salt rounds)
- Password reset with expiring tokens (60 minutes)

### 5. Account Locking

✅ **Implemented**:

- Lock after 5 failed login attempts
- Locked for 30 minutes
- Unlock on successful password reset

### 6. JWT Security

✅ **Implemented**:

- Secret key from environment variable
- Expiration time configurable
- Token verification on every request
- Payload includes user type for separation

### Best Practices

1. **Never commit JWT secret** - Use environment variables
2. **Change default admin password** - After first login
3. **Use HTTPS in production** - Prevent token interception
4. **Rotate JWT secrets periodically** - Security hygiene
5. **Monitor failed login attempts** - Detect brute force attacks
6. **Audit permission changes** - Track who changes what
7. **Regular security audits** - Review access logs

---

## Troubleshooting

### Issue: "Invalid or expired token"

**Cause**: Token expired or invalid

**Solution**:

- Login again to get new token
- Check JWT_EXPIRES_IN configuration
- Verify JWT_SECRET matches

### Issue: "Permission denied"

**Cause**: User doesn't have required permission

**Solution**:

- Check user's role and permissions
- Update user role if needed:
  ```bash
  curl -X PUT http://localhost:3004/api/dtam/staff/:id/role \
    -H "Authorization: Bearer <admin-token>" \
    -d '{"role":"MANAGER"}'
  ```

### Issue: "DTAM staff authentication required"

**Cause**: Using farmer token for staff endpoint

**Solution**:

- Login with DTAM staff credentials
- Use correct API endpoint (`/api/dtam` not `/api/farmers`)

### Issue: "Admin not found" during seed

**Cause**: Database not connected

**Solution**:

1. Start MongoDB: `mongod`
2. Check MONGODB_URI in `.env`
3. Run seed again: `node scripts/seed-dtam-admin.js`

---

## Next Steps

1. ✅ **Complete remaining modules** (Phase 1.4-1.8):
   - farm-management
   - cannabis-survey
   - audit
   - training
   - notification
   - document
   - report
   - dashboard

2. **Integrate with frontend**:
   - Update farmer portal to use Clean Architecture APIs
   - Update DTAM portal to use Clean Architecture APIs

3. **Testing & Documentation**:
   - Write unit tests for all modules
   - Create OpenAPI/Swagger documentation
   - PDPA compliance documentation

4. **Production deployment**:
   - Setup CI/CD pipeline
   - Configure production environment
   - Security hardening
   - Performance optimization

---

## References

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

**Document Version**: 1.0  
**Last Updated**: October 13, 2025  
**Author**: GitHub Copilot (System Architect)
