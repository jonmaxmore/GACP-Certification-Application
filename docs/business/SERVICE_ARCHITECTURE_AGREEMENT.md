# 🏗️ Service Architecture Agreement

## ความตกลงเรื่อง Process, Workflow & Logic แยกตาม Service

**Date:** October 16, 2025  
**Project:** GACP Certification Platform  
**Agreement:** ทุก Service ต้องมี Process, Workflow และ Logic ของตัวเองที่ถูกต้อง

---

## 🎯 หลักการพื้นฐาน

### **Principle:**

> **"Each service MUST have its own complete Process, Workflow, and Business Logic"**

### **Requirements:**

1. ✅ **Self-Contained:** Service ต้องทำงานได้เองโดยไม่พึ่งพา Logic ของ Service อื่น
2. ✅ **Clear Boundaries:** แต่ละ Service มี Responsibility ที่ชัดเจน
3. ✅ **Independent:** สามารถ Test, Deploy, Scale แยกกันได้
4. ✅ **Well-Documented:** มีเอกสาร Process/Workflow/Logic ครบถ้วน

---

## 📦 Service Breakdown

### 🔐 **1. Authentication Service**

**Responsibility:** จัดการ User Authentication & Authorization

#### **Process:**

```
1. Registration Process:
   Input: User Data (email, password, name, role, phone)
   ├─ Validate Input (email format, password strength, required fields)
   ├─ Check Duplicate Email
   ├─ Hash Password (bcrypt, 10 rounds)
   ├─ Create User Record in MongoDB
   ├─ Send Verification Email (optional)
   └─ Return Success Response + JWT Tokens

2. Login Process:
   Input: Email + Password
   ├─ Validate Input
   ├─ Find User by Email
   ├─ Check Account Status (active/locked/suspended)
   ├─ Verify Password (compare hash)
   ├─ Check Failed Attempts (max 5)
   ├─ Generate JWT Tokens (Access: 15min, Refresh: 7 days)
   ├─ Update Last Login Time
   └─ Return Tokens + User Profile

3. Password Reset Process:
   Request → Validate Email → Generate Reset Token
   → Send Email → Verify Token → Update Password → Complete

4. Token Refresh Process:
   Refresh Token → Validate → Check Expiry
   → Generate New Access Token → Return
```

#### **Workflow States:**

```
User Account States:
├─ pending_verification (after registration)
├─ active (verified and can login)
├─ locked (5 failed login attempts, 30 min cooldown)
├─ suspended (admin action)
└─ deactivated (soft delete)
```

#### **Business Logic:**

```javascript
// Authentication Business Rules
const AuthLogic = {
  // Password Requirements
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: true
  },

  // Account Security
  security: {
    maxFailedAttempts: 5,
    lockoutDuration: 30 * 60 * 1000, // 30 minutes
    sessionTimeout: 15 * 60 * 1000, // 15 minutes
    refreshTokenExpiry: 7 * 24 * 60 * 60 * 1000 // 7 days
  },

  // Email Verification
  verification: {
    tokenExpiry: 24 * 60 * 60 * 1000, // 24 hours
    resendCooldown: 5 * 60 * 1000 // 5 minutes
  },

  // Validation Rules
  validateEmail: email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  validatePassword: password => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[!@#$%^&*]/.test(password)
    );
  }
};
```

#### **Dependencies:**

- MongoDB (User collection)
- JWT library (jsonwebtoken)
- bcrypt (password hashing)
- Email service (optional for verification)

#### **API Endpoints:**

```
POST /api/auth/farmer/register
POST /api/auth/farmer/login
POST /api/auth/farmer/refresh-token
POST /api/auth/farmer/request-password-reset
POST /api/auth/farmer/reset-password
GET  /api/auth/farmer/verify-email/:token
GET  /api/auth/farmer/profile
PUT  /api/auth/farmer/profile
```

---

### 📝 **2. Application Service**

**Responsibility:** จัดการ GACP Certification Applications

#### **Process:**

