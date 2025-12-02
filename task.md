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
    - [ ] Offline Mode Support
