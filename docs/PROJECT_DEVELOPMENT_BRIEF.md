# 🌿 PROJECT_DEVELOPMENT_BRIEF.md  
**Medical Cannabis Management Platform**

---

## 1. Overview

The **Medical Cannabis Management Platform** is a dual-build web system designed to support both **farmers** and **government officials** under Thailand’s Department of Thai Traditional and Alternative Medicine (DTTAM).

The platform enables complete digital management of **cannabis cultivation, licensing, traceability, and compliance** in alignment with international GACP standards.

It consists of two independent but interconnected builds:

1. **Farmer Portal** – for cultivators to manage farm operations and submit license applications.  
2. **Government Portal** – for officials to review, approve, and monitor cultivation activities.

---

## 2. Objectives

- Upgrade and finalize the system for **full production deployment**.  
- **Audit and improve** existing code before extending functionality.  
- Maintain **Cannabis** as the **primary and default plant option** among six supported herbal species.  
- Ensure **UI/UX, typing, and logging** consistency across both builds.  
- Conduct **light research** on globally or regionally recognized competitor systems.  
- Keep public documentation focused on **high-level overviews** (no budget, contact, or internal details).

---

## 3. System Architecture

### 🧩 Build 1: Farmer Portal
Core Modules:
- **Member Management System** – Manage registered cannabis farmers.  
- **License Application System** – Online submission and document management for cultivation approval.  
- **Traceability System** – QR code–based product tracking (parcel-style tracking).  
- **Farm Management System** – Manage planting data and QR generation.  
- **Survey System** – Create and manage questionnaires.  
- **Standard Comparison System** – Compare GACP standards vs WHO/FDA/ASEAN benchmarks.  

🔐 **Login Separation:**
- License Application Login  
- Farm Management Login  

---

### 🏛️ Build 2: Government Portal
Core Modules:
- **Staff Login System** – For DTTAM personnel authentication.  
- **Admin Panel / Dashboard** – Manage license requests, inspect farm data, and access reports.  
- **Traceability Monitoring** – View all cannabis batch records.  
- **Member & Farm Oversight** – Manage registered farmers and production sites.  
- **Reporting & Statistics** – View summaries and system-wide analytics.  

---

## 4. Technical Stack

| Layer | Technology | Notes |
|-------|-------------|-------|
| Frontend | **React / Next.js (TypeScript)** | Modular pages per portal |
| Backend | **Node.js / NestJS** | RESTful APIs, ready for scaling |
| Database | **PostgreSQL** | Centralized shared schema |
| Auth | **JWT + Role-based Access Control** | Separate keys per build |
| Deployment | **Docker / PM2 / Nginx** | Modular deployment per environment |
| Logging | **Custom Logger Utility (Winston / Pino)** | Replace all `console.*` usage |
| Version Control | **Git (Monorepo)** | Shared libraries under `/packages` |

---

## 5. Developer Responsibilities

1. **Code Audit**
   - Review existing modules for stability and completeness.  
   - Fix, refactor, or enhance before adding new components.  

2. **README / Documentation**
   - Keep only project overviews in public README files.  
   - Move or remove sensitive/internal sections (budget, contacts, etc.).  

3. **File Management**
   - Delete obsolete or redundant files (especially `.md`).  
   - Archive legacy docs under `/archive/` with version and date.  

4. **Consistency**
   - Replace `console.*` calls with shared `logger`.  
   - Align component structure, naming, and UI patterns with other modules.  
   - Maintain strong typing for all models/interfaces.  

5. **Priority Order**
   - Cannabis remains the **first option** in every selection or dropdown.  

---

## 6. Audit Checklist

### 🔍 General Project
- [ ] Verify both build directories (`farmer-portal/`, `gov-portal/`).  
- [ ] Confirm environment configuration (`.env.dev`, `.env.prod`).  
- [ ] Validate TypeScript settings and dependency alignment.  
- [ ] Ensure modular boundaries between frontend and backend are clear.  

### 📱 Farmer Portal
- [ ] Member Management – CRUD and user roles verified.  
- [ ] License Application – submission, form validation, and file upload flow.  
- [ ] Traceability – QR code generation and lookup.  
- [ ] Farm Management – planting record logic and QR linking.  
- [ ] Survey – form builder and result saving.  
- [ ] Standard Comparison – data accuracy for GACP vs WHO/FDA/ASEAN.  
- [ ] Authentication – both login paths function independently.  

### 🏛️ Government Portal
- [ ] Staff Login – access control confirmed.  
- [ ] Admin Dashboard – approvals, data views, and analytics tested.  
- [ ] Traceability Monitoring – QR data retrieval validated.  
- [ ] Farmer & Farm Data – synced with Farmer Portal.  
- [ ] Reporting – charts and exports verified.  

### ⚙️ Cross-System
- [ ] Logging system integrated (no console usage).  
- [ ] Type-check runs clean (`pnpm run type-check`).  
- [ ] Lint passes without errors (`pnpm run lint:all`).  
- [ ] File structure conforms to `/src`, `/docs`, `/archive`, `/assets`.  
- [ ] README shows only high-level project info.  