```
1. Create Application Process:
   Input: Farm Data + Crop Info + Documents
   ├─ Validate User Authentication
   ├─ Check Payment Status (Phase 1: ฿5,000 must be paid)
   ├─ Validate Required Fields
   ├─ Validate Document Uploads (PDF, max 10MB each)
   ├─ Create Application Record (status: draft)
   ├─ Generate Application Number (GACP-YYYY-NNNNNN)
   └─ Return Application ID

2. Submit Application Process:
   Input: Application ID
   ├─ Validate All Required Documents Uploaded
   ├─ Check Payment Phase 1 Completed
   ├─ Validate Farm Size (must be > 0)
   ├─ Change Status: draft → submitted
   ├─ Assign to Reviewer (Job Ticket System)
   ├─ Send Notification to User
   ├─ Create Audit Log
   └─ Return Success + Estimated Review Date

3. Review Process:
   Input: Application ID + Review Decision
   ├─ Validate Reviewer Role
   ├─ Check Current Status = under_review
   ├─ Validate Review Comments (if reject)
   ├─ Decision Branch:
   │  ├─ Approve → Status: pending_inspection
   │  │           → Assign Inspector
   │  │           → Send Invoice Phase 2 (฿25,000)
   │  └─ Reject → Status: rejected
   │              → Lock for 7 days
   │              → Send Rejection Reason
   ├─ Create Audit Log
   └─ Send Notification

4. Inspection Process:
   Phase 1 (Online):
   ├─ Inspector reviews documents online
   ├─ Decision: Pass → Schedule Phase 2 | Fail → Reject

   Phase 2 (Onsite - Conditional):
   ├─ Inspector visits farm
   ├─ Complete inspection report
   ├─ Upload photos + findings
   ├─ Decision: Pass → pending_approval | Fail → Reject

5. Approval Process:
   Input: Application ID + Approval Decision
   ├─ Validate Approver Role
   ├─ Check Current Status = pending_approval
   ├─ Check Payment Phase 2 Completed
   ├─ Decision Branch:
   │  ├─ Approve → Generate Certificate
   │  │           → Status: approved
   │  │           → Trigger Certificate Service
   │  └─ Reject → Status: rejected
   │              → Refund Logic (if applicable)
   └─ Send Final Notification
```

#### **Workflow State Machine:**

```
Application States (12 states):

1. draft ──────────────────► (User saves application)
   │
   ├─ [Submit + Pay Phase 1] ─► 2. submitted
   │
   └─ [Delete] ───────────────► (deleted)

2. submitted
   │
   ├─ [Auto-assign] ──────────► 3. under_review
   │
   └─ [Withdraw] ─────────────► withdrawn

3. under_review
   │
   ├─ [Approve] ──────────────► 4. pending_inspection
   │
   ├─ [Reject] ───────────────► 5. rejected
   │
   └─ [Request Info] ─────────► 6. pending_info

4. pending_inspection
   │
   ├─ [Schedule] ─────────────► 7. inspection_scheduled
   │
   └─ [Cannot Inspect] ───────► 5. rejected

5. rejected
   │
   ├─ [After 7 days] ─────────► 1. draft (resubmit allowed)
   │
   └─ [3rd Rejection] ────────► (require new payment ฿5,000)

6. pending_info
   │
   ├─ [User Responds] ────────► 3. under_review
   │
   └─ [30 days timeout] ──────► auto_rejected

7. inspection_scheduled
   │
   ├─ [Inspector Complete] ───► 8. inspection_completed
   │
   └─ [Reschedule] ───────────► 7. inspection_scheduled

8. inspection_completed
   │
   ├─ [Pass] ─────────────────► 9. pending_approval
   │
   └─ [Fail] ─────────────────► 5. rejected

9. pending_approval
   │
   ├─ [Approve + Pay Phase 2] ► 10. approved
   │
   └─ [Reject] ───────────────► 5. rejected

10. approved
    │
    └─ [Generate Certificate] ─► 11. certificate_issued

11. certificate_issued
    │
    ├─ [Expire after 3 years] ─► 12. expired
    │
    └─ [Revoke] ───────────────► revoked

12. expired
    │
    └─ [Renew] ────────────────► 1. draft (new application)
```

#### **Business Logic:**

