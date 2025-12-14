# Auth Farmer Module - Clean Architecture

## Overview

Authentication and user management system for farmers in the GACP platform. Built with Clean Architecture principles, separating business logic from technical implementation.

## Architecture

```
auth-farmer/
├── domain/                    # Business logic (pure)
│   ├── entities/
│   │   └── User.js           # User entity with business rules
│   ├── value-objects/
│   │   ├── Email.js          # Email validation
│   │   └── Password.js       # Password strength validation
│   ├── events/
│   │   ├── UserRegistered.js
│   │   ├── UserLoggedIn.js
│   │   └── PasswordResetRequested.js
│   └── interfaces/
│       └── IUserRepository.js # Repository contract
│
├── application/               # Business orchestration
│   └── use-cases/
│       ├── RegisterUserUseCase.js
│       ├── LoginUserUseCase.js
│       ├── VerifyEmailUseCase.js
│       ├── RequestPasswordResetUseCase.js
│       ├── ResetPasswordUseCase.js
│       ├── GetUserProfileUseCase.js
│       └── UpdateUserProfileUseCase.js
│
├── infrastructure/            # Technical implementations
│   ├── database/
│   │   └── MongoDBUserRepository.js
│   └── security/
│       ├── BcryptPasswordHasher.js
│       └── JWTService.js
│
├── presentation/              # HTTP/API layer
│   ├── controllers/
│   │   └── AuthController.js
│   ├── routes/
│   │   └── auth.routes.js
│   ├── validators/
│   │   └── auth.validator.js
│   └── dto/
│       └── AuthDTO.js
│
└── module.container.js        # Dependency injection
```

## Features

### User Registration

- Email and password authentication
- ID card validation (13 digits)
- Thai address (province, district, sub-district)
- Farm information
- Email verification required

### User Login

- Email and password validation
- Account locking after 5 failed attempts (30 minutes)
- JWT token generation
- Login tracking (IP, user agent)

### Password Management

- Password strength requirements:
  - Min 8 characters, max 128
  - At least one lowercase letter
  - At least one uppercase letter
  - At least one number
- Secure password reset flow with tokens
- 1-hour reset token expiry

### Profile Management

- View user profile
- Update profile information
- Farm details management

### Security Features

- Bcrypt password hashing (12 salt rounds)
- JWT authentication (24-hour tokens)
- Account status management (pending, active, suspended, inactive)
- Email verification
- Failed login attempt tracking
- Timing attack prevention on password reset

## API Endpoints

### Public Endpoints

#### 1. Register Farmer

```http
POST /api/auth/farmer/register
Content-Type: application/json

{
  "email": "farmer@example.com",
  "password": "SecurePass123",
  "firstName": "สมชาย",
  "lastName": "ใจดี",
  "phoneNumber": "0812345678",
  "idCard": "1234567890123",
  "farmName": "สวนสมชาย",
  "province": "เชียงใหม่",
  "district": "เมือง",
  "subDistrict": "ช้างเผือก"
}

Response 201:
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "farmer@example.com",
    "verificationToken": "abc123..."
  }
}
```

#### 2. Login Farmer

```http
POST /api/auth/farmer/login
Content-Type: application/json

{
  "email": "farmer@example.com",
  "password": "SecurePass123"
}

Response 200:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "farmer@example.com",
      "firstName": "สมชาย",
      "lastName": "ใจดี",
      "farmName": "สวนสมชาย",
      "status": "ACTIVE"
    }
  }
}
```

#### 3. Verify Email

```http
GET /api/auth/farmer/verify-email/:token

Response 200:
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "farmer@example.com"
  }
}
```

#### 4. Request Password Reset

```http
POST /api/auth/farmer/request-password-reset
Content-Type: application/json

{
  "email": "farmer@example.com"
}

Response 200:
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

#### 5. Reset Password

```http
POST /api/auth/farmer/reset-password
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

### Protected Endpoints (Requires Authentication)

#### 6. Get Profile

```http
GET /api/auth/farmer/profile
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "farmer@example.com",
    "firstName": "สมชาย",
    "lastName": "ใจดี",
    "phoneNumber": "0812345678",
    "farmName": "สวนสมชาย",
    "farmSize": 10.5,
    "farmingExperience": 5,
    "province": "เชียงใหม่",
    "district": "เมือง",
    "subDistrict": "ช้างเผือก",
    "postalCode": "50000",
    "status": "ACTIVE",
    "isEmailVerified": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### 7. Update Profile

```http
PUT /api/auth/farmer/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "สมชาย",
  "lastName": "ใจดี",
  "phoneNumber": "0812345678",
  "farmName": "สวนสมชายใหม่",
  "farmSize": 15.5,
  "farmingExperience": 6,
  "province": "เชียงใหม่",
  "district": "เมือง",
  "subDistrict": "ช้างเผือก",
  "postalCode": "50000",
  "address": "123 หมู่ 5"
}

