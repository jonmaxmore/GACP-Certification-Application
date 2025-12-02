# Existing Modules Inventory

**Last Updated:** 2025-10-28
**Purpose:** Prevent duplicate development by documenting all existing modules and their capabilities

---

## Backend Modules (apps/backend/modules/)

### ✅ Core Authentication & Authorization

#### 1. **auth-farmer** (Complete)

- **Location:** [apps/backend/modules/auth-farmer](apps/backend/modules/auth-farmer)
- **Purpose:** Farmer self-registration and authentication
- **Features:**
  - User registration with email verification
  - JWT-based authentication
  - Password reset and change functionality
  - Profile management
- **Database Models:** FarmerUser
- **Routes:** `/api/auth/farmer/*`
- **Status:** Production-ready

#### 2. **auth-dtam** (Complete)

- **Location:** [apps/backend/modules/auth-dtam](apps/backend/modules/auth-dtam)
- **Purpose:** Government officer (DTAM) authentication
- **Features:**
  - Role-based authentication (Inspector, Reviewer, Approver, Admin)
  - Separate JWT secret for security isolation
  - Session management with Redis
  - Multi-factor authentication ready
- **Database Models:** DTAMUser
- **Routes:** `/api/auth/dtam/*`
- **Status:** Production-ready

---

### ✅ Certification Workflow

#### 3. **application** (Complete)

- **Location:** [apps/backend/modules/application](apps/backend/modules/application)
- **Purpose:** GACP certification application management
- **Features:**
  - Application submission and tracking
  - Document attachment handling
  - Application status management
  - Search and filtering
  - Payment integration
- **Database Models:** Application, ApplicationDocument
- **Routes:** `/api/applications/*`
- **Status:** Production-ready
- **Note:** Supports cannabis as primary crop + 5 medicinal plants

#### 4. **application-workflow** (Complete)

- **Location:** [apps/backend/modules/application-workflow](apps/backend/modules/application-workflow)
- **Purpose:** Multi-stage approval workflow engine
- **Features:**
  - State machine for application stages
  - Role-based task assignment
  - Workflow history and audit trail
  - Automated notifications on stage transitions
  - Parallel and sequential workflow support
- **Workflow Stages:**
  1. Draft → Submitted
  2. Document Review (Reviewer)
  3. Field Inspection (Inspector) - 2 phases
  4. Final Approval (Approver)
  5. Certificate Issuance
- **Routes:** `/api/workflow/*`
- **Status:** Production-ready

#### 5. **certificate-management** (Complete)

- **Location:** [apps/backend/modules/certificate-management](apps/backend/modules/certificate-management)
- **Purpose:** Certificate issuance and lifecycle management
- **Features:**
  - Certificate generation with unique numbers
  - QR code generation for verification
  - Certificate expiry tracking
  - Renewal process
  - Certificate revocation
  - PDF generation
- **Database Models:** Certificate
- **Routes:** `/api/certificates/*`
- **Status:** Production-ready

---

### ✅ Farm & Cultivation Management

#### 6. **farm-management** (Complete)

- **Location:** [apps/backend/modules/farm-management](apps/backend/modules/farm-management)
- **Purpose:** Farm registration and operations tracking
- **Features:**
  - Farm profile management
  - Field/plot management
  - Crop lifecycle tracking
  - Cultivation cycle recording
  - Harvest tracking
  - IoT sensor integration
- **Database Models:** Farm, Field, CultivationCycle, HarvestRecord
- **Plant Support:** Cannabis (primary) + turmeric, ginger, black galingale, plai, kratom
- **Routes:** `/api/farms/*`
- **Status:** Production-ready

---

### ✅ Document & Content Management

#### 7. **document-management** (Integrated)

- **Location:** Integrated within application module
- **Purpose:** Document upload, validation, and storage
- **Features:**
  - Multi-file upload with progress tracking
  - File type validation (magic byte verification)
  - Size limits enforcement
  - Document categorization
  - Version control
  - Secure storage (local/S3-compatible)
- **Supported Types:** PDF, JPG, PNG, DOCX
- **Max Size:** 10MB per file
- **Status:** Production-ready

---

### ✅ Analytics & Reporting

#### 8. **dashboard** (Complete)