```javascript
// Application Business Rules
const ApplicationLogic = {
  // State Transition Guards
  canTransition(fromState, toState, context) {
    const transitions = {
      'draft -> submitted': () => {
        return (
          context.allDocumentsUploaded && context.paymentPhase1Completed && context.farmSize > 0
        );
      },
      'under_review -> pending_inspection': () => {
        return context.reviewerApproved && context.reviewComments.length > 0;
      },
      'pending_approval -> approved': () => {
        return (
          context.inspectionPassed &&
          context.paymentPhase2Completed &&
          context.approverRole === 'APPROVER'
        );
      }
    };

    const key = `${fromState} -> ${toState}`;
    return transitions[key] ? transitions[key]() : false;
  },

  // Payment Rules
  payment: {
    phase1: {
      amount: 5000,
      currency: 'THB',
      requiredBefore: 'submit',
      refundable: false
    },
    phase2: {
      amount: 25000,
      currency: 'THB',
      requiredBefore: 'approval',
      refundable: true, // if rejected after payment
      refundPercentage: 50 // 50% refund if rejected
    }
  },

  // Rejection Rules
  rejection: {
    lockPeriod: 7 * 24 * 60 * 60 * 1000, // 7 days
    feeRequiredEvery: 2, // Fee required every 2 rejections
    resubmitFee: 5000, // ฿5,000 every 2 rejections
    requiresNewPayment: rejectionCount => rejectionCount > 0 && rejectionCount % 2 === 0
  },

  // Document Validation
  documents: {
    required: ['farm_registration', 'land_ownership', 'farm_map', 'crop_details'],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    validateDocument(file) {
      return file.size <= this.maxFileSize && this.allowedTypes.includes(file.type);
    }
  },

  // Timeline SLA
  sla: {
    review: 3 * 24 * 60 * 60 * 1000, // 3 days
    inspection: 7 * 24 * 60 * 60 * 1000, // 7 days
    approval: 2 * 24 * 60 * 60 * 1000 // 2 days
  }
};
```

#### **Dependencies:**

- Payment Service (for payment verification)
- Certificate Service (for certificate generation)
- Job Ticket Service (for assignment)
- Notification Service (for alerts)
- Audit Service (for logging)

#### **API Endpoints:**

```
POST   /api/applications              (Create draft)
GET    /api/applications              (List user's applications)
GET    /api/applications/:id          (Get application details)
PUT    /api/applications/:id          (Update draft)
DELETE /api/applications/:id          (Delete draft)
POST   /api/applications/:id/submit   (Submit application)
POST   /api/applications/:id/withdraw (Withdraw application)

# DTAM Staff Only
GET    /api/dtam/applications         (List all applications)
POST   /api/dtam/applications/:id/review    (Review decision)
POST   /api/dtam/applications/:id/inspect   (Inspection result)
POST   /api/dtam/applications/:id/approve   (Final approval)
```

---

### 💳 **3. Payment Service**

**Responsibility:** จัดการการชำระเงิน และ Invoice

#### **Process:**

```
1. Create Invoice Process:
   Input: Application ID + Phase (1 or 2)
   ├─ Validate Application Exists
   ├─ Check Current State Allows Payment
   ├─ Calculate Amount (Phase 1: ฿5,000 | Phase 2: ฿25,000)
   ├─ Generate Invoice Number (INV-YYYY-NNNNNN)
   ├─ Set Due Date (7 days from creation)
   ├─ Create Invoice Record (status: pending)
   └─ Return Invoice + Payment Methods

2. Process Payment Process:
   Input: Invoice ID + Payment Method + Transaction Data
   ├─ Validate Invoice Status = pending
   ├─ Check Invoice Not Expired
   ├─ Payment Method Branch:
   │  ├─ Credit Card → Stripe/Omise API
   │  ├─ Bank Transfer → Generate QR Code
   │  ├─ PromptPay → Generate QR Code
   │  └─ Cash (Office) → Manual Confirmation
   ├─ Process Payment via Gateway
   ├─ Update Invoice Status: pending → processing
   ├─ Wait for Confirmation (webhook/polling)
   ├─ Status Branch:
   │  ├─ Success → Status: paid
   │  │          → Update Application Payment Status
   │  │          → Send Receipt Email
   │  │          → Create Audit Log
   │  └─ Failed → Status: failed
   │             → Send Failure Notification
   │             → Allow Retry
   └─ Return Payment Result

3. Refund Process (if needed):
   Input: Invoice ID + Refund Reason
   ├─ Validate Invoice Status = paid
   ├─ Check Refund Policy (Phase 2 only, 50% refund)
   ├─ Calculate Refund Amount
   ├─ Process Refund via Payment Gateway
   ├─ Update Invoice Status: paid → refunded
   ├─ Create Refund Record
   ├─ Send Refund Confirmation Email
   └─ Update Application Status
```

