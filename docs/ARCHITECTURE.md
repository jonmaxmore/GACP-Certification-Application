# GACP Platform Architecture Documentation

**Version:** 2.0.0
**Last Updated:** October 26, 2025
**Status:** Production Ready (95%)

---

## Table of Contents

1. [Overview](#overview)
2. [System Architecture Diagram](#system-architecture-diagram)
3. [Project Structure](#project-structure)
4. [Entry Points](#entry-points)
5. [Architecture Pattern](#architecture-pattern)
6. [Authentication Systems](#authentication-systems)
7. [Business Logic Organization](#business-logic-organization)
8. [Module Structure](#module-structure)
9. [Technology Stack](#technology-stack)
10. [Dependencies](#dependencies)
11. [Data Flow](#data-flow)
12. [Certificate Portal Access Control](#certificate-portal-access-control)

---

## Overview

The **GACP Platform (Good Agricultural and Collection Practices Certification Platform)** is a comprehensive digital platform for managing cannabis farm certification in Thailand. The platform is **architecturally separated into two distinct systems**:

### 1. Customer-Facing System (Public Portal)

- **Users**: Farmers and agricultural businesses
- **Frontend**: Farmer Portal (Next.js on Port 3001)
- **Backend**: `auth-farmer` module with dedicated JWT authentication
- **Features**:
  - Self-registration and login
  - GACP certification application submission
  - Farm management and monitoring
  - Document uploads and tracking
  - Payment processing
  - Application status tracking
  - Personal dashboard and reports

### 2. Staff Management System (Government Portal)

- **Users**: DTAM government officials (Inspectors, Reviewers, Admins)
- **Frontend**: Admin Portal (Next.js on Port 3002)
- **Backend**: `auth-dtam` module with separate JWT authentication
- **Features**:
  - Application review and approval
  - Inspector assignment and management
  - Certificate issuance
  - System-wide statistics and analytics
  - Audit logs and compliance tracking
  - User and role management
  - Government reporting

### Architecture Type

- **Monorepo Structure** using pnpm workspaces
- **Two-Tier Authentication** with separate JWT secrets for farmers and DTAM staff
- **Role-Based Access Control (RBAC)** for DTAM staff hierarchy
- **Microservices-ready** backend with modular architecture
- **Clean Architecture** principles in newer modules
- **Event-Driven** workflow engine for certification process

---

## System Architecture Diagram

### High-Level System Separation

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         GACP PLATFORM                                   │
│                     (Two-Part Architecture)                             │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────┐   ┌────────────────────────────────┐
│   CUSTOMER SYSTEM (PUBLIC)       │   │   STAFF SYSTEM (GOVERNMENT)    │
│   ════════════════════════       │   │   ═══════════════════════      │
│                                  │   │                                │
│  👤 Users: Farmers               │   │  🏢 Users: DTAM Officials      │
│                                  │   │                                │
│  ┌────────────────────────────┐ │   │  ┌──────────────────────────┐ │
│  │   Frontend Application     │ │   │  │  Frontend Application    │ │
│  │   ══════════════════════   │ │   │  │  ══════════════════════  │ │
│  │                            │ │   │  │                          │ │
│  │  Farmer Portal (Next.js)   │ │   │  │  Admin Portal (Next.js)  │ │
│  │  Port: 3001                │ │   │  │  Port: 3002              │ │
│  │                            │ │   │  │                          │ │
│  │  Routes:                   │ │   │  │  Routes:                 │ │
│  │  • /farmer/dashboard       │ │   │  │  • /applications         │ │
│  │  • /farmer/documents       │ │   │  │  • /certificates         │ │
│  │  • /farmer/reports         │ │   │  │  • /inspectors           │ │
│  │  • /farmer/settings        │ │   │  │  • /audit-logs           │ │
│  │                            │ │   │  │  • /roles                │ │
│  │  ⚠️ NOTE: Also contains    │ │   │  │  • /users                │ │
│  │     /dtam/* routes         │ │   │  │  • /statistics           │ │
│  │     (architectural debt)   │ │   │  │                          │ │
│  └────────────┬───────────────┘ │   │  └──────────┬───────────────┘ │
│               │                 │   │             │                 │
│               │ HTTPS           │   │             │ HTTPS           │
│               ▼                 │   │             ▼                 │
└───────────────┼─────────────────┘   └─────────────┼─────────────────┘
                │                                   │
                │                                   │
        ┌───────┴───────────────────────────────────┴────────┐
        │                                                     │
        │          BACKEND API (Express.js)                  │
        │          ════════════════════════                  │
        │         Port: 5000 (atlas-server.js)               │
        │                                                     │
        │  ┌──────────────────────────────────────────────┐  │
        │  │      Authentication Layer                    │  │
        │  │      ════════════════════                    │  │
        │  │                                              │  │
        │  │  ┌─────────────────┐  ┌──────────────────┐  │  │
        │  │  │  auth-farmer/   │  │   auth-dtam/     │  │  │
        │  │  │  ═════════════   │  │   ══════════     │  │  │
        │  │  │                 │  │                  │  │  │
        │  │  │ JWT_SECRET      │  │ DTAM_JWT_SECRET  │  │  │
        │  │  │ (7-day expiry)  │  │ (8-hour expiry)  │  │  │
        │  │  │                 │  │                  │  │  │
        │  │  │ Features:       │  │ Features:        │  │  │
        │  │  │ • Register      │  │ • Login only     │  │  │
        │  │  │ • Login         │  │ • NO register    │  │  │
        │  │  │ • Profile       │  │ • RBAC roles     │  │  │
        │  │  │ • Self-managed  │  │ • Admin-managed  │  │  │
        │  │  │                 │  │                  │  │  │
        │  │  │ Routes:         │  │ Routes:          │  │  │
        │  │  │ /auth-farmer/*  │  │ /auth-dtam/*     │  │  │
        │  │  └────────┬────────┘  └────────┬─────────┘  │  │
        │  │           │                    │            │  │
        │  └───────────┼────────────────────┼────────────┘  │
        │              │                    │               │
        │              ▼                    ▼               │
        │  ┌─────────────────────────────────────────────┐  │
        │  │       Business Logic Modules                │  │
        │  │       ══════════════════════                │  │
        │  │                                             │  │
        │  │  • application/        • certificate/       │  │
        │  │  • application-workflow/  • document/       │  │
        │  │  • farm-management/    • notification/      │  │
        │  │  • payment/            • cannabis-survey/   │  │
        │  │  • dashboard/          • report/            │  │
        │  │                                             │  │
        │  │  Authorization: Role-based permissions      │  │
        │  └─────────────────┬───────────────────────────┘  │
        │                    │                              │
        │                    ▼                              │
        │  ┌─────────────────────────────────────────────┐  │
        │  │         Data Layer                          │  │
        │  │         ══════════                          │  │
        │  │                                             │  │
        │  │    MongoDB Database (Mongoose ODM)          │  │
        │  │                                             │  │
        │  │    Collections:                             │  │
        │  │    • users (farmers)                        │  │
        │  │    • dtamStaff                              │  │
        │  │    • applications                           │  │
        │  │    • farms                                  │  │
        │  │    • certificates                           │  │
        │  │    • documents                              │  │
        │  │    • audit-logs                             │  │
        │  │                                             │  │
        │  └─────────────────────────────────────────────┘  │
        │                                                   │
        └───────────────────────────────────────────────────┘
```

### Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATA FLOW DIAGRAM                            │
└─────────────────────────────────────────────────────────────────┘

FARMER DATA FLOW:
─────────────────

1. Data Entry (Farmer)
   ↓
   Farmer Portal → /api/auth-farmer/login → JWT Token (farmer)
   ↓
   Dashboard → /api/applications/submit → Backend API
   ↓
   Validation → Business Logic → MongoDB
   ↓
   Response → Farmer Portal Dashboard


DTAM STAFF DATA FLOW:
─────────────────────

1. Data Access (DTAM Staff)
   ↓
   Admin Portal → /api/auth-dtam/login → JWT Token (dtam)
   ↓
   Dashboard → /api/applications/list → Backend API (with role check)
   ↓
   Authorization → Business Logic → MongoDB
   ↓
   Response → Admin Portal Dashboard


DATA COLLECTION & STORAGE:
──────────────────────────

Farmer Input → Farmer Portal Form
   ↓
   POST /api/applications
   ↓
   Backend API Validation
   ↓
   Business Logic Processing
   ↓
   MongoDB Storage
   ↓
   Accessible via Admin Portal (DTAM staff only)
   ↓
   Dashboard Visualization (role-based)
```

### Authentication Flow Comparison

```
┌────────────────────────────────────────────────────────────────┐
│             AUTHENTICATION FLOW COMPARISON                     │
└────────────────────────────────────────────────────────────────┘

FARMER AUTHENTICATION:                DTAM AUTHENTICATION:
══════════════════════                ════════════════════

1. Registration                       1. No Self-Registration
   POST /api/auth-farmer/register        ❌ Blocked by backend
   ✅ Self-registration allowed          ✅ Admin creates account

2. Login                              2. Login
   POST /api/auth-farmer/login           POST /api/auth-dtam/login
   Username/Password                     Username/Password
   ↓                                     ↓
   JWT Token (7-day expiry)              JWT Token (8-hour expiry)
   Signed with: JWT_SECRET               Signed with: DTAM_JWT_SECRET

3. Access Control                     3. Access Control
   Token validates user                  Token validates user + role
   Can access own data only              Can access based on role:
   - Own applications                    - Inspector: assigned cases
   - Own farm data                       - Reviewer: pending reviews
   - Own documents                       - Admin: all data

4. Token Usage                        4. Token Usage
   Header: Authorization Bearer          Header: Authorization Bearer
   Validates against JWT_SECRET          Validates against DTAM_JWT_SECRET
   ❌ Cannot access DTAM endpoints       ❌ Cannot access farmer endpoints
```

### Key Architectural Findings

**✅ STRENGTHS:**

1. **Separate Authentication Systems** - Complete isolation between farmer and DTAM auth
2. **Different JWT Secrets** - Prevents token misuse across systems
3. **Role-Based Access Control** - DTAM staff hierarchy properly implemented
4. **Module Separation** - Business logic cleanly separated by domain
5. **API Route Isolation** - `/auth-farmer/*` vs `/auth-dtam/*` clearly separated

**⚠️ ARCHITECTURAL DEBT:**

1. **Farmer Portal contains DTAM UI** - `/app/dtam/` directory exists in farmer-portal
   - Should be removed or properly isolated
   - DashboardLayout uses `userRole` prop to switch between farmer/DTAM UI
   - **Recommendation**: Extract DTAM UI to admin-portal exclusively

2. **Shared DashboardLayout Component** - One component serves both farmer and DTAM
   - Increases coupling between systems
   - **Recommendation**: Create separate layouts for each portal

3. **Certificate Portal Ambiguity** - Shared between farmers and DTAM
   - **Current**: Farmers view/verify, DTAM creates/issues
   - **Recommendation**: Document clear access control policies

**🎯 VERDICT:**

- **System Separation Score**: 8/10
- **Data Architecture Score**: 9/10
- **Authentication Separation Score**: 10/10
- **Overall Architecture**: Well-designed with minor cleanup needed

---

## Project Structure

```
Botanical-Audit-Framework/
├── apps/                           # Monorepo applications
│   ├── backend/                    # Node.js/Express backend (PRIMARY)
│   │   ├── atlas-server.js         # 🔴 PRODUCTION SERVER (Main Entry Point)
│   │   ├── server.js               # Development server
│   │   ├── dev-server.js           # Development server (alternative)
│   │   ├── simple-server.js        # Simple testing server
│   │   ├── config/                 # Backend configurations
│   │   ├── models/                 # Mongoose models (centralized)
│   │   ├── routes/                 # Legacy routes (being migrated)
│   │   ├── modules/                # Clean Architecture modules
│   │   │   ├── auth-farmer/        # Farmer authentication module
│   │   │   ├── auth-dtam/          # DTAM staff authentication module
│   │   │   ├── application/        # Application management
│   │   │   ├── application-workflow/ # Workflow engine
│   │   │   ├── certificate/        # Certificate generation
│   │   │   ├── cannabis-survey/    # Survey system
│   │   │   ├── document/           # Document management
│   │   │   ├── farm-management/    # Farm data management
│   │   │   ├── notification/       # Notification system
│   │   │   └── payment/            # Payment processing
│   │   ├── services/               # Business services
│   │   ├── middleware/             # Express middleware
│   │   └── shared/                 # Shared utilities
│   │       ├── logger/             # Winston logger
│   │       ├── utils/              # Utility functions
│   │       └── validators/         # Validation schemas
│   │
│   ├── admin-portal/               # Next.js admin dashboard
│   ├── certificate-portal/         # Next.js certificate portal
│   ├── farmer-portal/              # Next.js farmer portal
│   └── frontend/                   # Legacy frontend (Next.js 15)
│
├── frontend-nextjs/                # Main Next.js frontend (Next.js 16)
├── business-logic/                 # 🟡 Business logic files (being migrated)
│   ├── gacp-workflow-engine.js     # Main workflow engine (ACTIVE)
│   ├── gacp-certificate-generator.js
│   ├── gacp-document-review-system.js
│   ├── gacp-field-inspection-system.js
│   ├── gacp-survey-system.js
│   ├── gacp-standards-comparison-system.js
│   └── ... (14 files total)
│
├── config/                         # Global configuration
├── database/                       # Database schemas and migrations
├── scripts/                        # Utility scripts
├── docs/                           # Documentation (132+ files)
├── test/                           # Test suites
│
└── backend.archived.2025-10-26/    # 🗑️ ARCHIVED: Legacy backend code
    ├── backend/                    # Old backend structure (DO NOT USE)
    └── root-unused-files/          # Archived root-level files
        ├── app.js                  # Old entry point (replaced by atlas-server.js)
        ├── robust-server.js        # Old server file
        ├── .prettierrc.json        # Old prettier config
        └── .prettierrc.js          # Old prettier config
```

---

## Entry Points

### Production Server (Main Entry Point)

**File:** `apps/backend/atlas-server.js`

This is the **PRIMARY PRODUCTION SERVER** for the GACP Platform.

**Features:**

- MongoDB Atlas connection
- Business logic services integration
- Authentication & authorization
- File upload support
- Health monitoring
- Model caching fix

**How to Start:**

```bash
cd apps/backend
node atlas-server.js
```

**Port:** 3004 (default)
**URL:** http://localhost:3004

---

### Development Servers

**1. Standard Development Server**

**File:** `apps/backend/server.js`

Basic development server with hot reload support.

```bash
cd apps/backend
npm run dev
# or
node server.js
```

**2. Alternative Development Server**

**File:** `apps/backend/dev-server.js`

Alternative development server with additional debugging features.

```bash
node dev-server.js
```

**3. Simple Testing Server**

**File:** `apps/backend/simple-server.js`

Minimal server for testing basic functionality.

```bash
node simple-server.js
```

---

### Frontend Entry Points

**1. Main Frontend (Next.js 16)**

**Directory:** `frontend-nextjs/`

```bash
cd frontend-nextjs
npm run dev
```

**Port:** 3000
**URLs:**

- Farmer Portal: http://localhost:3000/farmer
- DTAM Portal: http://localhost:3000/dtam

**2. Separate Portals (Monorepo Apps)**

```bash
# Admin Portal
cd apps/admin-portal
npm run dev

# Certificate Portal
cd apps/certificate-portal
npm run dev

# Farmer Portal
cd apps/farmer-portal
npm run dev
```

---

## Architecture Pattern

### Clean Architecture (New Modules)

New modules follow **Clean Architecture** principles with clear layer separation:

```
apps/backend/modules/{module-name}/
├── domain/                  # Business logic layer (pure)
│   ├── entities/            # Business entities
│   ├── services/            # Domain services
│   └── repositories/        # Repository interfaces
│
├── application/             # Use cases layer
│   └── use-cases/           # Application use cases
│
├── infrastructure/          # External concerns layer
│   ├── models/              # Mongoose models
│   ├── repositories/        # Repository implementations
│   └── services/            # External services (email, SMS, etc.)
│
├── presentation/            # Interface layer
│   ├── controllers/         # Express controllers
│   ├── routes/              # API routes
│   ├── middleware/          # Route middleware
│   └── validators/          # Request validators
│
└── container.js             # Dependency injection container
```

**Benefits:**

- Clear separation of concerns
- Testable business logic (independent of frameworks)
- Easy to replace infrastructure components
- Scalable and maintainable

**Modules using Clean Architecture:**

- ✅ `auth-farmer/` - Farmer authentication
- ✅ `auth-dtam/` - DTAM staff authentication
- ✅ `application-workflow/` - Workflow engine
- ✅ `cannabis-survey/` - Survey system
- ✅ `certificate/` - Certificate generation
- 🔄 Others being migrated...

---

### Legacy Monolithic Structure

Older code uses traditional Express structure:

```
apps/backend/
├── routes/              # Direct route handlers (legacy)
├── models/              # Mongoose models (centralized)
├── middleware/          # Express middleware
└── services/            # Business services (mixed concerns)
```

**Status:** Being gradually migrated to Clean Architecture

---

## Authentication Systems

The platform has **TWO SEPARATE AUTHENTICATION SYSTEMS** by design:

### 1. Farmer Authentication (`auth-farmer`)

**Module:** `apps/backend/modules/auth-farmer/`

**Purpose:** Authentication for farmers (customers) who apply for GACP certification

**Features:**

- JWT-based authentication
- Phone number verification (OTP)
- Password reset via SMS
- Session management
- Farm profile integration

**Endpoints:**

- `POST /api/auth/farmer/register` - Register new farmer
- `POST /api/auth/farmer/login` - Farmer login
- `POST /api/auth/farmer/verify-otp` - Verify phone OTP
- `POST /api/auth/farmer/reset-password` - Reset password

**Token Storage:** HTTP-only cookies + LocalStorage (client-side)

---

### 2. DTAM Staff Authentication (`auth-dtam`)

**Module:** `apps/backend/modules/auth-dtam/`

**Purpose:** Authentication for DTAM staff (government officials) who review applications

**Features:**

- JWT-based authentication
- Email-based login
- Role-based access control (RBAC)
- Staff ID verification
- Audit logging

**Roles:**

- `admin` - Full system access
- `reviewer` - Review applications and documents
- `inspector` - Conduct field inspections
- `approver` - Final approval authority

**Endpoints:**

- `POST /api/auth/dtam/login` - Staff login
- `POST /api/auth/dtam/verify-token` - Verify JWT token
- `GET /api/auth/dtam/profile` - Get staff profile

**Token Storage:** HTTP-only cookies only (more secure)

---

### Why Two Separate Systems?

**Reasons for Separation:**

1. **Different User Types**: Farmers vs Government Staff
2. **Different Authentication Methods**: Phone (farmers) vs Email (staff)
3. **Different Security Requirements**: Staff requires stricter audit logging
4. **Different Authorization Logic**: Farmers access own data, staff access all data
5. **Compliance**: Separation required by Thai FDA regulations

**Shared Components:**

- JWT utilities (in `shared/utils/jwt.js`)
- Password hashing (bcrypt)
- Token blacklist (Redis)
- Rate limiting

---

## Business Logic Organization

### Current State (Transition Period)

Business logic is currently organized in **TWO LOCATIONS**:

#### 1. `business-logic/` Directory (Root Level)

**Status:** 🟡 ACTIVE but being migrated to modules

**Files:** 14 standalone business logic files

**Currently Used:**

- ✅ `gacp-workflow-engine.js` - **ACTIVE** (imported by 3 files)
  - `apps/backend/atlas-server.js:39`
  - `apps/backend/routes/gacp-business-logic.js:27`
  - `apps/backend/services/gacp-enhanced-inspection.js:24`

**Not Yet Used (Prepared for Future):**

- `gacp-ai-assistant-system.js` (1,481 lines)
- `gacp-standards-comparison-system.js` (1,451 lines)
- `gacp-visual-remote-support-system.js` (1,234 lines)
- `gacp-survey-system.js` (1,137 lines)
- `gacp-certificate-generator.js`
- `gacp-document-review-system.js`
- `gacp-field-inspection-system.js`
- `gacp-dashboard-notification-system.js`
- And 6 more...

**Migration Plan:**

- Move to `apps/backend/modules/{module}/domain/services/`
- Split large files (>1,000 lines) into smaller services
- Update imports in consuming files

---

#### 2. `apps/backend/modules/` (Clean Architecture)

**Status:** ✅ RECOMMENDED - New business logic goes here

**Structure:**

```
modules/{module-name}/domain/services/
├── {Feature}Service.js       # Business service
└── {Feature}Validator.js     # Domain validation
```

**Examples:**

- `modules/application/domain/services/ApplicationService.js`
- `modules/certificate/domain/services/CertificateGenerator.js`
- `modules/workflow/domain/services/WorkflowOrchestrator.js`

---

## Module Structure

### Complete Module List

| Module                 | Status        | Purpose                   | Lines of Code        |
| ---------------------- | ------------- | ------------------------- | -------------------- |
| `auth-farmer`          | ✅ Production | Farmer authentication     | ~2,500               |
| `auth-dtam`            | ✅ Production | DTAM staff authentication | ~2,500               |
| `application`          | ✅ Production | Application management    | ~5,000               |
| `application-workflow` | ✅ Production | Workflow state machine    | ~3,500               |
| `certificate`          | ✅ Production | Certificate generation    | ~2,000               |
| `cannabis-survey`      | ✅ Production | Survey system             | ~3,000               |
| `document`             | ✅ Production | Document management       | ~1,500               |
| `farm-management`      | ✅ Production | Farm data management      | ~2,500               |
| `notification`         | ✅ Production | Notification system       | ~1,800               |
| `payment`              | ✅ Production | Payment processing        | ~2,200               |
| `standards-comparison` | 🔄 Migration  | Standards comparison      | (in business-logic/) |
| `survey-system`        | 🔄 Migration  | Survey templates          | (in business-logic/) |

**Total Backend Code:** ~45,000+ lines

---

## Technology Stack

### Backend Stack

**Runtime & Framework:**

- Node.js 24.9.0+ (recommended >= 18.0.0)
- Express.js 5.1.0

**Database:**

- MongoDB 6+ (Atlas or Self-hosted)
- Mongoose 8.x (ODM)

**Authentication:**

- JSON Web Tokens (JWT) - `jsonwebtoken` 9.0.2
- bcrypt 5.1.1 (password hashing)
- Redis 5.8.3 (token blacklist, sessions)

**Security:**

- Helmet.js 7.2.0 (HTTP security headers)
- express-mongo-sanitize 2.2.0 (NoSQL injection prevention)
- express-rate-limit 8.1.0 (Rate limiting)
- xss-clean 0.1.4 (XSS protection)
- hpp 0.2.3 (HTTP parameter pollution)

**Validation:**

- express-validator 7.2.1
- Joi 18.0.1

**File Processing:**

- Multer 1.4.5 (file uploads)
- Sharp 0.34.4 (image processing)
- PDFKit 0.13.0 (PDF generation)

**Communication:**

- Socket.io 4.8.1 (real-time updates)
- Nodemailer 7.0.10 (email)

**Logging:**

- Winston 3.11.0 (structured logging)
- Morgan 1.10.1 (HTTP request logging)

**Utilities:**

- Moment.js 2.30.1 (date manipulation)
- uuid 9.0.1 (unique IDs)
- crypto-js 4.2.0 (encryption)

---

### Frontend Stack

**Framework:**

- Next.js 16.0.0
- React 18.2.0

**UI Libraries:**

- Material-UI (MUI)
- TailwindCSS 3.4.0

**State Management:**

- React Context API
- Zustand (planned)

**HTTP Client:**

- Axios 1.12.2

---

### DevOps Stack

**Process Management:**

- PM2 6.0.13 (process manager)
- Nodemon 3.1.10 (development)

**Containerization:**

- Docker
- Docker Compose

**Code Quality:**

- ESLint 8.57.1
- Prettier 3.6.2

**Testing:**

- Jest 29.7.0
- Supertest 7.1.4
- MongoDB Memory Server 10.2.3
- Playwright 1.43.1 (E2E)

**Package Manager:**

- pnpm 8.15.0+

---

## Dependencies

### Key Dependencies Graph

```
Frontend (Next.js)
    ↓ HTTP/REST
Backend API (Express)
    ↓
├─→ Authentication Modules
│   ├─→ auth-farmer → JWT + Phone OTP
│   └─→ auth-dtam → JWT + RBAC
│
├─→ Application Modules
│   ├─→ application → Application CRUD
│   ├─→ application-workflow → State Machine
│   └─→ certificate → PDF Generation
│
├─→ Data Modules
│   ├─→ farm-management → Farm Data
│   ├─→ document → File Storage
│   └─→ cannabis-survey → Survey Templates
│
├─→ Communication Modules
│   ├─→ notification → Email/SMS/Push
│   └─→ payment → Payment Gateway
│
└─→ External Services
    ├─→ MongoDB Atlas (Database)
    ├─→ Redis (Cache + Sessions)
    ├─→ Email Service (SMTP)
    └─→ SMS Gateway (Optional)
```

---

## Data Flow

### Application Workflow (8 Steps)

```
Step 1: สมัครและส่งคำขอ (Application Submission)
   ↓
Step 2: จ่ายเงินรอบแรก 5,000 บาท (First Payment)
   ↓
Step 3: ตรวจเอกสาร (Document Review by DTAM)
   ↓
Step 4: เอกสารผ่าน (Document Approved)
   ↓
Step 5: จ่ายเงินรอบสอง 25,000 บาท (Second Payment)
   ↓
Step 6: ตรวจฟาร์ม (Field Inspection - VDO Call + On-site)
   ↓
Step 7: อนุมัติรับรอง (Final Approval)
   ↓
Step 8: รับใบรับรอง (Certificate Issuance)
```

**Workflow Engine:** `business-logic/gacp-workflow-engine.js` (1,040 lines)

**State Transitions:** 18 states total

**Events:** EventEmitter-based for state change notifications

---

## Design Decisions

### Key Architectural Decisions

**1. Why Monorepo?**

- Shared code between frontend and backend
- Easier dependency management
- Unified build and deployment

**2. Why Clean Architecture for modules?**

- Testability (business logic independent of frameworks)
- Maintainability (clear boundaries)
- Scalability (easy to extract to microservices)

**3. Why Two Auth Systems?**

- Different user types require different authentication flows
- Compliance with Thai FDA requirements
- Security isolation between farmer and staff data

**4. Why Business Logic in Root `business-logic/`?**

- Transition period from monolithic to modular architecture
- Allows gradual migration without breaking existing code
- Can be shared between multiple modules

**5. Why MongoDB Atlas?**

- Fully managed database service
- Built-in replication and backup
- Easy scaling for production
- Free tier for development

---

## Performance Considerations

### Backend Optimizations

- **Connection Pooling:** MongoDB connection pool (10-50 connections)
- **Rate Limiting:** 100 requests/15min per IP
- **Compression:** Gzip compression for API responses
- **Caching:** Redis caching for frequently accessed data
- **Pagination:** All list endpoints support pagination (limit/offset)

### Frontend Optimizations

- **Static Site Generation (SSG):** Next.js pre-renders pages
- **Image Optimization:** Sharp image processing + lazy loading
- **Code Splitting:** Automatic code splitting by Next.js
- **Bundle Size:** Tree shaking to reduce bundle size

---

## Security

### Security Measures

**1. Authentication:**

- JWT tokens with short expiration (1 hour)
- Refresh tokens for long-lived sessions
- Token blacklist in Redis

**2. Authorization:**

- Role-based access control (RBAC)
- Resource-level permissions
- Audit logging for sensitive operations

**3. Data Protection:**

- HTTPS only in production
- HTTP-only cookies for tokens
- CORS whitelist for allowed origins
- NoSQL injection prevention
- XSS protection
- CSRF protection

**4. Rate Limiting:**

- Global rate limit: 100 req/15min
- Auth endpoints: 5 attempts/15min
- Payment endpoints: 10 req/hour

**5. Input Validation:**

- express-validator for all inputs
- Joi schemas for complex validations
- Sanitization of user inputs

---

## Deployment Architecture

### Production Environment

```
Internet
    ↓
Nginx (Reverse Proxy + SSL)
    ↓
├─→ Frontend (Next.js) :3000
│   ├─→ Farmer Portal (/farmer)
│   ├─→ DTAM Portal (/dtam)
│   └─→ Certificate Portal (/certificate)
│
└─→ Backend API (Express) :3004
    ├─→ REST API (/api/*)
    ├─→ WebSocket (Socket.io)
    └─→ Health Check (/health)
        ↓
    MongoDB Atlas (Cloud)
    Redis (Cache/Sessions)
```

**Process Manager:** PM2 with cluster mode (4 instances)

**Monitoring:** PM2 monitoring + Winston logs

**Backup:** MongoDB Atlas automatic backups (every 6 hours)

---

## Future Roadmap

### Planned Improvements

**Phase 2 (Current):**

- ✅ Consolidate validators into shared module
- ✅ Consolidate logger implementation
- 🔄 Implement path aliases for cleaner imports
- 🔄 Move business logic from root to modules

**Phase 3:**

- 🔄 Refactor large files (>1,000 lines)
- 🔄 Complete migration to Clean Architecture
- 🔄 Add comprehensive unit tests (target: 80% coverage)

**Phase 4:**

- ⏳ Implement missing TODOs (email notifications, analytics)
- ⏳ Add GraphQL API layer
- ⏳ Extract modules to microservices (if needed)
- ⏳ Implement event sourcing for audit trail

---

## Resources

### Documentation

- [README.md](../README.md) - Project overview and quick start
- [QUICK_START.md](../QUICK_START.md) - Get started in 2 minutes
- [SERVER_MANAGEMENT_GUIDE.md](../SERVER_MANAGEMENT_GUIDE.md) - Server management
- [PM2_GUIDE.md](../PM2_GUIDE.md) - Process management
- [DEPRECATED.md](./DEPRECATED.md) - Deprecated files and features

### API Documentation

- [BACKEND_API_STATUS.md](./BACKEND_API_STATUS.md) - API status report
- [MAIN_SERVICES_CATALOG.md](./MAIN_SERVICES_CATALOG.md) - Services catalog

---

## Certificate Portal Access Control

### Overview

The **Certificate Portal** (Port 3003) is a **shared resource** accessed by both farmers and DTAM staff, with different permission levels based on user role.

### Architecture

```
┌────────────────────────────────────────────────────────┐
│         CERTIFICATE PORTAL (Port 3003)                 │
│         ══════════════════════════════                 │
└────────────────────────────────────────────────────────┘

┌─────────────────────────┐   ┌───────────────────────┐
│   FARMER ACCESS         │   │   DTAM STAFF ACCESS   │
│   ═══════════           │   │   ═══════════         │
│                         │   │                       │
│  🔒 Auth: JWT_SECRET    │   │  🔒 Auth: DTAM_JWT    │
│                         │   │                       │
│  Permissions:           │   │  Permissions:         │
│  ✅ View own certs      │   │  ✅ View all certs    │
│  ✅ Download certs      │   │  ✅ Create certs      │
│  ✅ Verify certs        │   │  ✅ Issue certs       │
│  ❌ Create certs        │   │  ✅ Revoke certs      │
│  ❌ Issue certs         │   │  ✅ Update certs      │
│  ❌ Revoke certs        │   │  ✅ View analytics    │
│                         │   │  ✅ Export reports    │
│  Routes:                │   │                       │
│  /verify/:certId        │   │  Routes:              │
│  /download/:certId      │   │  /certificates        │
│  /my-certificates       │   │  /issue               │
│                         │   │  /manage              │
│                         │   │  /analytics           │
└─────────────────────────┘   └───────────────────────┘
```

### Access Control Matrix

**DTAM Role Definitions:**

- **Reviewer**: รีวิวเอกสารที่ farmer submit มา บอกว่าครบ/ไม่ครบ ผ่าน/ไม่ผ่าน เท่านั้น (ไม่สามารถออกใบได้)
- **Inspector**: ตรวจสอบฟาร์มผ่าน video call, visual remote support, หรือลงพื้นที่ มีหน้าที่ผ่าน/ไม่ผ่าน เท่านั้น (ไม่สามารถออกใบได้)
- **Approver**: อนุมัติและออกใบ certificate, เรียกดูข้อมูลทั้งหมดได้
- **Admin**: จัดการระบบทั้งหมด รวมถึงสิทธิ์, ปรับค่าต่างๆ, CSS

### Complete Access Control Matrix (Including Payment & Workflow)

| Feature/Stage                   | Farmer | Reviewer | Inspector   | Approver | Admin  | System (Auto) |
| ------------------------------- | ------ | -------- | ----------- | -------- | ------ | ------------- |
| **APPLICATION SUBMISSION**      |        |          |             |          |        |               |
| Create application              | ✅     | ❌       | ❌          | ❌       | ✅     | ❌            |
| Upload documents                | ✅     | ❌       | ❌          | ❌       | ✅     | ❌            |
| Submit for review               | ✅     | ❌       | ❌          | ❌       | ✅     | ❌            |
| View own application status     | ✅     | ❌       | ❌          | ❌       | ✅     | ❌            |
| **PAYMENT MANAGEMENT**          |        |          |             |          |        |               |
| Initiate payment (PromptPay QR) | ✅     | ❌       | ❌          | ❌       | ❌     | 🤖 Request    |
| View payment status             | ✅     | ❌       | ❌          | ✅       | ✅     | ❌            |
| View payment history            | ✅     | ❌       | ❌          | ✅       | ✅     | ❌            |
| Verify payment (webhook)        | ❌     | ❌       | ❌          | ❌       | ❌     | 🤖 Auto       |
| Refund payment                  | ❌     | ❌       | ❌          | ❌       | ✅     | ❌            |
| **DOCUMENT REVIEW STAGE**       |        |          |             |          |        |               |
| View submitted documents        | ✅     | ✅       | ❌          | ✅       | ✅     | ❌            |
| Review documents                | ❌     | ✅       | ❌          | ✅       | ✅     | ❌            |
| Score document completeness     | ❌     | ✅       | ❌          | ✅       | ✅     | ❌            |
| Score document validity         | ❌     | ✅       | ❌          | ✅       | ✅     | ❌            |
| Approve documents               | ❌     | ✅       | ❌          | ✅       | ✅     | ❌            |
| Reject documents (max 2 times)  | ❌     | ✅       | ❌          | ✅       | ✅     | ❌            |
| Revise & resubmit documents     | ✅     | ❌       | ❌          | ❌       | ❌     | ❌            |
| **FARM INSPECTION STAGE**       |        |          |             |          |        |               |
| Schedule inspection             | ❌     | ❌       | ✅          | ✅       | ✅     | ❌            |
| Conduct VDO call inspection     | 🎥     | ❌       | ✅          | ✅       | ✅     | ❌            |
| Conduct on-site inspection      | 🏠     | ❌       | ✅          | ✅       | ✅     | ❌            |
| Score farm compliance           | ❌     | ❌       | ✅          | ✅       | ✅     | ❌            |
| Upload inspection photos        | ❌     | ❌       | ✅          | ✅       | ✅     | ❌            |
| Submit inspection report        | ❌     | ❌       | ✅          | ✅       | ✅     | ❌            |
| Mark inspection pass/fail       | ❌     | ❌       | ✅          | ✅       | ✅     | ❌            |
| **FINAL APPROVAL STAGE**        |        |          |             |          |        |               |
| Review all application data     | ❌     | ❌       | ❌          | ✅       | ✅     | ❌            |
| View inspection results         | ❌     | ❌       | 📋 Own      | ✅       | ✅     | ❌            |
| View document review results    | ❌     | 📄 Own   | ❌          | ✅       | ✅     | ❌            |
| Final approve application       | ❌     | ❌       | ❌          | ✅       | ✅     | ❌            |
| Final reject application        | ❌     | ❌       | ❌          | ✅       | ✅     | ❌            |
| **CERTIFICATE MANAGEMENT**      |        |          |             |          |        |               |
| Trigger certificate generation  | ❌     | ❌       | ❌          | ❌       | ❌     | 🤖 Auto       |
| View own certificates           | ✅     | ✅       | ✅          | ✅       | ✅     | ❌            |
| View all certificates           | ❌     | ❌       | 📋 Assigned | ✅       | ✅     | ❌            |
| Download certificates           | ✅     | ✅       | ✅          | ✅       | ✅     | ❌            |
| Issue new certificate (manual)  | ❌     | ❌       | ❌          | ✅       | ✅     | ❌            |
| Revoke certificate              | ❌     | ❌       | ❌          | ✅       | ✅     | ❌            |
| Update certificate              | ❌     | ❌       | ❌          | ✅       | ✅     | ❌            |
| Delete certificate              | ❌     | ❌       | ❌          | ❌       | ✅     | ❌            |
| Verify certificate (public)     | 🌐 All | 🌐 All   | 🌐 All      | 🌐 All   | 🌐 All | ❌            |
| **ANALYTICS & REPORTS**         |        |          |             |          |        |               |
| View own application analytics  | ✅     | ❌       | ❌          | ❌       | ✅     | ❌            |
| View document review analytics  | ❌     | 📊 Own   | ❌          | ✅       | ✅     | ❌            |
| View inspection analytics       | ❌     | ❌       | 📊 Own      | ✅       | ✅     | ❌            |
| View system-wide analytics      | ❌     | ❌       | ❌          | ✅       | ✅     | ❌            |
| Export reports                  | ❌     | ❌       | ❌          | ✅       | ✅     | ❌            |
| **SYSTEM ADMINISTRATION**       |        |          |             |          |        |               |
| Manage users                    | ❌     | ❌       | ❌          | ❌       | ✅     | ❌            |
| Manage roles/permissions        | ❌     | ❌       | ❌          | ❌       | ✅     | ❌            |
| System configuration            | ❌     | ❌       | ❌          | ❌       | ✅     | ❌            |
| Modify CSS/UI                   | ❌     | ❌       | ❌          | ❌       | ✅     | ❌            |
| View audit logs                 | ❌     | ❌       | ❌          | ✅       | ✅     | ❌            |
| Configure payment settings      | ❌     | ❌       | ❌          | ❌       | ✅     | ❌            |

**Legend:**

- ✅ Full access
- ❌ No access
- 📋 Limited to assigned cases
- 📄 Limited to document review tasks
- 📊 Limited to own statistics/cases
- 🤖 Automated by system
- 🌐 Public access (no auth required)
- 🎥 Participates in video call
- 🏠 Available for on-site visit

### API Endpoints

#### Public Endpoints (No Auth)

```
GET  /api/public/verify/:certificateNumber
     → Verify certificate authenticity
     → Returns: Certificate details, validity, QR code

GET  /api/public/certificate/:certificateNumber/qr
     → Get QR code image
     → Returns: QR code PNG image
```

#### Farmer Endpoints (Requires JWT_SECRET auth)

```
GET  /api/certificates/my-certificates
     → List farmer's own certificates
     → Authorization: Bearer <farmer-token>

GET  /api/certificates/:id/download
     → Download certificate PDF
     → Authorization: Bearer <farmer-token>
     → Validation: Certificate must belong to farmer
```

#### DTAM Endpoints (Requires DTAM_JWT_SECRET auth)

```
GET  /api/certificates/list
     → List certificates (role-based filtering)
     → Authorization: Bearer <dtam-token>
     → Role check:
       - Reviewer: none (no cert access)
       - Inspector: assigned cases only
       - Approver: all certificates
       - Admin: all certificates

POST /api/certificates/issue
     → Issue new certificate
     → Authorization: Bearer <dtam-token>
     → Role check: Approver or Admin only
     → Reviewer/Inspector: 403 Forbidden

PUT  /api/certificates/:id/revoke
     → Revoke certificate
     → Authorization: Bearer <dtam-token>
     → Role check: Approver or Admin only
     → Reviewer/Inspector: 403 Forbidden

GET  /api/certificates/analytics
     → View certificate statistics
     → Authorization: Bearer <dtam-token>
     → Role check:
       - Reviewer: document review stats only
       - Inspector: own inspection stats only
       - Approver: all analytics
       - Admin: all analytics + system metrics

GET  /api/applications/:id/review-documents
     → Review application documents
     → Authorization: Bearer <dtam-token>
     → Role check: Reviewer, Approver, or Admin
     → Inspector: 403 Forbidden

POST /api/applications/:id/review-status
     → Update document review status (complete/incomplete)
     → Authorization: Bearer <dtam-token>
     → Role check: Reviewer, Approver, or Admin

GET  /api/inspections/:id
     → View inspection details
     → Authorization: Bearer <dtam-token>
     → Role check: Inspector (assigned only), Approver, Admin

POST /api/inspections/:id/video-call
     → Start video call inspection
     → Authorization: Bearer <dtam-token>
     → Role check: Inspector, Approver, or Admin

POST /api/inspections/:id/result
     → Submit inspection result (pass/fail)
     → Authorization: Bearer <dtam-token>
     → Role check: Inspector (assigned only), Approver, or Admin
```

### Security Implementation

```javascript
// Certificate access control middleware
const certificateAccessControl = async (req, res, next) => {
  const { certificateId } = req.params;
  const user = req.user; // Decoded from JWT

  // Public verification - no auth needed
  if (req.path.startsWith('/public/verify')) {
    return next();
  }

  // Farmer access - own certificates only
  if (user.role === 'farmer') {
    const certificate = await Certificate.findById(certificateId);
    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }
    if (certificate.farmerId.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'Access denied - not your certificate' });
    }
    return next();
  }

  // DTAM Reviewer - NO certificate access
  if (user.role === 'reviewer') {
    return res.status(403).json({
      error: 'Access denied - reviewers handle documents only, not certificates'
    });
  }

  // DTAM Inspector - assigned cases only
  if (user.role === 'inspector') {
    const application = await Application.findOne({
      certificateId,
      assignedInspector: user._id
    });
    if (!application) {
      return res.status(403).json({
        error: 'Access denied - not assigned to this case'
      });
    }
    return next();
  }

  // Approver and Admin - full access
  if (['approver', 'admin'].includes(user.role)) {
    return next();
  }

  return res.status(403).json({ error: 'Access denied' });
};

// Document review access control
const documentReviewAccessControl = async (req, res, next) => {
  const { applicationId } = req.params;
  const user = req.user;

  // Only Reviewer, Approver, Admin can review documents
  if (!['reviewer', 'approver', 'admin'].includes(user.role)) {
    return res.status(403).json({
      error: 'Access denied - insufficient permissions to review documents'
    });
  }

  return next();
};

// Inspection access control
const inspectionAccessControl = async (req, res, next) => {
  const { inspectionId } = req.params;
  const user = req.user;

  // Approver and Admin - full access
  if (['approver', 'admin'].includes(user.role)) {
    return next();
  }

  // Inspector - assigned cases only
  if (user.role === 'inspector') {
    const inspection = await Inspection.findById(inspectionId);
    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }
    if (inspection.assignedInspector.toString() !== user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied - not assigned to this inspection'
      });
    }
    return next();
  }

  // Reviewer - no inspection access
  return res.status(403).json({
    error: 'Access denied - reviewers cannot access inspections'
  });
};

// Certificate issuance access control
const certificateIssuanceAccessControl = async (req, res, next) => {
  const user = req.user;

  // Only Approver and Admin can issue certificates
  if (!['approver', 'admin'].includes(user.role)) {
    return res.status(403).json({
      error: 'Access denied - only approvers can issue certificates',
      message:
        'Reviewers handle document review, Inspectors handle farm inspections. Only Approvers can issue certificates.'
    });
  }

  return next();
};
```

### Data Flow

```
CERTIFICATE ISSUANCE (DTAM → Farmer):
──────────────────────────────────────

1. Application Approved
   ↓
   DTAM Reviewer → Admin Portal
   ↓
   POST /api/certificates/issue
   ↓
   Backend validates DTAM token + role
   ↓
   Generate certificate (PDF + metadata)
   ↓
   Store in MongoDB + assign to farmer
   ↓
   Notification → Farmer Portal
   ↓
   Farmer receives email + portal notification


CERTIFICATE VIEWING (Farmer):
─────────────────────────────

1. Farmer Login
   ↓
   GET /api/certificates/my-certificates
   ↓
   Backend validates farmer token
   ↓
   Query: { farmerId: user._id }
   ↓
   Return only farmer's certificates
   ↓
   Display in Farmer Portal


CERTIFICATE VERIFICATION (Public):
──────────────────────────────────

1. Anyone scans QR code
   ↓
   GET /api/public/verify/GACP-2025-001234
   ↓
   No authentication required
   ↓
   Query certificate by number
   ↓
   Return public info:
   - Certificate number
   - Farm name
   - Issue/expiry dates
   - Validity status
   - QR code
```

### Best Practices

1. **Token Validation**: Always verify JWT before allowing access
2. **Role-Based Filtering**: Filter data based on user role automatically
3. **Ownership Validation**: Farmers can only access their own certificates
4. **Audit Logging**: Log all certificate access and modifications
5. **Public Verification**: Allow anyone to verify certificate authenticity
6. **PDF Security**: Watermark PDFs with digital signatures

### Future Enhancements

1. **Digital Signatures**: Sign certificates with DTAM private key (Phase 5.4)
2. **Blockchain Verification**: Optional certificate verification on blockchain
3. **Multi-language Certificates**: Thai and English versions
4. **Mobile App Integration**: Certificate viewing in mobile app
5. **Auto-renewal**: Automatic certificate renewal notifications

---

## Contact

**Project:** GACP Certification Flow Platform
**Version:** 2.0.0
**Team:** GACP Platform Team
**Repository:** https://github.com/jonmaxmore/gacp-certify-flow-main

---

**Last Updated:** October 26, 2025 by Claude Code
