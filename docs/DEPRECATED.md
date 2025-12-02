# Deprecated Files and Features

**Last Updated:** November 4, 2025 (Phase 4 - Business Logic Cleanup + Code Similarity Audit)
**Platform Version:** 2.0.0

---

## Purpose

This document tracks all deprecated files, directories, features, and APIs in the GACP Platform. It helps developers avoid using outdated code and provides migration paths to current implementations.

---

## 📋 Changelog

### November 4, 2025 - Phase 4 + Code Similarity Audit
- ✅ Archived 13 unused business-logic files (7,950 lines)
- ✅ Migrated gacp-workflow-engine.js to modules
- ✅ Created comprehensive code similarity audit report
- ✅ Identified 55 duplicate/similar component pairs
- ✅ Established base component refactoring roadmap

### November 4, 2025 - Phase 3 Documentation
- ✅ Documented 13 unused business logic files
- ✅ Analyzed 16 active legacy routes
- ✅ Identified 3 overlapping application routes

### November 4, 2025 - Phase 2 Warning Fixes
- ✅ Deleted unused logger (apps/backend/src/utils/logger.js)
- ✅ Clarified architecture patterns (not duplicates)

### November 4, 2025 - Phase 1 Critical Fixes
- ✅ Deleted 4 duplicate files
- ✅ Consolidated validation functions
- ✅ Removed stub controller

### October 26, 2025 - Initial Archive
- ✅ Archived legacy backend directory (121 MB)

---

## 🗑️ Archived Directories

### 1. Legacy Backend Directory

**Path:** `backend.archived.2025-10-26/backend/`

**Original Path:** `backend/` (root level)

**Archived Date:** October 26, 2025

**Reason:** Replaced by `apps/backend/` with Clean Architecture

**Size:** 121 MB (including node_modules)

**Contents:**

- Legacy backend code structure
- Old service implementations
- Duplicate authentication system
- Standards comparison module
- Survey system module

**Migration:** All functionality migrated to `apps/backend/modules/`

**Status:** ❌ DO NOT USE

**Safe to Delete:** Yes (after verifying no external references)

---

### 2. Root-Level Unused Files

**Path:** `backend.archived.2025-10-26/root-unused-files/`

**Archived Date:** October 26, 2025

**Files Archived:**

#### `app.js` (55 KB, 1,705 lines)

- **Original Purpose:** Main application entry point
- **Replaced By:** `apps/backend/atlas-server.js`
- **Reason:** Superseded by modular atlas-server with better structure
- **Last Modified:** October 21, 2025

#### `robust-server.js` (4.3 KB)

- **Original Purpose:** Robust server with error handling
- **Replaced By:** `apps/backend/atlas-server.js` (includes robustness)
- **Reason:** Functionality merged into main server
- **Last Modified:** October 21, 2025

#### `.prettierrc.json` (172 bytes)

- **Original Purpose:** Prettier configuration (basic)
- **Replaced By:** `.prettierrc` (864 bytes, more complete)
- **Reason:** Consolidated to single, comprehensive config
- **Settings:** printWidth: 80 (too narrow)

#### `.prettierrc.js` (450 bytes)

- **Original Purpose:** Prettier configuration (with overrides)
- **Replaced By:** `.prettierrc` (864 bytes, most complete)
- **Reason:** Consolidated to single, comprehensive config
- **Settings:** printWidth: 100, basic overrides

**Migration:** Use `.prettierrc` for all formatting

**Status:** ❌ DO NOT USE

---

## 📂 Deprecated Files (In Active Codebase)

### Legacy Routes (Being Migrated)

**Path:** `apps/backend/routes/`

**Status:** 🟡 LEGACY - Still active but being replaced

**Files:**

