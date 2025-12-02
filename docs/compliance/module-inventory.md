# Module Inventory & Status (2025-10-28)

Status legend:

- ✅ **Operational** – wired to production routes/services, requires regression only.
- ♻️ **Refine** – implementation exists but needs cleanup, data wiring, or compliance validation.
- 💤 **Pending Activation** – code scaffolded yet disabled/commented; requires integration plan.

## Backend Modules (`apps/backend/modules`)

| Module                 | Purpose                                       | Status                | Notes                                                                                                 | Backlog ID                             |
| ---------------------- | --------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------- |
| application            | Core GACP application domain services         | ♻️ Refine             | Validates submissions; review validation coverage, ensure Mongo schemas align with compliance matrix. | COMPL-006 (evidence), future QA ticket |
| application-workflow   | Workflow transitions, history tracking        | ♻️ Refine             | Confirm transitions match updated statuses, add audit logging.                                        | COMPL-001 support                      |
| audit                  | Audit event processing                        | 💤 Pending Activation | Contains processors; verify any route wiring before enabling.                                         | TBA                                    |
| auth-dtam              | DTAM staff authentication                     | ♻️ Refine             | Active in atlas-server; replace seeded data, enforce MFA readiness.                                   | COMPL-003 dependency                   |
| auth-farmer            | Farmer authentication                         | ♻️ Refine             | Active routes; legacy local mocks still in frontend—synchronize tokens.                               | COMPL-011 dependency                   |
| cannabis-survey        | Survey endpoints                              | 💤 Pending Activation | Review controllers, align with compliance docs before enabling.                                       | COMPL-014 (planned)                    |
| certificate-management | Certificate issuance & lifecycle              | ♻️ Refine             | Hooked in backend; confirm document templates and revocation flow.                                    | COMPL-006 linkage                      |
| dashboard              | Aggregated statistics for roles               | 💤 Pending Activation | Routes commented in server; requires data source validation.                                          | COMPL-010                              |
| document               | Document storage helpers                      | ♻️ Refine             | Ensure retention policies/checksum handling per compliance matrix.                                    | COMPL-008                              |
| document-management    | Presentation/persistence layer for docs       | ♻️ Refine             | Coordinate with frontend document checker pages.                                                      | COMPL-008                              |
| farm-management        | Farm registry, plots, cycles                  | 💤 Pending Activation | Verify schemas/cannabis-first crop default before exposing APIs.                                      | COMPL-004 support                      |
| notification           | Notification domain logic                     | 💤 Pending Activation | Check for duplication with notification-service.                                                      | COMPL-009                              |
| notification-service   | External notification delivery                | 💤 Pending Activation | Evaluate config, rate limits, compliance with audit logging.                                          | COMPL-009                              |
| payment-service        | PromptPay & payment orchestration             | 💤 Pending Activation | Dependencies complex; plan integration after finance review.                                          | COMPL-002                              |
| report                 | Legacy reporting routes                       | 💤 Pending Activation | Decide merge with reporting-analytics or archive.                                                     | COMPL-010                              |
| reporting-analytics    | Analytics aggregation & dashboards            | ♻️ Refine             | Connect to real data pipeline, align with CTLS reporting.                                             | COMPL-003                              |
| shared                 | Common utilities (logger, config, middleware) | ✅ Operational        | Continually maintained; ensure security reviews up to date.                                           | -                                      |
| standards-comparison   | Standards diff service                        | 💤 Pending Activation | Evaluate necessity vs. compliance matrix outputs.                                                     | COMPL-015 (planned)                    |
| survey-system          | Generic survey framework                      | 💤 Pending Activation | Overlaps with cannabis-survey; consider consolidation.                                                | COMPL-014 support                      |
| track-trace            | Seed-to-sale tracing                          | 💤 Pending Activation | Critical for compliance; prioritise integration with QR services.                                     | COMPL-001                              |
| training               | Training records & SOP tracking               | 💤 Pending Activation | Needed for WHO GACP staffing clauses; align with frontend requirements.                               | COMPL-013                              |
| user-management        | User administration & roles                   | ♻️ Refine             | Active in atlas-server error responses; verify RBAC and admin UI wiring.                              | COMPL-003/013                          |

## Frontend Portals (`apps/frontend/pages`)

| Portal / Section                                         | Coverage Summary                                                | Cannabis-First Check                                             | Status                               | Backlog ID           |
| -------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------ | -------------------- |
| Farmer (`farmer/*`, `application/create.tsx`)            | Application submission, documents, farms, profile, certificates | Ensure dropdowns (crop type, catalog) list cannabis first        | ♻️ Refine – connect to live auth/api | COMPL-004, COMPL-011 |
| Inspector (`inspector/*`)                                | Dashboard, applications, schedule, reports                      | Verify inspection templates default to cannabis context          | ♻️ Refine – replace mock data        | COMPL-011            |
| Approver (`approver/dashboard.tsx`)                      | Approval overview                                               | Confirm cannabis metrics first                                   | ♻️ Refine                            | COMPL-004            |
| Document Checker (`document-checker/*`)                  | Document review workflow                                        | Highlight cannabis documentation prompts                         | ♻️ Refine                            | COMPL-008 support    |
| Admin (`admin/dashboard.tsx`)                            | Cross-system metrics                                            | Align stats with compliance matrix, cannabis-first summary cards | ♻️ Refine                            | COMPL-003            |
| Shared pages (`login.tsx`, `register.tsx`, `services/*`) | Authentication, marketing, public services                      | Login role selection defaults to cannabis demo accounts          | ♻️ Refine                            | COMPL-004            |

## Next Steps

1. Assign owners to each ♻️ or 💤 entry and log remediation tasks.
2. Cross-reference completion with `compliance-matrix.md`.
3. Archive redundant modules or docs once consolidation decisions are made.