#### **Workflow States:**

```
Invoice States:
├─ pending (created, awaiting payment)
├─ processing (payment in progress)
├─ paid (payment successful)
├─ failed (payment failed)
├─ expired (due date passed)
├─ cancelled (invoice cancelled)
└─ refunded (payment refunded)

Payment States:
├─ initiated (payment started)
├─ pending (waiting confirmation)
├─ completed (payment successful)
├─ failed (payment failed)
└─ refunded (payment refunded)
```

#### **Business Logic:**

```javascript
// Payment Business Rules
const PaymentLogic = {
  // Phase Configuration
  phases: {
    phase1: {
      amount: 5000,
      requiredAt: 'application_submit',
      refundable: false,
      description: 'Initial application fee'
    },
    phase2: {
      amount: 25000,
      requiredAt: 'before_approval',
      refundable: true,
      refundPercentage: 50,
      description: 'Certification processing fee'
    }
  },

  // Refund Policy
  refund: {
    phase1: {
      allowed: false,
      reason: 'Non-refundable application fee'
    },
    phase2: {
      allowed: true,
      conditions: ['application_rejected_after_payment', 'application_withdrawn_before_inspection'],
      percentage: 50, // 50% refund
      processingDays: 14 // 14 days to process refund
    }
  },

  // Payment Gateway Config
  gateways: {
    creditCard: {
      provider: 'Stripe',
      enabled: true,
      processingFee: 2.9, // 2.9% + ฿10
      fixedFee: 10
    },
    promptPay: {
      provider: 'SCB',
      enabled: true,
      processingFee: 0,
      qrCodeExpiry: 15 * 60 * 1000 // 15 minutes
    },
    bankTransfer: {
      enabled: true,
      accounts: [{ bank: 'SCB', accountNo: '123-456-7890', name: 'GACP Platform' }],
      verificationTime: 24 * 60 * 60 * 1000 // 24 hours
    }
  },

  // Invoice Expiry
  invoice: {
    dueDays: 7,
    reminderDays: [3, 1], // send reminder 3 days and 1 day before
    expiredGracePeriod: 1 * 24 * 60 * 60 * 1000 // 1 day grace
  },

  // Validation
  validatePayment(invoice, paymentData) {
    return (
      invoice.amount === paymentData.amount &&
      invoice.status === 'pending' &&
      !this.isExpired(invoice) &&
      this.isPaymentMethodValid(paymentData.method)
    );
  }
};
```

#### **Dependencies:**

- Payment Gateway API (Stripe/Omise/SCB)
- Application Service (for status updates)
- Email Service (for receipts)
- Audit Service (for payment logs)

#### **API Endpoints:**

```
POST   /api/payments/invoices                (Create invoice)
GET    /api/payments/invoices/:id            (Get invoice)
POST   /api/payments/invoices/:id/pay        (Process payment)
GET    /api/payments/transactions/:id        (Get transaction)
POST   /api/payments/invoices/:id/refund     (Request refund)
POST   /api/payments/webhooks/stripe         (Stripe webhook)
POST   /api/payments/webhooks/omise          (Omise webhook)
```

---

### 📜 **4. Certificate Service**

**Responsibility:** สร้าง จัดการ และตรวจสอบใบรับรอง

#### **Process:**