| File                         | Status     | Replacement                                      | Migration Priority |
| ---------------------------- | ---------- | ------------------------------------------------ | ------------------ |
| `routes/auth.js`             | 🔄 Migrate | `modules/auth-farmer/` + `modules/auth-dtam/`    | HIGH               |
| `routes/applications.js`     | 🔄 Migrate | `modules/application/`                           | HIGH               |
| `routes/farm-management.js`  | 🔄 Migrate | `modules/farm-management/`                       | MEDIUM             |
| `routes/cannabis-surveys.js` | 🔄 Migrate | `modules/cannabis-survey/`                       | MEDIUM             |
| `routes/compliance.js`       | 🔄 Migrate | `modules/application-workflow/`                  | MEDIUM             |
| `routes/dashboard.js`        | 🔄 Migrate | `modules/notification/` + `modules/application/` | LOW                |

**Migration Guide:**

1. Review route handler logic
2. Extract business logic to domain services
3. Move to appropriate module's `presentation/routes/`
4. Update API client to use new endpoints
5. Test thoroughly
6. Deprecate old route
7. Remove after 1-2 releases

---

### Legacy Models (Centralized)

**Path:** `apps/backend/models/`

**Status:** 🟡 ACTIVE - But should be moved to module infrastructure

**Issue:** Models are centralized instead of being in module's `infrastructure/models/`

**Affected Files:**

| Model            | Current Location | Should Be In                                                                              | Priority |
| ---------------- | ---------------- | ----------------------------------------------------------------------------------------- | -------- |
| `Application.js` | `models/`        | `modules/application/infrastructure/models/`                                              | HIGH     |
| `Farm.js`        | `models/`        | `modules/farm-management/infrastructure/models/`                                          | MEDIUM   |
| `User.js`        | `models/`        | `modules/auth-farmer/infrastructure/models/` + `modules/auth-dtam/infrastructure/models/` | HIGH     |
| `Certificate.js` | `models/`        | `modules/certificate/infrastructure/models/`                                              | MEDIUM   |
| `Survey.js`      | `models/`        | `modules/cannabis-survey/infrastructure/models/`                                          | MEDIUM   |
| `Payment.js`     | `models/`        | `modules/payment/infrastructure/models/`                                                  | LOW      |

**Note:** Some modules already have duplicate models in their infrastructure layer. Need to consolidate.

---

### Duplicate Validators

**Status:** 🔴 CRITICAL - Multiple validators doing same job

**Issue:** Validators scattered across:

- `apps/backend/middleware/validation.js`
- `apps/backend/shared/validation.js`
- `apps/backend/modules/*/validators/`
- `apps/backend/modules/*/presentation/validators/`

**Duplicates Found:**

| Validator              | Locations                                                           | Should Be                                    |
| ---------------------- | ------------------------------------------------------------------- | -------------------------------------------- |
| Auth validators        | `auth-validators.js`, `auth.validator.js` (2 files in same module!) | `shared/validators/auth.validator.js`        |
| Farm validators        | `farm-management.validators.js`, `farm.validator.js`                | `shared/validators/farm.validator.js`        |
| Survey validators      | `survey.validators.js`, `survey.validator.js`                       | `shared/validators/survey.validator.js`      |
| Application validators | Multiple files                                                      | `shared/validators/application.validator.js` |

**Target Structure:**

```
apps/backend/shared/validators/
├── auth.validator.js        # All auth validation
├── application.validator.js # All application validation
├── farm.validator.js        # All farm validation
├── survey.validator.js      # All survey validation
└── index.js                 # Export all validators
```

**Migration:** Phase 2 of cleanup (Week 2-3)

---

## 📦 Business Logic Files (Transition State)

**Path:** `business-logic/` (root level)

**Status:** 🟡 ACTIVE - But should be in modules

**Migration Target:** `apps/backend/modules/{module}/domain/services/`

### Currently Used Files

#### `gacp-workflow-engine.js` (1,040 lines)

- **Status:** ✅ ACTIVE (Imported by 3 files)
- **Used By:**
  - `apps/backend/atlas-server.js:39`
  - `apps/backend/routes/gacp-business-logic.js:27`
  - `apps/backend/services/gacp-enhanced-inspection.js:24`