- **Location:** [apps/backend/modules/dashboard](apps/backend/modules/dashboard)
- **Purpose:** Real-time analytics and KPI dashboards
- **Features:**
  - Application statistics by status
  - Regional breakdowns
  - Approval rates and trends
  - Inspector performance metrics
  - Revenue tracking
  - Cannabis-first metrics ordering
- **Routes:** `/api/dashboard/*`
- **Status:** Production-ready

#### 9. **reporting-analytics** (Complete)

- **Location:** Integrated in backend services
- **Purpose:** Advanced analytics and insights
- **Features:**
  - Custom report generation
  - Data export (CSV, Excel, PDF)
  - Scheduled reports
  - Compliance analytics
  - Trend analysis
- **Status:** Production-ready

---

### ✅ Notifications & Communications

#### 10. **notification** (Complete)

- **Location:** [apps/backend/modules/notification](apps/backend/modules/notification)
- **Purpose:** Multi-channel notification system
- **Features:**
  - Email notifications (Nodemailer)
  - SMS notifications (Thai SMS gateways)
  - LINE Notify integration
  - Real-time notifications (Socket.IO)
  - Notification templates (Thai/English)
  - Delivery tracking
- **Notification Events:**
  - Application status changes
  - Document verification results
  - Inspection scheduling
  - Payment confirmations
  - Certificate issuance
- **Routes:** `/api/notifications/*`
- **Status:** Production-ready

---

### ✅ Payment Processing

#### 11. **payment-service** (Complete)

- **Location:** Integrated in backend services
- **Purpose:** Payment collection and tracking
- **Payment Structure:**
  - **Phase 1:** 5,000 THB (Application fee)
  - **Phase 2:** 25,000 THB (Certification fee)
  - **Total:** 30,000 THB
- **Features:**
  - Payment gateway integration (Stripe/Thai gateways)
  - Payment verification
  - Receipt generation
  - Refund processing
  - Payment history
- **Routes:** `/api/payments/*`
- **Status:** Production-ready

---

### ✅ Compliance & Standards

#### 12. **standards-comparison** (Complete)

- **Location:** [apps/backend/modules/standards-comparison](apps/backend/modules/standards-comparison)
- **Purpose:** GACP standards knowledge base
- **Features:**
  - Multi-standard comparison (WHO, EMA, Thailand)
  - Requirement mapping
  - Compliance gap analysis
  - Standard versioning
  - Cannabis-specific requirements
- **Supported Standards:**
  - WHO GACP Guidelines
  - EMA GACP Guidelines
  - Thailand GACP Standards (DTAM)
  - GMP Guidelines
- **Routes:** `/api/standards/*`
- **Status:** Production-ready

#### 13. **audit** (Complete)

- **Location:** [apps/backend/modules/audit](apps/backend/modules/audit)
- **Purpose:** Comprehensive audit logging
- **Features:**
  - Full activity tracking
  - Change history
  - User action logs
  - Compliance audit trails
  - Government integration APIs
- **Routes:** `/api/audit/*`
- **Status:** Production-ready

---

### ✅ Survey & Data Collection

#### 14. **survey-system** (Complete)

- **Location:** [apps/backend/modules/survey-system](apps/backend/modules/survey-system)
- **Purpose:** Cannabis compliance surveys
- **Features:**
  - Dynamic survey builder
  - Response collection
  - Survey analytics
  - Conditional logic
  - Multi-language support (Thai/English)
- **Routes:** `/api/surveys/*`
- **Status:** Production-ready

---

### ✅ Traceability & QR Codes

#### 15. **track-trace** (Complete)

- **Location:** [apps/backend/modules/track-trace](apps/backend/modules/track-trace)
- **Purpose:** Seed-to-sale traceability
- **Features:**
  - QR code generation for products
  - Batch tracking
  - Chain of custody
  - Public verification endpoints
  - Cannabis supply chain tracking
- **Routes:** `/api/tracktrace/*`
- **Status:** Production-ready

---

### ✅ AI & Smart Recommendations

#### 16. **AI Fertilizer Recommendation Engine** (Complete)

- **Location:** [apps/backend/services/ai/fertilizer-recommendation.service.js](apps/backend/services/ai/fertilizer-recommendation.service.js)
- **Purpose:** Intelligent fertilizer recommendations
- **Features:**
  - NPK calculation based on growth stage
  - Soil nutrient analysis
  - Cannabis-specific formulations
  - Organic fertilizer database
  - GACP-compliant recommendations