```
1. Generate Certificate Process:
   Input: Application ID (status: approved)
   ├─ Validate Application Approved
   ├─ Check Payment Phase 2 Completed
   ├─ Generate Certificate Number (GACP-YYYY-NNNNNN)
   ├─ Calculate Expiry Date (3 years from issue)
   ├─ Generate Tamper-Proof QR Code:
   │  ├─ Create QR Payload (certificate data)
   │  ├─ Calculate SHA256 HMAC Hash
   │  ├─ Encode to QR Code Image
   │  └─ Store QR Code URL
   ├─ Generate PDF Certificate:
   │  ├─ Load Template (Thai/English)
   │  ├─ Embed Farm Data
   │  ├─ Embed QR Code
   │  ├─ Add Digital Signature
   │  └─ Save PDF to Storage
   ├─ Create Certificate Record (status: active)
   ├─ Update Application Status: approved → certificate_issued
   ├─ Send Certificate Email to Farmer
   ├─ Create Audit Log
   └─ Return Certificate URL

2. Verify Certificate Process:
   Input: Certificate Number OR QR Code Data
   ├─ Scan Method Branch:
   │  ├─ Certificate Number → Find in Database
   │  └─ QR Code → Decode → Verify HMAC → Find in Database
   ├─ Check Certificate Exists
   ├─ Verify Status = active (not revoked/expired)
   ├─ Check Expiry Date
   ├─ Return Verification Result:
   │  ├─ Valid: Farm details, issue date, expiry date
   │  ├─ Expired: Certificate expired message
   │  ├─ Revoked: Revocation reason
   │  └─ Invalid: Certificate not found or tampered
   └─ Create Audit Log (verification attempt)

3. Revoke Certificate Process:
   Input: Certificate ID + Revocation Reason
   ├─ Validate Admin/Approver Role
   ├─ Validate Certificate Status = active
   ├─ Update Status: active → revoked
   ├─ Record Revocation Reason + Date
   ├─ Send Notification to Certificate Holder
   ├─ Create Audit Log
   └─ Return Success
```

#### **Workflow States:**

```
Certificate States:
├─ generating (in progress)
├─ active (valid and in use)
├─ expired (past expiry date - 3 years)
└─ revoked (cancelled by admin)
```

#### **Business Logic:**

```javascript
// Certificate Business Rules
const CertificateLogic = {
  // Certificate Configuration
  config: {
    validityPeriod: 3 * 365 * 24 * 60 * 60 * 1000, // 3 years
    numberFormat: 'GACP-YYYY-NNNNNN',
    qrVersion: 1,
    hmacAlgorithm: 'sha256'
  },

  // QR Code Generation
  qrCode: {
    size: 300, // pixels
    errorCorrection: 'M', // Medium 15%
    generatePayload(certificate) {
      return {
        version: 1,
        certificateNumber: certificate.number,
        farmName: certificate.farmName,
        issuedDate: certificate.issuedDate,
        expiryDate: certificate.expiryDate,
        hash: this.calculateHMAC(certificate)
      };
    },
    calculateHMAC(data) {
      const crypto = require('crypto');
      const secret = process.env.CERTIFICATE_SECRET;
      return crypto.createHmac('sha256', secret).update(JSON.stringify(data)).digest('hex');
    },
    verifyHMAC(payload, providedHash) {
      const calculatedHash = this.calculateHMAC(payload);
      return calculatedHash === providedHash;
    }
  },

  // PDF Generation
  pdf: {
    template: 'certificate-template-v2.pdf',
    pageSize: 'A4',
    orientation: 'portrait',
    fonts: {
      thai: 'Sarabun',
      english: 'Roboto'
    },
    generateContent(certificate) {
      return {
        certificateNumber: certificate.number,
        farmName: certificate.farmName,
        farmerName: certificate.farmerName,
        province: certificate.province,
        farmArea: certificate.farmArea,
        cropType: certificate.cropType,
        issuedDate: formatDate(certificate.issuedDate, 'DD/MM/YYYY'),
        expiryDate: formatDate(certificate.expiryDate, 'DD/MM/YYYY'),
        qrCodeUrl: certificate.qrCodeUrl,
        signature: 'ผู้อำนวยการ กรมวิชาการเกษตร'
      };
    }
  },

  // Validation Rules
  validation: {
    isValid(certificate) {
      const now = Date.now();
      return certificate.status === 'active' && certificate.expiryDate > now;
    },
    isExpired(certificate) {
      return certificate.expiryDate <= Date.now();
    },
    isRevoked(certificate) {
      return certificate.status === 'revoked';
    }
  },

  // Revocation Rules
  revocation: {
    allowedReasons: [
      'fraud_detected',
      'non_compliance',
      'farm_closed',
      'farmer_request',
      'administrative'
    ],
    requiresApproval: true,
    notificationRequired: true
  }
};
```