- **Should Move To:** `modules/application-workflow/domain/services/WorkflowEngine.js`
- **Priority:** HIGH
- **Complexity:** High (split into smaller services)

### Prepared But Not Yet Used

#### `gacp-ai-assistant-system.js` (1,481 lines)

- **Status:** 🔄 PREPARED (Not yet integrated)
- **Purpose:** AI-powered assistant for farmers and staff
- **Should Move To:** `modules/ai-assistant/domain/services/`
- **Priority:** LOW (not critical for v2.0)

#### `gacp-standards-comparison-system.js` (1,451 lines)

- **Status:** 🔄 PREPARED (Module exists in archived backend)
- **Purpose:** Compare farm practices with GACP standards
- **Should Move To:** `modules/standards-comparison/domain/services/`
- **Priority:** MEDIUM

#### `gacp-visual-remote-support-system.js` (1,234 lines)

- **Status:** 🔄 PREPARED (Not yet integrated)
- **Purpose:** Video call support for inspections
- **Should Move To:** `modules/inspection/domain/services/`
- **Priority:** MEDIUM

#### `gacp-survey-system.js` (1,137 lines)

- **Status:** 🔄 PREPARED (Partially used by cannabis-survey module)
- **Purpose:** Survey template and response management
- **Should Move To:** `modules/cannabis-survey/domain/services/`
- **Priority:** HIGH

#### Other Business Logic Files:

- `gacp-certificate-generator.js` → `modules/certificate/domain/services/`
- `gacp-document-review-system.js` → `modules/document/domain/services/`
- `gacp-field-inspection-system.js` → `modules/inspection/domain/services/`
- `gacp-dashboard-notification-system.js` → `modules/notification/domain/services/`
- `gacp-business-rules-engine.js` → `modules/application/domain/services/`
- `gacp-status-manager.js` → `modules/application-workflow/domain/services/`
- `gacp-digital-logbook-system.js` → `modules/farm-management/domain/services/`
- `gacp-sop-wizard-system.js` → `modules/farm-management/domain/services/`
- `system-integration-hub.js` → `shared/services/`

**Total:** 14 files, ~15,000 lines of code

**Migration Priority:** ✅ **COMPLETED** (Phase 4 - November 4, 2025)

**Actions Taken (Phase 4):**
- ✅ Created `business-logic.archived/` directory
- ✅ Moved 13 unused files to archive (7,950 lines)
- ✅ Migrated `gacp-workflow-engine.js` to `modules/application-workflow/domain/`
- ✅ Updated 3 imports to new module path:
  - `apps/backend/atlas-server.js`
  - `apps/backend/services/gacp-enhanced-inspection.js`
  - `apps/backend/routes/gacp-business-logic.js`

**Archived Files (13 total):**
1. ✅ `gacp-ai-assistant-system.js` (1,285 lines) → `business-logic.archived/`
2. ✅ `gacp-business-rules-engine.js` (0 lines) → `business-logic.archived/`
3. ✅ `gacp-certificate-generator.js` (481 lines) → `business-logic.archived/`
4. ✅ `gacp-dashboard-notification-system.js` (668 lines) → `business-logic.archived/`
5. ✅ `gacp-digital-logbook-system.js` (895 lines) → `business-logic.archived/`
6. ✅ `gacp-document-review-system.js` (680 lines) → `business-logic.archived/`
7. ✅ `gacp-field-inspection-system.js` (644 lines) → `business-logic.archived/`
8. ✅ `gacp-sop-wizard-system.js` (722 lines) → `business-logic.archived/`
9. ✅ `gacp-standards-comparison-system.js` (1,305 lines) → `business-logic.archived/`
10. ✅ `gacp-status-manager.js` (508 lines) → `business-logic.archived/`
11. ✅ `gacp-survey-system.js` (1,018 lines) → `business-logic.archived/`
12. ✅ `gacp-visual-remote-support-system.js` (1,060 lines) → `business-logic.archived/`
13. ✅ `system-integration-hub.js` (684 lines) → `business-logic.archived/`

