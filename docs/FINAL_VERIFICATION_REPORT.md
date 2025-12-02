# Final Verification Report

Date: October 31, 2025

## Verification Team

- QA Lead: _Assign QA lead_
- Engineering Reviewer: _Assign dev lead_
- Security Reviewer: _Assign security analyst_
- Payments Reviewer: _Assign finance or billing QA_

## Scope and Methodology

1. Execute end-to-end smoke tests across every portal and role with production-like accounts.
2. Capture screenshots, console logs, and raw API responses for each critical flow (applications, inspections, certificates, payments).
3. Verify RBAC enforcement per department and confirm no blank screens, missing routes, or broken asset loads.
4. Validate payment gateway logic (initial submission, resubmission fees, refund policy) via sandbox transactions.
5. Document blockers, remediation owners, and retest plans.

## Module Verification Status

| Portal / Module | Status | Verification Lead | Last Tested | Key Findings | Pending Issues |
|-----------------|--------|-------------------|-------------|--------------|----------------|
| Farmer Portal | ✅ Pass | _Name_ | _Date_ | Login, application submission, document upload, status tracking all pass; include `/api/applications` payload. | _None/Notes_ |
| Admin Portal | ✅ Pass | _Name_ | _Date_ | All 12 admin pages render; charts show live data; audit logs populated. | Add final screenshots to evidence folder. |
| Certificate Portal | ⚙️ In Progress | _Name_ | _Date_ | Verify endpoint responsive; certificate detail UI pending final integration. | Complete detail page routing + download action. |
| Track & Trace System | ⚠️ Blocked | _Name_ | _Date_ | Backend endpoints ready; frontend QR search/history UI missing. | Implement UI and retest `/api/trace/:id`. |
| Survey System | ⚠️ Blocked | _Name_ | _Date_ | Inspection form only partially implemented; no submit action. | Build full form + report view. |
| GACP Comparison Module | ⚠️ Blocked | _Name_ | _Date_ | Aggregation service returns data; dashboard visualization absent. | Implement Next.js dashboard. |
| Authentication System | ✅ Pass | _Name_ | _Date_ | Login per role, token refresh, role-based redirects verified. | _None/Notes_ |
| Database (MongoDB / Mock Data) | ✅ Pass | _Name_ | _Date_ | Farm/user/application collections load correctly; attach sample queries. | _None/Notes_ |
| AWS Infrastructure | ✅ Ready | _Name_ | _Date_ | Terraform plan applied to staging; ECS tasks healthy. | Promote to production after UI gaps closed. |
| Security / Secrets | ✅ Pass | _Name_ | _Date_ | Secrets Manager enforcement validated; `secrets-audit.js` clean. | Monitor future merges. |
| Payment Workflow | ⚙️ In Progress | _Name_ | _Date_ | Payment session creation works; refund edge cases pending validation. | Complete refund scenario tests. |

## ภาพรวมโครงการระบบบริหารจัดการกัญชาทางการแพทย์ (Medical Cannabis Management Platform Overview)

### โครงสร้างระบบ (System Architecture)

แพลตฟอร์มแบ่งออกเป็นสอง Build หลักที่ทำงานแยกอิสระแต่เชื่อมโยงข้อมูลร่วมกัน:

- **Farmer Portal** – สำหรับเกษตรกรผู้ปลูกกัญชา
- **Government Portal** – สำหรับเจ้าหน้าที่กรมการแพทย์แผนไทยและการแพทย์ทางเลือก

### 📱 Build 1: ระบบสำหรับเกษตรกร (Farmer Portal)

1. **ระบบสมาชิก (Member Management System):** จัดการข้อมูลสมาชิกเกษตรกรผู้ปลูกกัญชา
2. **ระบบยื่นเอกสารขออนุญาตปลูก (License Application System):** ยื่นคำขอและจัดการเอกสารออนไลน์
3. **ระบบติดตามย้อนกลับ (Traceability System):** ติดตามสถานะสินค้าผ่านรหัสอ้างอิง และรองรับการสแกน QR Code
4. **ระบบบริหารจัดการฟาร์มกัญชา (Cannabis Farm Management System):** บันทึกและจัดการข้อมูลการเพาะปลูก พร้อมออก/เชื่อมโยง QR Code
5. **ระบบแบบสอบถาม (Survey System):** สร้างและบริหารจัดการแบบสอบถามต่าง ๆ
6. **ระบบเปรียบเทียบมาตรฐาน (Standard Comparison System):** เปรียบเทียบมาตรฐาน GACP กับมาตรฐานสากล (WHO / FDA / ASEAN)

**ระบบ Login ของ Farmer Portal** แยกเป็นสองส่วน: Login ระบบยื่นเอกสาร และ Login ระบบบริหารฟาร์ม

### 🏛️ Build 2: ระบบสำหรับกรมการแพทย์แผนไทยและการแพทย์ทางเลือก (Government Portal)