#### **Dependencies:**

- QRCode library (for QR generation)
- PDFKit (for PDF generation)
- Crypto (for HMAC)
- Storage Service (S3/Cloud Storage)
- Email Service (for sending certificate)

#### **API Endpoints:**

```
POST   /api/certificates/generate/:applicationId  (Generate certificate)
GET    /api/certificates/:certificateNumber       (Get certificate)
POST   /api/certificates/verify                   (Verify certificate)
POST   /api/certificates/:id/revoke               (Revoke certificate)
GET    /api/certificates/:id/download             (Download PDF)
GET    /api/certificates/:id/qrcode               (Get QR code image)
GET    /api/certificates/stats                    (Dashboard stats)
```

---

### 📊 **5. Audit Service**

**Responsibility:** บันทึก Track และวิเคราะห์ System Activities

#### **Process:**

```
1. Log Action Process:
   Input: Action + Actor + Resource + Metadata
   ├─ Validate Input
   ├─ Determine Action Criticality
   ├─ Collect Context:
   │  ├─ User ID, Role, Name, Email
   │  ├─ IP Address
   │  ├─ User Agent
   │  ├─ Timestamp
   │  ├─ Resource Type + ID
   │  └─ Before/After State (if applicable)
   ├─ Create Audit Log Record
   ├─ If Critical Action:
   │  ├─ Send to SIEM (if configured)
   │  └─ Trigger Alert (if needed)
   └─ Return Log ID

2. Query Audit Trail Process:
   Input: Resource Type + Resource ID + Filters
   ├─ Validate User Permission (can view audit logs)
   ├─ Apply Filters:
   │  ├─ Date Range
   │  ├─ Action Type
   │  ├─ Actor
   │  └─ Status (success/failure)
   ├─ Retrieve Logs from MongoDB
   ├─ Sort by Timestamp (desc)
   ├─ Paginate Results
   └─ Return Audit Trail

3. Analytics Process:
   Input: Date Range + Report Type
   ├─ Validate Admin Role
   ├─ Query Aggregation:
   │  ├─ Total Actions by Type
   │  ├─ Actions by Actor
   │  ├─ Failed Actions
   │  ├─ Critical Actions
   │  └─ Timeline Chart Data
   ├─ Calculate Statistics
   └─ Return Analytics Report
```

#### **Workflow States:**

```
Audit Log States:
├─ logged (successfully recorded)
├─ failed (log creation failed)
└─ archived (moved to cold storage after retention period)
```

#### **Business Logic:**

```javascript
// Audit Business Rules
const AuditLogic = {
  // Critical Actions (require special handling)
  criticalActions: [
    'user_role_changed',
    'application_approved',
    'application_rejected',
    'certificate_issued',
    'certificate_revoked',
    'payment_processed',
    'payment_refunded',
    'user_deleted',
    'system_config_changed'
  ],

  // Action Categories
  categories: {
    authentication: ['login', 'logout', 'password_reset', 'failed_login'],
    application: ['application_submitted', 'application_updated', 'application_approved'],
    payment: ['payment_initiated', 'payment_completed', 'payment_failed'],
    certificate: ['certificate_generated', 'certificate_verified', 'certificate_revoked'],
    system: ['config_changed', 'user_created', 'user_updated', 'role_changed']
  },

  // Data Retention Policy
  retention: {
    critical: null, // Keep forever
    standard: 365 * 24 * 60 * 60 * 1000, // 1 year
    authentication: 90 * 24 * 60 * 60 * 1000, // 90 days
    archive: true // Archive to cold storage after retention
  },

  // SIEM Integration
  siem: {
    enabled: process.env.SIEM_ENABLED === 'true',
    endpoint: process.env.SIEM_ENDPOINT,
    sendCriticalOnly: true,
    batchSize: 100,
    sendInterval: 5 * 60 * 1000 // 5 minutes
  },

  // Log Structure
  createLogEntry(action, actor, resource, metadata = {}) {
    return {
      action,
      actor: {
        userId: actor.userId,
        role: actor.role,
        name: actor.name,
        email: actor.email,
        ipAddress: actor.ipAddress,
        userAgent: actor.userAgent
      },
      resource: {
        type: resource.type,
        id: resource.id,
        beforeState: resource.beforeState,
        afterState: resource.afterState
      },
      metadata: {
        ...metadata,
        source: 'gacp-backend',
        environment: process.env.NODE_ENV
      },
      timestamp: new Date(),
      critical: this.criticalActions.includes(action),
      status: 'success'
    };
  }
};
```

