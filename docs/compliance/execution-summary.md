# Execution Summary & Next Actions (Q4 FY2025)

## 1. Research & Benchmarking

- Launch Workstream A (Compliance Sources) per `RESEARCH_EXECUTION_PLAN.md`.
- Owners: Legal Liaison, Compliance Lead.
- Deliverables: populated `compliance-matrix.md`, source citations captured.
- Due: 2025-11-15.

## 2. Module Hardening

- Back-end leads review each module in `apps/backend/modules` against `module-inventory.md`; assign owners for every ♻️ / 💤 item and log remediation tickets (naming convention: `COMPL-###`).
- Front-end leads ensure cannabis-first ordering across portals and replace mock datasets with live APIs; record findings in the same backlog.
- AI/IoT teams stabilise fertilizer engine logs and sensor ingestion; document model governance tasks under `COMPL-AI-###`.
- Use `cannabis-first-checklist.md` to capture evidence screenshots for each release.
- Track sprint-by-sprint objectives in `sprint-plan.md` and update during weekly compliance syncs.

## 3. Quality Gate

- Resolve outstanding lint/type/test failures (`pnpm run format:check`, `pnpm run lint:all`, `pnpm exec tsc --noEmit`, `pnpm run test`).
- Integrate checks into CI pipeline; block merges until green.

## 4. Documentation & Governance

- Archive redundant manuals into `archive/` with timestamped names.
- Update `docs/COMPETITIVE_ANALYSIS.md` after benchmark research.
- Introduce quarterly compliance review meeting and change-log process.

## 5. Deployment Readiness

- Verify PM2/Docker scripts, health monitors, backup & incident runbooks.
- Prepare staging rollout using Atlas server configuration for acceptance testing.
- Confirm monitoring and alerting thresholds before production sign-off.

## 6. Backlog Outline (Initial)

| ID        | Area                          | Description                                                                                            | Owner                | Target Sprint |
| --------- | ----------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------- | ------------- |
| COMPL-001 | Backend – Track & Trace       | Activate `track-trace` module with QR issuance and transfer logs                                       | Backend Lead         | Sprint 45     |
| COMPL-002 | Backend – Payment Service     | Finalise PromptPay integration, add reconciliation tests                                               | Backend Lead         | Sprint 45     |
| COMPL-003 | Frontend – Admin Portal       | Wire dashboard widgets to real analytics endpoints                                                     | Frontend Lead        | Sprint 44     |
| COMPL-004 | Frontend – Crop Selectors     | Audit all dropdowns to ensure cannabis-first ordering                                                  | UX Lead              | Sprint 44     |
| COMPL-005 | AI                            | Document fertilizer engine explainability & model lineage                                              | AI Lead              | Sprint 46     |
| COMPL-006 | Compliance                    | Populate `compliance-matrix.md` with evidence & link to modules                                        | Compliance Lead      | Sprint 44     |
| COMPL-007 | Operations                    | Integrate log retention policy with SIEM tooling                                                       | DevOps               | Sprint 45     |
| COMPL-008 | Backend – Document Management | Enforce retention, checksum, and versioning standards in `document` & `document-management` modules    | Backend Lead         | Sprint 45     |
| COMPL-009 | Backend – Notification Stack  | Evaluate `notification` vs `notification-service`, consolidate, and enable secure messaging            | Backend Lead         | Sprint 46     |
| COMPL-010 | Backend – Dashboard Module    | Re-enable dashboard routes with validated data sources and role-based caching                          | Backend Lead         | Sprint 44     |
| COMPL-011 | Frontend – Inspector Workflow | Replace mock inspection data with live API calls in `inspector/*` pages                                | Frontend Lead        | Sprint 45     |
| COMPL-012 | IoT                           | Validate sensor ingestion pipeline (MQTT → Redis → Mongo) and alert thresholds                         | IoT Lead             | Sprint 46     |
| COMPL-013 | Training Module               | Assess `training` module readiness, align with WHO GACP staffing requirements, connect to admin portal | Backend Lead         | Sprint 47     |
| COMPL-014 | Survey Modules                | Decide on `cannabis-survey` vs `survey-system`, align with compliance, and enable required surveys     | Product + Backend    | Sprint 47     |
| COMPL-015 | Standards Comparison          | Evaluate need for `standards-comparison` module, integrate with compliance matrix outputs              | Compliance + Backend | Sprint 48     |

## Key Milestones

| Milestone                          | Date       | Owner           |
| ---------------------------------- | ---------- | --------------- |
| Compliance matrix v1 complete      | 2025-11-15 | Compliance Lead |
| Module hardening backlog finalised | 2025-11-22 | Eng Managers    |
| CI quality gate active             | 2025-11-29 | DevOps          |
| Staging deployment with monitoring | 2025-12-06 | Operations      |