**Migrated Files (1 total):**
- ✅ `gacp-workflow-engine.js` (869 lines)
  - **From:** `business-logic/gacp-workflow-engine.js`
  - **To:** `apps/backend/modules/application-workflow/domain/gacp-workflow-engine.js`
  - **Used by:** 3 files (atlas-server.js, gacp-enhanced-inspection.js, gacp-business-logic.js)

**Result:**
- `business-logic/` directory now empty (ready for removal or future use)
- Workflow engine properly located in domain layer
- All imports updated successfully
- 7,950 lines archived
- Clean Architecture structure reinforced

---

## 💾 Business Logic Archive Details

### Archive Directory

**Path:** `business-logic.archived/`

**Created:** November 4, 2025

**Reason:** Unused business logic from early development phase

**Total Size:** 13 files, 7,950 lines of code

**Safe to Delete:** After 6-month retention period (May 2026)

**Purpose of Archived Files:**

| File | Purpose | Status | Future |
|------|---------|--------|--------|
| gacp-ai-assistant-system.js | AI assistant integration | Not implemented | May implement in v3.0 |
| gacp-certificate-generator.js | Certificate generation | Replaced by module | Deprecated |
| gacp-dashboard-notification-system.js | Notification system | Not integrated | Use notification module |
| gacp-digital-logbook-system.js | Farm logbook feature | Not developed | May implement later |
| gacp-document-review-system.js | Document review | Replaced by module | Deprecated |
| gacp-field-inspection-system.js | Field inspection | Replaced by module | Deprecated |
| gacp-sop-wizard-system.js | SOP wizard feature | Not developed | May implement later |
| gacp-standards-comparison-system.js | Standards comparison | Replaced by module | Deprecated |
| gacp-status-manager.js | Status management | Replaced by workflow | Deprecated |
| gacp-survey-system.js | Survey system | Not integrated | Use cannabis-survey module |
| gacp-visual-remote-support-system.js | Remote support | Not developed | Future feature |
| system-integration-hub.js | System integration | Not needed | Deprecated |
| gacp-business-rules-engine.js | Rules engine | Empty file | Deprecated |

---

## 🔄 Code Similarity Audit (Phase 4)

### Duplicate/Similar Components Identified

**Audit Date:** November 4, 2025  
**Report:** `CODE_SIMILARITY_AUDIT_REPORT.md`  
**Total Files Scanned:** 596  
**Duplicate Pairs Found:** 55

#### Critical Priority (12 pairs) - 85-95% Similar

1. **Approval/Review Action Modals (92% similar)**
   - `apps/farmer-portal/components/ApprovalActionModal.tsx` (426 lines)
   - `apps/farmer-portal/components/ReviewActionModal.tsx` (314 lines)
   - `apps/admin-portal/components/applications/ReviewDialog.tsx` (250 lines)
   - **Recommendation:** Create `BaseActionModal` component
   - **Estimated Reduction:** 70% (~700 lines)

2. **User Form Dialogs (88% similar)**
   - `apps/admin-portal/components/users/UserFormDialog.tsx` (346 lines)
   - `apps/frontend/components/admin/UserManagementDialog.tsx` (~300 lines)
   - **Recommendation:** Create `BaseUserForm` component
   - **Estimated Reduction:** 72% (~450 lines)

3. **Payment Modals (85% similar)**
   - `apps/farmer-portal/components/PaymentModal.tsx` (391 lines)
   - `apps/frontend/components/payment/PaymentFormDialog.tsx` (~350 lines)
   - **Recommendation:** Create `BasePaymentModal` component
   - **Estimated Reduction:** 68% (~500 lines)

4. **Consent/Agreement Modals (90% similar)**
   - `apps/frontend/components/farmer/application/shared/ApplicationConsentModal.tsx` (364 lines)
   - `apps/farmer-portal/components/TermsConsentDialog.tsx` (~300 lines)
   - **Recommendation:** Create `BaseConsentModal` component
   - **Estimated Reduction:** 72% (~470 lines)