#### **Dependencies:**

- MongoDB (Audit logs collection)
- SIEM System (optional - Splunk/ELK)
- None (standalone service)

#### **API Endpoints:**

```
POST   /api/audit/log                     (Create audit log)
GET    /api/audit/:resourceType/:id       (Get audit trail)
GET    /api/audit/actions                 (List all actions)
GET    /api/audit/stats                   (Get statistics)
POST   /api/audit/search                  (Advanced search)
DELETE /api/audit/cleanup                 (Cleanup old logs - admin only)
```

---

### 🔄 **6. Transaction Manager Service**

**Responsibility:** จัดการ Database Transactions และ Data Consistency

#### **Process:**

```
1. Execute Transaction Process:
   Input: Operations Array + Metadata
   ├─ Start MongoDB Session
   ├─ Start Transaction
   ├─ For Each Operation:
   │  ├─ Execute Operation
   │  ├─ If Success → Continue
   │  └─ If Error → Rollback All + Throw Error
   ├─ If All Success:
   │  ├─ Commit Transaction
   │  ├─ Create Audit Log (success)
   │  └─ Return Success Result
   └─ If Any Error:
      ├─ Rollback Transaction
      ├─ Create Audit Log (failure)
      ├─ Retry (if transient error, max 3 attempts)
      └─ Return Error Result

2. Compensating Transaction Process (for non-transactional ops):
   Input: Operations Array + Compensation Functions
   ├─ Execute Each Operation Sequentially
   ├─ Track Completed Operations
   ├─ If Error Occurs:
   │  ├─ Execute Compensation Functions (in reverse order)
   │  ├─ For Each Completed Operation:
   │  │  └─ Run its Compensation Function
   │  └─ Create Audit Log (compensated)
   └─ Return Result
```

#### **Workflow States:**

```
Transaction States:
├─ initiated (transaction started)
├─ executing (operations in progress)
├─ committed (transaction successful)
├─ rolled_back (transaction failed)
└─ compensated (manual rollback via compensation)
```

#### **Business Logic:**

```javascript
// Transaction Business Rules
const TransactionLogic = {
  // Retry Configuration
  retry: {
    maxAttempts: 3,
    backoffMultiplier: 2,
    initialDelay: 1000, // 1 second
    maxDelay: 10000, // 10 seconds
    retryableErrors: ['WriteConflict', 'LockTimeout', 'NetworkError']
  },

  // Transaction Timeout
  timeout: {
    default: 30000, // 30 seconds
    long: 60000, // 1 minute (for complex operations)
    short: 10000 // 10 seconds (for simple operations)
  },

  // Execute with Rollback
  async executeWithRollback(operations, metadata = {}) {
    const session = await mongoose.startSession();
    let attempt = 0;

    while (attempt < this.retry.maxAttempts) {
      try {
        session.startTransaction();

        // Execute all operations
        const results = [];
        for (const op of operations) {
          const result = await op.execute({ session });
          results.push(result);
        }

        // Commit transaction
        await session.commitTransaction();

        // Log success
        await auditService.logAction('transaction_completed', metadata);

        return { success: true, results };
      } catch (error) {
        // Rollback
        await session.abortTransaction();

        // Check if retryable
        if (this.isRetryable(error) && attempt < this.retry.maxAttempts - 1) {
          attempt++;
          const delay = this.calculateBackoff(attempt);
          await this.sleep(delay);
          continue;
        }

        // Log failure
        await auditService.logFailure('transaction_failed', metadata, error);

        throw error;
      } finally {
        session.endSession();
      }
    }
  },

  // Compensating Actions Pattern
  async executeWithCompensation(operations) {
    const completed = [];

    try {
      // Execute operations
      for (const op of operations) {
        const result = await op.execute();
        completed.push({ op, result });
      }

      return { success: true, results: completed };
    } catch (error) {
      // Compensate in reverse order
      for (let i = completed.length - 1; i >= 0; i--) {
        const { op, result } = completed[i];
        try {
          await op.compensate(result);
        } catch (compensationError) {
          console.error('Compensation failed:', compensationError);
        }
      }

      throw error;
    }
  }
};
```

