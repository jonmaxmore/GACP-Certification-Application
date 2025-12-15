# 🗄️ GACP Platform - Database Layer

Complete MongoDB database implementation with Mongoose ODM for GACP Platform Phase 1.

## 📋 Overview

**Technology Stack:**

- **Database:** MongoDB Atlas 7.x
- **ODM:** Mongoose v8.x
- **Migration Tool:** Custom migration runner
- **Validation:** JSON Schema + Mongoose validation
- **Security:** Field-level encryption ready, RBAC, hash chain audit

## 📁 Directory Structure

```
database/
├── models/                      # Mongoose schemas
│   ├── User.model.js           # User authentication & profile
│   ├── Application.model.js    # GACP certification applications (12-state FSM)
│   ├── Invoice.model.js        # Payment invoices (NO REFUNDS)
│   ├── Certificate.model.js    # GACP certificates (PDF/A, digital signature)
│   └── AuditLog.model.js       # Immutable audit trail (hash chain)
│
├── migrations/                  # Database migrations
│   ├── 001_initial_schema.js   # Create all collections
│   ├── 002_create_indexes.js   # Create 60+ performance indexes
│   └── 003_seed_data.js        # Seed test users & data
│
├── migrate.js                   # Migration runner script
└── README.md                    # This file
```

## 🎯 Collections

### Core Collections (5)

1. **users** - User authentication & profile management
   - Thai ID validation (Mod 11 algorithm)
   - RBAC permissions (FARMER, DTAM, ADMIN)
   - Login history tracking
   - Account locking after 5 failed attempts

2. **applications** - GACP certification applications
   - 12-state FSM workflow
   - Geospatial indexing (GPS coordinates)
   - State history tracking
   - DTAM review embedded data

3. **invoices** - Payment invoices
   - Phase 1: ฿5,000 | Phase 2: ฿25,000
   - NO REFUNDS policy (no refund status)
   - PromptPay QR code support
   - Thai tax receipt generation

4. **certificates** - GACP certificates
   - PDF/A-1b format (ISO 19005-1)
   - RSA-2048 digital signature
   - QR code public verification
   - 3-year validity period

5. **audit_logs** - Immutable audit trail
   - Blockchain-inspired hash chain (SHA-256)
   - Time-series optimized (MongoDB 5.0+)
   - 7-year retention (Thai tax law)
   - Security event tracking

### Supporting Collections (3)

6. **refresh_tokens** - JWT refresh token management
7. **application_documents** - Document metadata (files in S3)
8. **payments** - Payment transaction records

## 🚀 Quick Start

### 1. Environment Setup

Create `.env` file:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/gacp_development
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gacp_production

# Environment
NODE_ENV=development
```

### 2. Install Dependencies

```bash
npm install mongoose bcrypt
```

### 3. Run Migrations

```bash
# Run all migrations (create collections + indexes + seed data)
node database/migrate.js up

# Rollback last migration
node database/migrate.js down

# Rollback all migrations (⚠️ DELETES ALL DATA)
node database/migrate.js down-all
```

### 4. Use Models in Your Code

```javascript
const User = require('./database/models/User.model');
const Application = require('./database/models/Application.model');

// Example: Create user
const user = await User.create({
  userId: await User.generateUserId(),
  email: 'farmer@example.com',
  passwordHash: await bcrypt.hash('password', 12),
  fullName: 'John Farmer',
  role: 'FARMER',
  permissions: ['application:create', 'application:read:own']
});