- **Routes:** `/api/ai/fertilizer/*`
- **Status:** Production-ready (Live)

#### 17. **AI Irrigation Modeling** (In Progress - 70%)

- **Location:** Planned in AI services
- **Purpose:** Smart irrigation scheduling
- **Features:**
  - Water requirement calculation
  - Weather-based adjustments
  - Soil moisture monitoring
  - Growth stage considerations
- **Status:** In Development

#### 18. **NLP Crop Guidance** (In Progress - 60%)

- **Location:** Planned in AI services
- **Purpose:** Natural language processing for crop advice
- **Features:**
  - Chatbot for farmer questions
  - Disease diagnosis from descriptions
  - Pest identification
- **Status:** In Development

---

## Frontend Applications

### ✅ 1. **Farmer Portal** (100% Complete)

- **Location:** [apps/farmer-portal](apps/farmer-portal)
- **Framework:** Next.js 15.1.3, React 18.3.1, TypeScript 5.7.2
- **Routes:** 31 fully functional routes
- **Key Features:**
  - User registration & login
  - Application submission (cannabis-first)
  - Farm management
  - Document upload
  - Payment processing
  - Certificate download
  - Real-time notifications
  - Multi-role dashboards
- **Test Coverage:** 527/540 tests passing (97.6%)
- **Status:** Production-ready

### ⚠️ 2. **Admin Portal** (40-60% Complete)

- **Location:** [apps/admin-portal](apps/admin-portal)
- **Framework:** Next.js 15.1.3
- **Routes:** 2 routes (needs expansion)
- **Implemented:**
  - Admin dashboard structure
  - Basic UI components
  - Test framework
- **Needs Work:**
  - User management UI
  - System configuration pages
  - Analytics dashboards
  - Reports generation UI
- **Status:** Partial implementation

### ⚠️ 3. **Certificate Portal** (60% Complete)

- **Location:** [apps/certificate-portal](apps/certificate-portal)
- **Framework:** Next.js 15.1.3
- **Implemented:**
  - Certificate verification page
  - QR code scanning
  - Basic certificate display
  - Test framework
- **Needs Work:**
  - Certificate management UI
  - Advanced search
  - Bulk operations
  - Export features
- **Status:** Partial implementation

### ⚠️ 4. **Legacy Frontend** (Deprecated)

- **Location:** [apps/frontend](apps/frontend)
- **Status:** Being phased out - DO NOT enhance
- **Note:** Reference only, prefer Next.js apps

---

## Data Models & Database

### Core Models (MongoDB)

1. **PlantCatalog** - Cannabis + 5 medicinal plants knowledge base
   - Location: [apps/backend/models/PlantCatalog.js](apps/backend/models/PlantCatalog.js)
   - **Cannabis Priority:** `isPrimaryCrop: true`
   - Contains: Growth stages, nutrient requirements, environmental conditions, GACP requirements

2. **Application** - GACP certification applications
3. **Certificate** - Issued certificates
4. **Farm** - Farm registrations
5. **User** - Farmers and DTAM officers
6. **CultivationCycle** - Crop cultivation tracking
7. **Document** - Uploaded documents
8. **Notification** - Notification queue
9. **Payment** - Payment records
10. **AuditLog** - System audit trails

---

## Competitor Analysis Summary

### Global GACP Certification Platforms

#### 1. **CSQ 2.0 Certification Program** (Canada/USA)

- **Launch:** October 2025
- **Features:**
  - Accredited cGACP and cGMP certification
  - Level-based system for different operator types
  - Covers cultivation, retail, and distribution
- **Strengths:** Fully accredited, comprehensive coverage
- **Target Markets:** North America

#### 2. **Q-Cert GACP** (Europe)

- **Accreditation:** ISO 17065 by Hellenic Accreditation Body
- **Standards:** EU GACP + WHO Guidelines
- **Strengths:** European market access
- **Target Markets:** EU, international

#### 3. **SGS GACP Medical Cannabis Certification** (Global)

- **Provider:** SGS (Swiss-based global certifier)
- **Features:**
  - Full supply chain certification
  - Primary production through transportation
  - Global recognition
- **Strengths:** Established reputation, international presence

#### 4. **Control Union Medical Cannabis Standard (CUMCS-GAP)** (Global)