5. **Address Forms (95% similar)**
   - `apps/frontend/components/farmer/application/shared/AddressForm.tsx`
   - `apps/admin-portal/components/forms/ThaiAddressForm.tsx`
   - `apps/farmer-portal/components/AddressInput.tsx`
   - **Recommendation:** Create single `ThaiAddressForm` component
   - **Estimated Reduction:** 73% (~550 lines)

6. **Wizard/Stepper Forms (82% similar)**
   - `apps/frontend/components/gacp/GACPApplicationWizard.tsx` (1,189 lines)
   - `apps/frontend/components/gacp/GACPSOPWizard.tsx` (702 lines)
   - **Recommendation:** Create `BaseWizard` component
   - **Estimated Reduction:** 63% (~1,200 lines)

**Total Estimated Code Reduction:** 7,100 lines (-73%)

**Next Steps:**
1. Phase 1: Create base modal components (Week 1-2)
2. Phase 2: Create base form components (Week 3)
3. Phase 3: Refactor UI patterns (Week 4)
4. Phase 4: Centralize validation & hooks (Week 5)

---

## 📊 Phase 4 Summary Statistics

### Code Cleanup Progress

| Phase | Status | Files Deleted | Files Archived/Moved | Files Enhanced | Code Reduction |
|-------|--------|---------------|---------------------|----------------|----------------|
| Phase 1 (Critical) | ✅ Complete | 4 | 0 | 1 | 400 lines |
| Phase 2 (Warning) | ✅ Complete | 1 | 0 | 0 | 50 lines |
| Phase 3 (Analysis) | ✅ Complete | 0 | 0 | 1 (report) | 0 lines |
| Phase 4 (Cleanup) | ✅ Complete | 0 | 14 | 3 | 7,950 lines |
| **TOTAL** | **✅ 4/4 Complete** | **5** | **14** | **5** | **8,400 lines** |

### Component Similarity Analysis

| Component Type | Files | Total Lines | Duplicated Lines | % Duplicate |
|----------------|-------|-------------|------------------|-------------|
| Action Modals | 8 | 2,850 | 2,400 | 84% |
| User Forms | 6 | 1,900 | 1,600 | 84% |
| Address Forms | 3 | 750 | 700 | 93% |
| Payment Forms | 4 | 1,400 | 1,100 | 79% |
| Consent Modals | 3 | 900 | 800 | 89% |
| Wizards | 2 | 1,900 | 1,400 | 74% |
| **TOTAL** | **26** | **9,700** | **8,000** | **82%** |

**Potential Savings After Refactoring:** 7,100 lines (-73%)

---

## 🎯 Future Migration Roadmap

### Phase 5: Routes Consolidation (Future)

**Migration Priority:** ✅ **COMPLETED** (Phase 4 - November 4, 2025)

---

## 🔧 Deprecated Configuration Files

### Environment Files

**Deprecated:**

- `.env.sprint1` - Only for Sprint 1 development
- `.env.cloud-example` - Redundant with `.env.production.template`

**Current:**

- `.env.example` - For frontend development
- `.env.production.template` - For backend production (8.4 KB, comprehensive)

**Action:** Keep only example and production.template

---

### Prettier Configuration

**Deprecated:**

- ✅ `.prettierrc.json` (archived) - Basic config, printWidth: 80
- ✅ `.prettierrc.js` (archived) - Intermediate config

**Current:**

- `.prettierrc` - Complete config with markdown support, printWidth: 100

**Action:** ✅ Completed (archived on Oct 26, 2025)

---

### ESLint Configuration

**Status:** ⚠️ Multiple configs but all in use

**Files:**

- `.eslintrc.json` (root) - For monorepo-level linting
- `apps/backend/.eslintrc.js` - Backend-specific rules

**Action:** Keep both (different scopes)

---

## 📡 Deprecated API Endpoints

### Authentication Endpoints (Legacy)