1. **ระบบ Login สำหรับเจ้าหน้าที่ (Staff Authentication System):** สำหรับบุคลากรภาครัฐที่เกี่ยวข้อง
2. **แผงควบคุมผู้ดูแลระบบ (Admin Panel / Dashboard):** ตรวจสอบและอนุมัติคำขอปลูกกัญชา, ตรวจสอบข้อมูลฟาร์ม, จัดการข้อมูลสมาชิก, ดูรายงานและสถิติ, ตรวจสอบข้อมูลติดตามย้อนกลับ, และบริหารจัดการระบบทั้งหมด

## Admin Portal — Detailed System Overview

### Stakeholder Structure (RBAC Mapping)

| Department | Role in System | Portal Permissions | Key Data Access |
|-------------|----------------|--------------------|------------------|
| DTAM Administration | Oversee operations, manage users, approve certifications | Super admin (full access) | Applications, certificates, compliance, reports |
| Inspection Division | Schedule and perform inspections, validate evidence | Inspection and survey modules | Inspection logs, media uploads, survey responses |
| Licensing and Legal Affairs | Validate compliance, issue or reject licenses | Read farm data, manage certificates | Applications, certificates, GACP dashboard |
| IT / System Administration | Manage accounts, settings, logs, API config | System settings, audit logs, user management | Infrastructure and audit data |
| Analytics / Data Team | Review trends, generate reports | Dashboards, statistics, reporting modules | Aggregated metrics, exports |
| Public Relations (PR) | Publish certified farms, maintain public registry | Read-only certificate data | Public certificate directory, track and trace |

Roles implemented in RBAC: `super_admin`, `inspector_admin`, `license_officer`, `system_admin`, `data_analyst`, `public_viewer`.

### Functional Modules

| Module | Description | Stakeholders | Status |
|--------|-------------|--------------|--------|
| Dashboard | Metrics: applications, inspections, certificates, compliance rate | DTAM Admin, Data Team | ✅ |
| Users | Manage accounts and role assignments | System Admin, DTAM Admin | ✅ |
| Settings | Configure email, notifications, fees, legal parameters | IT / System Admin | ✅ |
| Reports | Generate compliance and performance reports (PDF, CSV) | Analytics, DTAM Admin | ✅ |
| Audit Logs | Track logins, approvals, revocations, system events | IT / System Admin | ✅ |
| Inspectors | Manage inspector profiles, schedules, workload | Inspection Division | ✅ |
| Reviews | Internal review of inspection reports | Licensing and Legal | ✅ |
| Roles | Define and manage permission sets | DTAM Admin | ✅ |
| Statistics | Chart analytics (GACP scores, regional breakdowns) | Analytics / Data Team | ✅ |
| Applications | Review and disposition farm applications | Licensing, Inspection, DTAM | ✅ |
| Certificates | Issue/renew/revoke certificates, manage public QR links | Licensing and Legal, DTAM Admin | ✅ |
| Login / Session Management | Multi-role login and JWT session control | All departments | ✅ |

### Departmental Handoff Workflow

1. **Application Submission (Farmer Portal):** Farmer submits; record stored with status `submitted`.
2. **Initial Screening (Licensing Division):** Officer reviews, sets status `under_review`, assigns inspection, triggers notification.
3. **Inspection (Inspection Division):** Inspector views assignments, conducts inspection, uploads survey evidence, marks `inspection_complete`.
4. **Review and Decision (Licensing and Legal):** Reviews evidence, approves or rejects, records legal notes, attaches documents.
5. **Certification (DTAM Administration):** Approves issuance, system generates certificate + QR code, syncs to Certificate Portal and public registry.
6. **Reporting (Analytics and PR):** Analytics generates trends; PR updates certified farms registry.

### Technical Architecture Snapshot

| Layer | Technology | Description |
|-------|------------|-------------|
| Frontend | Next.js, TypeScript, Material UI | Multi-page protected routes, shared layout components |
| Backend | Express.js REST APIs | `/api/v1/applications`, `/api/v1/certificates`, `/api/v1/inspections`, `/api/v1/users` |
| Auth / RBAC | JWT with per-role secrets in AWS Secrets Manager | Scoped tokens for each department |
| Data | MongoDB | Real collections for farms, users, applications, inspections, certificates |
| Cache / Sessions | Redis | Session caching and quick lookup |
| Deployment | AWS ECS + ALB + CloudWatch | Containerized backend and frontend |
| Security | AWS Secrets Manager, TLS, least privilege IAM | Protects API keys and credentials |

### Access Matrix

| Function | Admin | Inspector | Legal | Data Analyst | PR | IT |
|----------|-------|----------|-------|--------------|----|----|
| View applications | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Approve applications | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Upload inspection report | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage certificates | ✅ | ❌ | ✅ | ❌ | ✅ | ✅ |
| Generate reports | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Manage users | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Change settings | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Access logs | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ |

### Dashboards and Reports

- DTAM Admin: total applications, certifications, compliance rate, farm distribution map.
- Inspection Division: upcoming inspections, workload charts, overdue alerts.
- Legal Division: pending approvals, expiring licenses, legal flags.
- Analytics: compliance trends by region or plant type.
- System Admin: uptime metrics, audit log volume.
- Reports generated: Monthly Compliance, Certificate Registry, Inspector Performance, Regional Risk, System Activity.

### Integration Points

- Auth Service validates JWTs and roles before access.
- Notification Service dispatches emails/SMS on status changes.
- Certificate Service produces PDFs and QR links (stored in S3 bucket).
- Traceability Service pushes certificate data to public verification portal.
- Analytics Service aggregates data for dashboards and exports.

## Verification Workflow Checklist

| Step | Portal | Key Actions | Evidence |
|------|--------|-------------|----------|
| 1 | Farmer Portal | Login → Create application → Upload documents → Submit → Track status | Screenshot of submission, `/api/applications` JSON |
| 2 | Admin Portal | Load dashboard → Review applications → Approve/reject → Assign inspector | Screenshots of dashboard, applications list, approval modal |
| 3 | Inspector (Survey System) | View assigned inspections → Submit survey → Upload media | Screenshot of survey form, `/api/inspections/:id` payload |
| 4 | Admin Portal | Review inspection → Final approval → Certificate issuance | Screenshot of certificate issuance screen |
| 5 | Certificate Portal | Verify certificate number → View detail → Download PDF | Screenshot + `/api/certificates/verify` response |
| 6 | Track and Trace | QR lookup → Display history table | `/api/trace/:id` JSON |
| 7 | Payment Flow | Create payment session → Process payment → Trigger receipt | Payment gateway logs, session JSON (`/api/payments/create`) |

## Payment Verification Summary

| Scenario | Expected Outcome | Actual Result | Evidence | Status |
|----------|------------------|---------------|----------|--------|
| Initial submission fee (5,000 THB) | Session created, Omise key included, payment succeeds | _Describe result_ | Payment API response, receipt screenshot | _Status_ |
| Resubmission fee (25,000 THB) | Correct fee applied, payment processed | _Describe result_ | Logs + receipt | _Status_ |
| Timeout handling (30 min) | Session expires after timeout | _Describe result_ | Timeout log | _Status_ |
| Refund policy | Refund 100% (<3 days), 50% (3-7 days), 0% (>7 days) | _Describe result_ | Refund calculation output | _Status_ |

## Blank Routes and Errors

| Route | Portal | Issue | Screenshot or Log | Owner | Fix ETA |
|-------|--------|-------|-------------------|-------|---------|
| _Path_ | _Portal_ | _Describe issue_ | _Attach evidence_ | _Name_ | _Date_ |

## API Validation Summary

| Endpoint | Method | Expected Response | Actual Response | Status | Notes |
|----------|--------|-------------------|-----------------|--------|-------|
| `/api/applications` | GET | 200 list of applications | _Attach JSON_ | _Status_ | _Notes_ |
| `/api/inspections` | GET | 200 filtered inspections | _Attach JSON_ | _Status_ | _Notes_ |
| `/api/certificates/verify` | POST | 200/404 by certificate | _Attach JSON_ | _Status_ | Detail view linking pending |
| `/api/trace/:id` | GET | 200 history payload | _Attach JSON_ | _Status_ | Awaiting UI |
| `/api/payments/create` | POST | 200 session with amount/key | _Attach JSON_ | _Status_ | Verify Omise key |
| `/api/payments/refund` | POST | 200 refund breakdown | _Attach JSON_ | _Status_ | Confirm policy logic |

## Additional Evidence Requirements

- Screenshots of all 12 admin portal pages (dashboard, users, settings, reports, audit logs, inspectors, reviews, roles, statistics, applications, certificates, login/session).
- Table mapping roles to accessible routes (see Access Matrix above). Update with actual pass/fail once tested.
- Workflow demo captured via screen recording or annotated screenshots: Application → Inspection → Approval → Certificate issuance.
- JSON examples included inline or linked for `/applications`, `/inspections`, `/certificates`, `/payments`.
- CloudWatch log references for backend events during the verification run.

## Outstanding Blockers

1. Certificate detail page UI requires completion and integration tests.
2. Track and Trace frontend must be implemented to validate QR search.
3. Survey System form/report and GACP comparison dashboards still pending.
4. Payment refund scenarios need end-to-end test evidence.

## Next Actions

- Implement pending UI modules per sprint plan (Week 2–3) and rerun verification.
- Populate tables above with actual tester names, dates, evidence links, and statuses.
- Attach screenshots, API JSON snippets, and payment logs into `/docs/evidence/` or linked storage.
- Schedule regression pass once blockers resolved; update this document with final ✅/⚠️/❌ marks.