- **Compliance:** WHO + EMA GACP Guidelines
- **Certification:** Dual certificate (CUMCS-GAP + GACP)
- **Coverage:** Propagation, cultivation, post-harvest
- **Target Markets:** EU, Australia, Israel, Canada

### Blockchain Traceability Platforms

#### **HerBChain** (Hong Kong/China)

- **Technology:** Blockchain-based platform for herbal products
- **Features:**
  - QR code verification
  - 6-stage traceability (plantation → retail)
  - Mobile app for consumers
  - Immutable record-keeping
- **Strengths:** End-to-end transparency, consumer trust

#### **Traditional Chinese Medicine (TCM) Systems**

- **Features:**
  - Blockchain for anti-counterfeiting
  - Full supply chain tracking
  - Hospital integration
  - Patient-level traceability
- **Strengths:** Regulatory compliance, fraud prevention

---

## Key Differentiators for GACP Platform

### ✅ What We Have That Competitors Don't

1. **Cannabis-First Design**
   - Entire platform optimized for cannabis workflows
   - Cannabis listed first in all menus and forms
   - Cannabis-specific GACP requirements built-in

2. **6 Medicinal Plants Support**
   - Integrated knowledge base for cannabis + 5 medicinal plants
   - Multi-crop comparison and analytics
   - Regional suitability analysis

3. **AI-Powered Recommendations**
   - Fertilizer recommendation engine (LIVE)
   - Irrigation modeling (in progress)
   - NLP crop guidance (in progress)

4. **Integrated IoT & Smart Farming**
   - Real-time sensor data (soil, water, climate)
   - Automated alerting
   - Farm operation dashboards

5. **2-Phase Inspection Workflow**
   - Unique VDO call + On-site inspection
   - Blitzz video integration
   - Inspector mobile tools

6. **Complete Digital Ecosystem**
   - 3 specialized portals (Farmer, Admin, Certificate)
   - End-to-end workflow automation
   - Multi-role support (Farmer, Inspector, Reviewer, Approver, Admin)

7. **Thailand-Specific Compliance**
   - DTAM standards integration
   - Thai regulatory requirements
   - Regional data (provinces, climate zones)
   - Bilingual (Thai/English)

8. **Blockchain-Ready Traceability**
   - QR code-based verification
   - Seed-to-sale tracking
   - Public verification endpoints
   - Ready for blockchain integration

---

## Development Guidelines

### Before Adding New Features:

1. **Check This Inventory First**
   - Does a similar module already exist?
   - Can existing modules be extended instead?

2. **Review Existing Code**
   - Read module README files
   - Check database models
   - Review API routes

3. **Refactor Before Adding**
   - Fix and enhance existing modules first
   - Update documentation
   - Add missing tests

4. **Cannabis-First Requirement**
   - Ensure cannabis is listed first in ALL:
     - Dropdown menus
     - Form options
     - Table displays
     - Analytics dashboards
     - Export formats
   - See: [docs/compliance/cannabis-first-checklist.md](docs/compliance/cannabis-first-checklist.md)

5. **Documentation Requirements**
   - Update this inventory when adding modules
   - Create/update module README
   - Document API endpoints
   - Add to architecture diagrams

---

## Module Status Legend

- ✅ **Complete** - Production-ready, fully tested
- 🔄 **In Progress** - Active development
- ⚠️ **Partial** - Needs completion or enhancement
- 📋 **Planned** - Scheduled for future phases
- 🗑️ **Deprecated** - Being phased out

---

## Next Steps

### Immediate Priorities:

1. **Complete Admin Portal** (20-30 hours)
   - User management UI
   - System configuration
   - Analytics dashboards

2. **Complete Certificate Portal** (10-15 hours)
   - Certificate management UI
   - Search and filtering
   - Bulk operations

3. **Verify Cannabis-First Compliance** (5-10 hours)
   - Audit all forms and menus
   - Update plant species ordering
   - Test across all portals

4. **AI Features Completion** (Phase 3)
   - Finish irrigation modeling
   - Complete NLP crop guidance
   - Integrate with farmer portal

### Future Phases:

- **Phase 4:** Mobile inspector app, government integrations
- **Phase 5:** Advanced supply chain, marketplace, cooperative services

---

**Maintained By:** Development Team
**Review Frequency:** Weekly during active development
**Last Major Update:** 2025-10-28