**Path:** `/api/auth/*` (from `routes/auth.js`)

**Status:** 🟡 DEPRECATED - Use new endpoints

**Deprecated Endpoints:**

| Old Endpoint                 | New Endpoint                     | Module      |
| ---------------------------- | -------------------------------- | ----------- |
| `POST /api/auth/register`    | `POST /api/auth/farmer/register` | auth-farmer |
| `POST /api/auth/login`       | `POST /api/auth/farmer/login`    | auth-farmer |
| `POST /api/auth/admin/login` | `POST /api/auth/dtam/login`      | auth-dtam   |
| `GET /api/auth/profile`      | `GET /api/auth/farmer/profile`   | auth-farmer |

**Migration Deadline:** v2.1.0 (Q1 2026)

**Breaking Change:** Yes (different response format)

---

### Application Endpoints (Legacy)

**Path:** `/api/applications/*` (from `routes/applications.js`)

**Status:** 🟡 ACTIVE - But prefer module endpoints

**Prefer:**

- `/api/v2/applications/*` (from `modules/application/`)

**Difference:**

- Legacy returns flat objects
- New returns structured objects with metadata

---

## 🎯 Migration Roadmap

### Phase 1: Cleanup (✅ COMPLETED - Oct 26, 2025)

- ✅ Archive legacy `backend/` directory
- ✅ Archive unused entry points (app.js, robust-server.js)
- ✅ Consolidate prettier config
- ✅ Create ARCHITECTURE.md
- ✅ Create DEPRECATED.md
- ✅ Update .gitignore

### Phase 2: Consolidation (🔄 In Progress)

- 🔄 Consolidate validators to `shared/validators/`
- 🔄 Consolidate logger implementations
- 🔄 Consolidate models (decide: centralized vs in modules)
- 🔄 Set up path aliases (@shared, @models, @modules)

### Phase 3: Refactoring (⏳ Planned)

- ⏳ Refactor files >1,000 lines
- ⏳ Move business logic from `business-logic/` to modules
- ⏳ Migrate legacy routes to modules
- ⏳ Split workflow-engine.js into smaller services

### Phase 4: Feature Completion (⏳ Planned)

- ⏳ Complete TODO items (email, notifications, analytics)
- ⏳ Deprecate old API endpoints
- ⏳ Remove archived directories (after 6 months)

---

## 📋 Developer Guidelines

### Before Using Any File

1. **Check this document** - Is it deprecated?
2. **Check ARCHITECTURE.md** - What's the recommended approach?
3. **Search for duplicates** - Are there multiple versions?
4. **Ask team** - When in doubt, ask!

### When Deprecating Code

1. **Update this document** with:
   - File/feature being deprecated
   - Replacement/migration path
   - Timeline and priority
2. **Add deprecation notice** in code:
   ```javascript
   /**
    * @deprecated Since v2.0.0. Use modules/auth-farmer/ instead.
    * Will be removed in v2.2.0.
    */
   ```
3. **Log warnings** when deprecated code is used
4. **Update documentation** (README, API docs)
5. **Notify team** in pull request

### When Removing Deprecated Code

**Safety Checklist:**

- [ ] Deprecated for at least 2 releases (or 3 months)
- [ ] No references in active codebase (grep/search)
- [ ] Migration guide provided
- [ ] Tests updated
- [ ] Documentation updated
- [ ] Changelog entry added
- [ ] Team notified

---

## 🔍 How to Find Deprecated Code

### Search for Deprecated Functions

```bash
# Search for @deprecated tags
grep -r "@deprecated" apps/backend/

# Search for references to archived files
grep -r "backend/" apps/backend/
grep -r "business-logic/" apps/backend/
```

### Check Imports

```bash
# Find imports from deprecated locations
grep -r "require('.*business-logic/" apps/backend/
grep -r "require('../../../../" apps/backend/  # Deep relative imports
```

### Validate No Archived References

```bash
# Should return empty (no references to archived code)
grep -r "backend.archived" apps/
```