// Example: Find user's applications
const applications = await Application.find({
  userId: user.userId,
  isActive: true
}).sort({ createdAt: -1 });
```

## 📊 Database Features

### 1. Indexing Strategy (60+ indexes)

**Single Field Indexes:**

- Unique indexes: userId, email, applicationNumber, certificateNumber
- Query indexes: role, status, state, timestamp

**Compound Indexes (ESR Rule):**

- `{ userId: 1, state: 1, createdAt: -1 }` - User's applications by state
- `{ state: 1, submittedAt: -1 }` - DTAM queue (FIFO)
- `{ status: 1, expiresAt: 1 }` - Expiring items

**Specialized Indexes:**

- **Geospatial (2dsphere):** Farm GPS coordinates
- **Text Search:** Full-text search on farm names, addresses
- **TTL Indexes:** Auto-delete expired tokens/documents
- **Partial Indexes:** Index only active records (storage optimization)

### 2. Validation Rules

**Schema Validation (MongoDB):**

- JSON Schema validators on all collections
- Pattern matching: userId, email, Thai ID, phone numbers
- Enum validation: status, roles, states
- Range validation: farmSize (0.1-10000), amounts (>0)

**Application Validation (Mongoose):**

- Thai ID: Mod 11 algorithm validation
- GPS Coordinates: Thailand bounds check
- Email: RFC 5322 pattern matching
- Phone: Thai format validation (0XXXXXXXXX)

### 3. Data Relationships

```
User (1) ──────► (many) Applications
Application (1) ─► (many) Documents
Application (1) ─► (many) Invoices
Application (1) ─► (1) Certificate
Invoice (1) ────► (many) Payments
All ────────────► (many) AuditLogs
```

**Design Decisions:**

- **Embedded:** State history, DTAM review, farm address (1:few)
- **Referenced:** Documents, payments, certificates (1:many or unbounded)
- **Denormalized:** farmerName, farmerEmail (query performance)

### 4. State Machine (12 States)

```
DRAFT
  └→ SUBMITTED
       └→ UNDER_REVIEW
            ├→ PAYMENT_PENDING
            │    └→ PAYMENT_VERIFIED
            │         └→ INSPECTION_SCHEDULED
            │              └→ INSPECTION_COMPLETED
            │                   └→ PHASE2_PAYMENT_PENDING
            │                        └→ PHASE2_PAYMENT_VERIFIED
            │                             └→ APPROVED
            │                                  └→ CERTIFICATE_ISSUED ✓
            ├→ REVISION_REQUIRED → (back to SUBMITTED or EXPIRED)
            └→ REJECTED ✗

Terminal States: CERTIFICATE_ISSUED, REJECTED, EXPIRED
```

### 5. Security Features

**Authentication & Authorization:**

- Bcrypt password hashing (cost factor 12)
- JWT refresh token rotation
- Rate limiting (account lock after 5 failed attempts)
- RBAC permissions system
- 2FA ready (infrastructure in place)

**Data Protection:**

- Field-level encryption ready (sensitive fields marked)
- Audit trail for all actions (immutable)
- Hash chain integrity verification
- GDPR compliance (anonymization method)

**Audit Trail:**

- Blockchain-inspired hash chain
- Immutable logs (prevents tampering)
- 7-year retention (Thai legal requirement)
- Security event tracking

## 🧪 Testing

### Test Users (After Seed Data)

```
Admin:
  Email: admin@gacp.platform
  Password: Admin@GACP2025
  Role: ADMIN

DTAM Reviewer:
  Email: dtam.reviewer1@gacp.platform
  Password: DTAM@GACP2025
  Role: DTAM

Farmer:
  Email: farmer1@example.com
  Password: Farmer@123
  Role: FARMER
```

### Manual Testing

```javascript
// Connect to MongoDB
const mongoose = require('mongoose');
await mongoose.connect(process.env.MONGODB_URI);

// Test user authentication
const User = require('./database/models/User.model');
const user = await User.findOne({ email: 'farmer1@example.com' });
console.log(user.canLogin); // Should be true

// Test Thai ID validation
console.log(User.validateThaiId('1234567890123')); // false (invalid)

// Test application state machine
const Application = require('./database/models/Application.model');
const app = new Application({
  /* ... */
});
console.log(app.isValidTransition('SUBMITTED')); // true (from DRAFT)

// Test audit log hash chain
const AuditLog = require('./database/models/AuditLog.model');
const integrity = await AuditLog.verifyChainIntegrity(
  new Date('2025-10-01'),
  new Date('2025-10-31')
);
console.log(integrity.intact); // Should be true
```

## 📈 Performance Optimization

### Query Performance

**Best Practices Applied:**

1. **ESR Rule (Equality, Sort, Range):**
   - Compound indexes match query patterns
   - Most selective fields first
   - Sort and range fields last

2. **Index Selectivity:**
   - High selectivity: email, userId (unique)
   - Medium selectivity: state, status (enum)
   - Low selectivity: boolean fields (not indexed)

3. **Partial Indexes:**
   - Index only active records
   - Reduce index size by 50-70%
   - Faster index updates

4. **Geospatial Queries:**
   - 2dsphere index for GPS coordinates
   - $near queries for location-based search
   - Thailand bounds validation

### Connection Pooling

```javascript
mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 100, // Max connections
  minPoolSize: 10, // Min connections maintained
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000,
  retryWrites: true,
  retryReads: true,
  readPreference: 'secondaryPreferred' // Read from replicas
});
```

### Monitoring Queries

```javascript
// Enable query logging (development only)
mongoose.set('debug', true);

