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

# Priority 2: Frontend Implementation (Officer Dashboard)

- [x] **Setup Admin Portal**
    - [x] Initialize Next.js project in `apps/web`
    - [x] Configure TailwindCSS & ShadcnUI
    - [x] Setup API Client (Axios/TanStack Query)
- [x] **Implement Authentication**
    - [x] Login Page (Officer/Admin)
    - [x] Auth Context & Protected Routes
- [x] **Implement Dashboard & Job Assignment**
    - [x] Dashboard Overview (Stats)
    - [x] Task Queue View (Unassigned Jobs)
    - [x] Assignment Modal/Page
