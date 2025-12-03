# Priority 1: Role Refactoring & Workflow Update

- [x] **Refactor User Roles**
    - [x] Update `ROLES` constant in `apps/backend/shared/constants.js` (Add OFFICER, Consolidate AUDITOR)
    - [x] Update User Model schema to support new roles
    - [x] Update `GACPUserService` logic for new roles
- [x] **Upgrade Application Model**
    - [x] Add Juristic Person fields (Already present in ApplicantInfoSchema)
    - [x] Update Document requirements (25 items)
- [x] **Implement Job Assignment**
    - [x] Create API for Officer to assign tasks to Auditor

# Priority 2: Unified Frontend Implementation (Pure Flutter)

- [x] **Setup Flutter Web**
    - [x] Enable Web support in `apps/mobile_app`
    - [x] Configure Responsive Layout (Web/Mobile)
# Priority 1: Role Refactoring & Workflow Update

- [x] **Refactor User Roles**
    - [x] Update `ROLES` constant in `apps/backend/shared/constants.js` (Add OFFICER, Consolidate AUDITOR)
    - [x] Update User Model schema to support new roles
    - [x] Update `GACPUserService` logic for new roles
- [x] **Upgrade Application Model**
    - [x] Add Juristic Person fields (Already present in ApplicantInfoSchema)
    - [x] Update Document requirements (25 items)
- [x] **Implement Job Assignment**
    - [x] Create API for Officer to assign tasks to Auditor

# Priority 2: Unified Frontend Implementation (Pure Flutter)

- [x] **Setup Flutter Web**
    - [x] Enable Web support in `apps/mobile_app`
    - [x] Configure Responsive Layout (Web/Mobile)
    - [x] Setup Navigation (GoRouter for Web URLs)
- [x] **Implement Admin Features (Web)**
    - [x] Admin Login Screen
    - [x] Dashboard Overview (Web Layout)
    - [x] Task Queue & Assignment (Web Layout)
- [x] **Implement Auditor Features (Mobile)**
    - [x] My Assignments Screen
    - [x] Inspection Form Screen
    - [x] Offline Mode Support
    - [x] End-to-End Backend Testing
    - [x] Create E2E test script
    - [x] Fix Backend Routes (Mock Mode)
    - [x] Fix Authentication in Dev Server
- [x] Project Cleanup
    - [x] Remove unused `document` modules and files in backend
    - [x] Remove `docs` folder and temporary files
- [x] Final System Setup
    - [x] Generate Run Instructions (`RUN_INSTRUCTIONS.md`)
    - [x] Start Backend Server
- [x] System Verification
    - [x] Verify Full Workflow (Register -> Certificate)
    - [x] Fix Mock Database Async Bug
    - [x] Fix Job Assignment Logic
    - [ ] **Refactor `auth-farmer` Module**
        - [ ] Flatten Clean Architecture to MVC
        - [ ] Rename files for clarity
        - [ ] Update imports and wiring

# Priority 3: Production Readiness

- [x] **Cleanup Legacy Files**
    - [x] Remove `apps/backend/src` (Incomplete TS migration)
    - [x] Remove `apps/backend/atlas-server.js` (Broken entry point)
    - [x] Remove unused setup scripts (`setup-*.js`)
    - [x] Remove `public/index.html` and `packages/` (Legacy Frontend)
- [x] **Production Server Setup**
    - [x] Create `apps/backend/server.js` (Production Entry Point)
    - [x] Configure `server.js` to use `ProductionDatabaseService`
    - [x] Mount existing routes from `apps/backend/routes`
    - [x] Update `package.json` start script
- [x] **Containerization**
    - [x] Create `Dockerfile` for Backend
    - [x] Create `docker-compose.yml` (Backend + MongoDB)
- [x] **Environment Configuration**
    - [x] Create `.env.production.example`
