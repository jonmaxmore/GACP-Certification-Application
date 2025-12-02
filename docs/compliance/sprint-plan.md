# Compliance Sprint Plan (Sprints 44–48)

## Sprint 44 (Kick-off)

- **Objectives**
  - Finalise compliance evidence baseline (`compliance-matrix.md`, COMPL-006).
  - Complete cannabis-first audit on farmer/admin portals (COMPL-004).
  - Re-enable backend dashboard APIs (COMPL-010) and wire admin dashboard (COMPL-003).
- **Deliverables**
  - Updated compliance matrix with citations.
  - Screenshot evidence stored for checklist items.
  - Admin dashboard pulling live analytics.
- **Dependencies**
  - Requires data source validation from reporting-analytics module.

## Sprint 45

- **Objectives**
  - Activate track & trace and payment services (COMPL-001, COMPL-002).
  - Replace inspector portal mock data with live services (COMPL-011).
  - Update log retention and SIEM integration (COMPL-007).
- **Deliverables**
  - Track-trace API live with QR issuance.
  - Payment reconciliation tests passing.
  - Inspector workflows verified end-to-end.
  - Operations runbook updated with logging policy.

## Sprint 46

- **Objectives**
  - Document AI model governance (COMPL-005).
  - Validate IoT telemetry pipeline and alert thresholds (COMPL-012).
  - Consolidate notification services (COMPL-009).
- **Deliverables**
  - AI explainability report and lineage log.
  - Sensor ingestion acceptance test results.
  - Notification strategy documented and deployed.

## Sprint 47

- **Objectives**
  - Assess training module readiness (COMPL-013).
  - Decide on survey module consolidation and enable mandated surveys (COMPL-014).
  - Prepare release notes template with actual entries per `RELEASE_PREP_CHECKLIST.md`.
- **Deliverables**
  - Training records UI connected to backend.
  - Survey module decision note and implementation plan executed.
  - Draft release notes circulated for review.

## Sprint 48

- **Objectives**
  - Evaluate standards comparison module and align with compliance outputs (COMPL-015).
  - Conduct final compliance regression, archive redundant docs, and sign off release.
- **Deliverables**
  - Standards comparison decision + integration results.
  - Release readiness checklist signed and stored.

## Governance

- Weekly sync: review progress against plan, update `backlog.md`.
- All completed items must reference evidence (screenshots, logs) stored under `docs/evidence/<ticket>/`.
- Archive superseded project docs under `archive/` with date-stamped filenames.