---

## 📞 Questions?

If you're unsure whether code is deprecated:

1. **Check this document first**
2. **Check ARCHITECTURE.md** for current patterns
3. **Search the codebase** for usage examples
4. **Ask in team chat** or create an issue

**Remember:** When in doubt, use the module structure in `apps/backend/modules/` with Clean Architecture.

---

**Document Maintained By:** GACP Platform Team
**Review Frequency:** Monthly
**Last Review:** January 2025 (Code Deduplication Audit)

---

## Changelog

### January 2025 - Code Deduplication Cleanup

#### Phase 1 (Critical Fixes) - Completed ✅

- ✅ **Deleted:** `modules/shared/utils/date.js` (100% duplicate of `shared/utilities.js`)
- ✅ **Deleted:** `src/middleware/validation.js` (stub only, no real implementation)
- ✅ **Deleted:** `modules/shared/utils/validation.js` (merged into `shared/validation.js`)
- ✅ **Deleted:** `src/controllers/applicationController.js` (stub returning 501 errors)
- ✅ **Enhanced:** `shared/validation.js` - consolidated validation functions from multiple files
- 📝 **Clarified:** `modules/shared/` is NOT duplicate - it's a re-export layer (architecture pattern)
- 📝 **Documented:** Application routes need consolidation (deferred to Phase 3)
- 🔍 **Audit:** Completed comprehensive code deduplication audit (see CODE_DEDUPLICATION_AUDIT.md)

**Phase 1 Files Deleted (4 total):**
1. `apps/backend/modules/shared/utils/date.js` - Duplicate date utilities
2. `apps/backend/modules/shared/utils/validation.js` - Duplicate validation
3. `apps/backend/src/middleware/validation.js` - Stub middleware
4. `apps/backend/src/controllers/applicationController.js` - Stub controller

**Phase 1 Files Enhanced (1 total):**
1. `apps/backend/shared/validation.js` - Consolidated validation utilities

**Phase 1 Impact:** Removed 100% duplicate code, established single source of truth for utilities

---

#### Phase 2 (Warning Fixes) - Completed ✅

- ✅ **Deleted:** `src/utils/logger.js` (unused comprehensive logger, modules use shared/logger)
- 📝 **Reviewed:** Centralized `models/` - still in use by legacy routes and tests (defer to Phase 3)
- 📝 **Reviewed:** Centralized `repositories/` - used by tests (keep for now)
- 📝 **Clarified:** Server files (server.js, atlas-server.js, dev-server.js, simple-server.js) have distinct purposes
- 📝 **Clarified:** Logger wrappers in modules/auth-* are NOT duplicates - they wrap shared/logger
- 📝 **Clarified:** modules/shared/constants/ are sub-constants, not duplicates
- 📝 **Verified:** modules use their own infrastructure/repositories (Clean Architecture pattern)

**Phase 2 Files Deleted (1 total):**
1. `apps/backend/src/utils/logger.js` - Unused logger (no imports found)

**Phase 2 Architecture Clarifications:**

| Component | Status | Decision |
|-----------|--------|----------|
| **Server Files** | ✅ Keep All | Each has distinct purpose (production/dev/demo) |
| **Centralized Models** | 🟡 Keep (Legacy) | Still used by routes & tests, migrate in Phase 3 |
| **Centralized Repositories** | 🟡 Keep (Tests) | Used by __tests__, modules use own repos |
| **Logger Implementations** | ✅ Clarified | Modules wrap shared/logger (pattern, not duplicate) |
| **Constants Structure** | ✅ Clarified | modules/shared/constants/ are sub-constants |

**Server Files Purpose:**
- `atlas-server.js` - MongoDB Atlas production server (706 lines)
- `server.js` - Main production server with full features (384 lines)
- `dev-server.js` - Development server with hot reload
- `dev-simple-server.js` - Quick dev testing
- `simple-server.js` - Demo server with mock APIs (413 lines)