---

## 7. Next Steps

- Conduct a full system audit following the checklist above.  
- Document all findings, broken features, or improvement notes.  
- Plan endpoint integrations (view/download certificates).  
- Prepare for production deployment after QA confirmation.  

---

## 🧾 Audit Log Template

| Module / Area | Status | Key Findings | Action Needed | Assigned To | Notes / Blockers |
|----------------|---------|---------------|----------------|--------------|------------------|
| Farmer Portal – Member Management | � In Review | `profile` and `farms` pages rely on static arrays; save/edit buttons stubbed | Connect to farmer profile/farm APIs and persist updates | — | Need backend endpoints confirmed |
| Farmer Portal – License Application Wizard | � In Progress | Multi-step form keeps local state only; no submit handler or file upload wiring | Implement submission to `/api/applications`, hook uploads, enforce validation | — | Document upload placeholders marked TODO |
| Farmer Portal – Certificates | 🟠 In Review | Certificate list uses mock data; download/resubmit buttons are no-ops | Integrate with certificate service and storage | — | Requires backend certificate endpoints |
| Government Portal – Applications Queue | 🟠 In Review | `getApplications` returns object but UI expects `.data`; table receives `undefined` | Map response to `response.applications` and handle empty states | — | Ensure DTO matches backend shape |
| Government Portal – Staff Login | 🔴 Blocked | Frontend posts `{ email, password }` to `/api/auth/dtam/login`, backend expects `/api/auth-dtam/login` with `{ username, password, userType: 'DTAM_STAFF' }` | Align endpoint path/payload or expose compatibility layer | — | Current login always fails |
| Government Portal – Applications Queue | 🟠 In Review | `getApplications` returns object but UI expects `.data`; table receives `undefined` | Map response to `response.applications` and handle empty states | — | Ensure DTO matches backend shape |
| Government Portal – Admin Dashboard | 🔴 Blocked | KPI cards use hard-coded totals; no API call for real metrics | Wire to `/api/dashboard` stats and add error handling | — | Backend metrics endpoint status unknown |
| Government Portal – Inspection Management | 🔴 Blocked | Calendar/scheduler call stubbed endpoints returning empty sets; scheduler passes blank ID | Implement persistence for `/api/inspections/*` and supply real inspection IDs | — | Backend `inspection-scheduling` routes still TODO |
| Government Portal – Reports & Exports | 🟠 In Review | `ReportGenerator` only triggers `onGenerate`; no link to report APIs or download handlers | Connect to report module, stream files, and show job status | — | Backend report routes currently unmounted |
| Cross-System – Logging & Error Handling | 🟠 In Review | Widespread `console.error` usage across portals | Replace with shared logger utility and surface UI feedback | — | Need logging package imported in portals |
| Backend APIs – Inspections Scheduling | 🔴 Blocked | `/apps/backend/routes/inspection-*.routes.js` return placeholders and server omits mounting | Finish persistence layer and register `/api/inspections` routes | — | Frontend scheduler hits 404/empty responses |
| Backend APIs – Traceability | 🔴 Blocked | Traceability routes exist but commented out in `server.js`; UI cannot reach them | Enable `/api/traceability` with proper auth guards | — | Requires role policy review |
| Cross-System – Type Safety | 🔴 Blocked | Type-check reveals 132 errors: missing `@mui/material`, `chart.js`, `react-chartjs-2`, `react-hook-form`, `yup`; installed but TS cache stale | Clear `.next` cache, re-run type-check, fix implicit `any` types | — | Dependencies installed; awaiting rebuild |
| Cross-System – Lint Suite | 🔴 Blocked | Global lint (`pnpm run lint:all`) not run; console usage likely to fail rules | Execute lint suite and remediate findings | — | Queued after type-check resolution |

**Status Codes:**  
🟢 Ready | 🟠 In Review | 🔧 In Progress | 🔴 Blocked

---

## 📊 Audit Progress Summary

| Category | Total Modules | Ready | In Review | Blocked / Issues | Notes |
|-----------|----------------|--------|-------------|------------------|--------|
| Farmer Portal | 6 | 0 | 2 | 4 | UI screens rely on mock data; integration pending |
| Government Portal | 5 | 0 | 2 | 3 | Metrics & inspections blocked on backend wiring |
| Government Portal | 5 | 0 | 1 | 4 | Login payload mismatch blocks access; metrics & inspections still awaiting APIs |
| **Overall** | **16** | **0** | **7** | **9** | **Audit in progress; integrations not yet wired** |
| **Overall** | **16** | **0** | **6** | **10** | **Audit in progress; access blockers unresolved** |
| Cross-System | 5 | 0 | 3 | 2 | Logging, QA automation, and env checks outstanding |
| **Overall** | **16** | **0** | **7** | **9** | **Audit in progress; integrations not yet wired** |

---

**Maintainer:** Development Team – Predictive AI Solutions x Suan Sunandha Rajabhat University  
**Last Updated:** October 2025  
**Status:** 🟢 In Audit Review Phase