#### **Dependencies:**

- Mongoose (MongoDB session management)
- Audit Service (for transaction logging)
- None (infrastructure service)

#### **Usage Example:**

```javascript
// Example: Approve Application Transaction
const operations = [
  {
    name: 'Update Application Status',
    execute: async ({ session }) => {
      return await Application.findByIdAndUpdate(
        applicationId,
        { status: 'approved', approvedAt: new Date() },
        { session, new: true }
      );
    }
  },
  {
    name: 'Generate Certificate',
    execute: async ({ session }) => {
      return await Certificate.create(
        [
          {
            applicationId,
            number: generateCertificateNumber(),
            status: 'active'
          }
        ],
        { session }
      );
    }
  },
  {
    name: 'Send Notification',
    execute: async ({ session }) => {
      return await notificationService.send({
        userId,
        type: 'application_approved',
        message: 'Your application has been approved!'
      });
    }
  }
];

const result = await transactionManager.executeWithRollback(operations, {
  action: 'approve_application',
  actor: currentUser,
  resource: { type: 'application', id: applicationId }
});
```

---

## 🔗 Service Dependencies Matrix

| Service                 | Depends On                                            | Used By                           |
| ----------------------- | ----------------------------------------------------- | --------------------------------- |
| **Authentication**      | None (foundational)                                   | All services (for auth)           |
| **Application**         | Payment, Certificate, Job Ticket, Notification, Audit | Dashboard, Reports                |
| **Payment**             | Audit                                                 | Application                       |
| **Certificate**         | Audit, Storage, Email                                 | Application, Public Verification  |
| **Audit**               | None (infrastructure)                                 | All services                      |
| **Transaction Manager** | Audit                                                 | Application, Payment, Certificate |
| **Notification**        | Email, SMS providers                                  | Application, Payment, Certificate |
| **Job Ticket**          | Audit                                                 | Application (for assignment)      |

---

## ✅ Validation Checklist

### **For Each Service, Verify:**

- [ ] **Process:**
  - [ ] Clear input/output defined
  - [ ] Step-by-step execution flow documented
  - [ ] Error handling paths defined
  - [ ] Success/failure criteria clear

- [ ] **Workflow:**
  - [ ] State machine diagram complete
  - [ ] All possible states defined
  - [ ] Transition rules documented
  - [ ] Guard conditions specified

- [ ] **Logic:**
  - [ ] Business rules documented
  - [ ] Validation rules clear
  - [ ] Calculation logic specified
  - [ ] Edge cases handled

- [ ] **Implementation:**
  - [ ] API endpoints defined
  - [ ] Database schema designed
  - [ ] Dependencies identified
  - [ ] Tests written

---

## 📝 Next Steps

### **Phase 1: Validation (Now)**

1. ✅ Review this document
2. ✅ Confirm understanding of each service
3. ✅ Identify any missing pieces
4. ✅ Get approval to proceed

### **Phase 2: Implementation**

1. Create service directories
2. Implement business logic
3. Write unit tests
4. Write integration tests
5. Document APIs

### **Phase 3: Integration**

1. Connect services
2. Test end-to-end flows
3. Performance testing
4. Security audit

---

## 🤝 Agreement Confirmation

**ผมเข้าใจหลักการนี้:**

> "แต่ละ Service ต้องมี Process, Workflow และ Logic ที่ครบถ้วน สมบูรณ์ และเป็นอิสระ"

**ถ้าเห็นด้วยกับสิ่งที่วิเคราะห์ไว้ข้างต้น เราสามารถเริ่มงานได้เลยครับ!** 🚀

---

**Created:** October 16, 2025  
**Version:** 1.0  
**Status:** ✅ Ready for Implementation