// Get slow queries
db.audit_logs
  .find({
    /* ... */
  })
  .explain('executionStats');
```

## 🔧 Maintenance

### Daily Tasks

```bash
# Check slow queries
mongosh --eval "db.currentOp({ secs_running: { \$gte: 1 } })"

# Check index usage
mongosh --eval "db.applications.aggregate([{ \$indexStats: {} }])"
```

### Weekly Tasks

```bash
# Database statistics
mongosh --eval "db.stats()"

# Collection statistics
mongosh --eval "db.applications.stats()"

# Index sizes
mongosh --eval "db.applications.totalIndexSize()"
```

### Monthly Tasks

```bash
# Optimize indexes (analyze usage, remove unused)
# Archive old audit logs to S3
# Review and update schema validation rules
# Performance benchmarking
```

## 📚 API Reference

### User Model

```javascript
// Static methods
User.generateUserId(); // Generate unique user ID
User.validateThaiId(thaiId); // Validate Thai ID (Mod 11)
User.findActiveByRole(role); // Find active users by role

// Instance methods
user.recordLogin(ip, userAgent, success); // Record login attempt
user.unlockAccount(); // Unlock locked account
user.hasPermission(permission); // Check permission
user.anonymize(); // GDPR anonymization
```

### Application Model

```javascript
// Static methods
Application.generateApplicationId(); // Generate unique ID
Application.generateApplicationNumber(); // Generate sequential number
Application.findDTAMQueue(); // Get pending reviews (FIFO)
Application.findNearLocation(lon, lat, km); // Geospatial search

// Instance methods
app.transitionTo(state, actor, role, notes); // State transition
app.isValidTransition(targetState); // Validate transition
app.assignReviewer(reviewerId, name); // Assign DTAM reviewer
app.calculateProgress(); // Progress percentage (0-100)
```

### Invoice Model

```javascript
// Static methods
Invoice.createPhase1Invoice(appId, userId); // Create ฿5,000 invoice
Invoice.createPhase2Invoice(appId, userId); // Create ฿25,000 invoice
Invoice.findExpired(); // Find expired invoices

// Instance methods
invoice.markAsPaid(method, confirmedBy); // Mark as paid
invoice.markAsExpired(); // Mark as expired
invoice.generateReceipt(); // Generate Thai tax receipt
```

### Certificate Model

```javascript
// Static methods
Certificate.generateCertificateId(); // Generate unique ID
Certificate.generateCertificateNumber(); // Generate sequential number
Certificate.verifyByNumber(certNumber); // Public verification API
Certificate.findExpiring(days); // Find expiring certificates

// Instance methods
cert.revoke(revokedBy, reason, notes); // Revoke certificate
cert.updateExpiryStatus(); // Update expiry status
cert.getVerificationData(); // Get public verification data
```

### AuditLog Model

```javascript
// Static methods
AuditLog.createLog(logData); // Create audit log entry
AuditLog.verifyChainIntegrity(start, end); // Verify hash chain
AuditLog.findSecurityEvents(start, end); // Find security events
AuditLog.getResourceTimeline(type, id); // Get resource audit trail
AuditLog.getUserActivity(userId, start, end); // Get user activity summary

// Instance methods
log.verifyChain(previousLog); // Verify hash chain link
log.calculateHash(); // Calculate SHA-256 hash
log.getFormattedLog(); // Get formatted log string
```

## 🎓 Research & Standards

This database design is based on:

**MongoDB Best Practices:**

- MongoDB University - M320 Data Modeling
- MongoDB Performance Best Practices Guide
- MongoDB Security Checklist

**Design Patterns:**

- Martin Fowler - Patterns of Enterprise Application Architecture
- Eric Evans - Domain-Driven Design
- Gang of Four - Design Patterns

**Security Standards:**

- NIST SP 800-53 - Database Security Controls
- OWASP - Authentication Cheat Sheet
- ISO 27001 - Information Security Management

**Thai Compliance:**

- Thai Revenue Department - 7-year retention requirement
- PDPA - Personal Data Protection Act
- E-Tax Receipt standards

## 📞 Support

For database-related questions:

- See main project README.md
- Check DATABASE_SCHEMA_DESIGN.md (technical specifications)
- Review PHASE1_CORE_SERVICES_TECHNICAL_SPECS.md

---

**Database Layer Version:** 2.0.0  
**Last Updated:** October 16, 2025  
**Production Ready:** ✅ Yes