Response 200:
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { ... }
}
```

## Integration Guide

### 1. Add to Express App

```javascript
const express = require('express');
const mongoose = require('mongoose');
const createAuthFarmerModule = require('./modules/auth-farmer/module.container');

const app = express();

// Middleware
app.use(express.json());

// Create auth farmer module
const authFarmerModule = createAuthFarmerModule({
  database: mongoose.connection,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: '24h',
  bcryptSaltRounds: 12,
});

// Mount router
app.use('/api/auth/farmer', authFarmerModule.router);

// Start server
app.listen(3000);
```

### 2. Environment Variables

```env
JWT_SECRET=your-super-secret-jwt-key-here
MONGODB_URI=mongodb://localhost:27017/gacp
```

### 3. Authentication Middleware

Create `middleware/auth.js`:

```javascript
const JWTService = require('./modules/auth-farmer/infrastructure/security/JWTService');

const jwtService = new JWTService(process.env.JWT_SECRET);

exports.authenticateFarmer = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const payload = jwtService.verify(token);

    if (payload.type !== 'farmer') {
      return res.status(403).json({
        success: false,
        message: 'Invalid user type',
      });
    }

    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};
```

## Database Schema

### User Collection: `users_farmer`

```javascript
{
  email: String (unique, indexed),
  password: String (hashed),
  firstName: String,
  lastName: String,
  phoneNumber: String,
  idCard: String (unique, indexed),
  farmName: String,
  farmSize: Number,
  farmingExperience: Number,
  province: String,
  district: String,
  subDistrict: String,
  postalCode: String,
  address: String,
  status: String (PENDING_VERIFICATION, ACTIVE, SUSPENDED, INACTIVE),
  isEmailVerified: Boolean,
  emailVerificationToken: String,
  emailVerifiedAt: Date,
  passwordResetToken: String,
  passwordResetTokenExpiresAt: Date,
  failedLoginAttempts: Number,
  lastFailedLoginAt: Date,
  accountLockedUntil: Date,
  lastLoginAt: Date,
  lastLoginIp: String,
  lastLoginUserAgent: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

- `email` (unique)
- `idCard` (unique)
- `status`
- `createdAt`
- `email + status` (compound)
- `isEmailVerified + status` (compound)

## Dependencies

```json
{
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "mongoose": "^8.0.0",
  "express": "^4.18.2",
  "express-validator": "^7.0.1"
}
```

## Testing

### Unit Tests (Coming Soon)

```bash
npm test modules/auth-farmer
```

### Integration Tests (Coming Soon)

```bash
npm run test:integration
```

## Error Handling

### Common Error Responses

#### 400 Bad Request

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email must be valid"
    }
  ]
}
```

#### 401 Unauthorized

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

#### 403 Forbidden

```json
{
  "success": false,
  "message": "Account is locked. Try again in 30 minutes."
}
```

#### 409 Conflict

```json
{
  "success": false,
  "message": "Email already exists"
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Registration failed. Please try again."
}
```

## Security Considerations

1. **Password Security**
   - Bcrypt with 12 salt rounds
   - Password strength requirements enforced
   - Never log plain text passwords

2. **JWT Tokens**
   - 24-hour expiration
   - Signed with secret key
   - Include minimal user information

3. **Account Protection**
   - Lock after 5 failed login attempts
   - 30-minute lockout period
   - Email verification required

4. **Email Enumeration Prevention**
   - Always return success on password reset requests
   - Consistent response times

5. **Input Validation**
   - Express-validator on all endpoints
   - Sanitize and normalize inputs
   - Type checking and length limits

## Domain Events

The module publishes the following domain events:

1. **UserRegistered** - When a new user registers
2. **UserLoggedIn** - When a user logs in successfully
3. **PasswordResetRequested** - When password reset is requested

These events can be used to trigger:

- Email notifications
- Activity logging
- Analytics
- Third-party integrations

## Future Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] Social login (Google, Facebook)
- [ ] Password history tracking
- [ ] Session management
- [ ] Rate limiting
- [ ] CAPTCHA integration
- [ ] Email templates
- [ ] SMS notifications
- [ ] Audit log
- [ ] Admin user management API

## Support

For issues or questions, please refer to the main GACP documentation or contact the development team.

---

**Module Version:** 1.0.0  
**Clean Architecture Implementation:** Phase 1.2  
**Status:** ✅ Complete