**Phase 2 Impact:** Removed unused code, clarified architecture patterns, documented decisions for Phase 3

---

#### Phase 3 (Analysis & Planning) - Completed ✅

**Status:** Analysis complete, migration recommendations documented

**Business Logic Directory Audit:**
- 📊 **Total:** 14 files, ~8,819 lines of code
- ✅ **Used:** 1 file - `gacp-workflow-engine.js` (869 lines, 3 imports)
- ❌ **Unused:** 13 files - ~7,950 lines (ZERO imports)

**Unused Business Logic Files (Recommended: Archive):**
1. `gacp-ai-assistant-system.js` (1,285 lines) - AI feature not yet implemented
2. `gacp-business-rules-engine.js` (0 lines) - Empty file
3. `gacp-certificate-generator.js` (481 lines) - Not used (modules have own implementation)
4. `gacp-dashboard-notification-system.js` (668 lines) - Not integrated
5. `gacp-digital-logbook-system.js` (895 lines) - Feature not developed
6. `gacp-document-review-system.js` (680 lines) - Not used
7. `gacp-field-inspection-system.js` (644 lines) - Not used
8. `gacp-sop-wizard-system.js` (722 lines) - Feature not developed
9. `gacp-standards-comparison-system.js` (1,305 lines) - Not used
10. `gacp-status-manager.js` (508 lines) - Not used
11. `gacp-survey-system.js` (1,018 lines) - Not used
12. `gacp-visual-remote-support-system.js` (1,060 lines) - Feature not developed
13. `system-integration-hub.js` (684 lines) - Not used

**Used Business Logic (Requires Migration):**
- `gacp-workflow-engine.js` (869 lines)
  - Imported by: `atlas-server.js`, `services/gacp-enhanced-inspection.js`, `routes/gacp-business-logic.js`
  - Target location: `modules/application-workflow/domain/services/WorkflowEngine.js`
  - Priority: MEDIUM (defer to Phase 4)

**Legacy Routes Audit:**
- 📊 **Active in server.js:** 16 routes
- ⚠️ **Overlapping:** 3 application routes (`/api/applications`, `/api/farmer/application`, `/api/admin/applications`)
- 📋 **Recommendation:** Consolidate application routes, keep role-specific endpoints

**Active Legacy Routes:**
1. `/api/auth` - auth.js
2. `/api/health` - health.js
3. `/api/applications` - applications.js ⚠️ **OVERLAPPING**
4. `/api/farmer/application` - farmer-application.js
5. `/api/admin/applications` - admin-application.js
6. `/api/certificates` - certificate.js
7. `/api/inspections` - inspection.js
8. `/api/documents` - document.js
9. `/api/notifications` - notification.js
10. `/api/analytics` - analytics.js
11. `/api/dashboard` - dashboard.js
12. `/api/smart-agriculture` - smart-agriculture.routes.js
13. `/api/traceability` - traceability.js
14. `/api/farm-management` - farm-management.js
15. `/api/standards` - standards.js
16. `/api/questionnaires` - questionnaires.js

**Phase 3 Findings Summary:**
- ✅ Identified 13 unused business logic files (46% of business-logic/)
- ✅ Identified 1 actively used business logic file
- ✅ Documented 16 active legacy routes
- ✅ Identified 3 overlapping application routes
- 📋 Created comprehensive migration plan for Phase 4
- 📋 Updated CODE_DEDUPLICATION_AUDIT.md with full analysis

**Phase 3 Impact:** No files deleted (analysis only), provided clear roadmap for Phase 4+ migrations

### October 26, 2025

- ✅ Archived `backend/` directory → `backend.archived.2025-10-26/`
- ✅ Archived `app.js`, `robust-server.js`
- ✅ Consolidated prettier configs
- 📝 Created this DEPRECATED.md document
- 📝 Created ARCHITECTURE.md document

### October 21, 2025

- 🗑️ Marked `backend/` as legacy
- 🔄 Started migration to Clean Architecture

---

**Next Review:** February 2025
