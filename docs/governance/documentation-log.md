# Documentation Log

Each entry records context, rationale, and next actions for documentation updates across experiments and tooling.

---

### Entry Template
**Date:** YYYY-MM-DD  
**Author:**  
**Context:**  
**Change Summary:**  
**Next Action:**  
**Related Files:**

---

### Entry
**Date:** 2025-11-01  
**Author:** Pending  
**Context:** Alignment on experiment documentation structure.  
**Change Summary:** Added plain-language checklist references and noted automation follow-up.  
**Next Action:** Extend schema/automation callouts to tooling docs after metrics automation integration.  
**Related Files:** docs/research/experiments/README.md, docs/research/experiments/exp-001/metrics_evaluation/schema-verification-checklist.md

---

### Planned Enhancement
**Description:** Introduce automation (GitHub Action or pre-commit hook) to ensure `DOCUMENTATION_LOG.md` updates accompany structural doc changes.  
**Enable When:** Documentation cadence increases and logging compliance becomes a recurring reminder.  
**Ownership:** Documentation maintainers / DevOps.

---

### Entry
**Date:** 2025-11-01  
**Author:** Pending  
**Context:** Consolidation of platform services for final scope alignment.  
**Change Summary:** Created `docs/SERVICE_MANIFEST.md` and updated README with the definitive list of eleven production services.  
**Next Action:** Audit existing docs/code for references to deprecated services and archive or update accordingly.  
**Related Files:** docs/SERVICE_MANIFEST.md, README.md

---

### Entry
**Date:** 2025-11-01  
**Author:** Pending  
**Context:** Archived hyperdimensional computing research materials per "11 service" scope decision.  
**Change Summary:** Moved HDC docs, meetings, experiments, and scripts into `archive/research-hdc-2025/`; replaced `docs/research` contents with pointers and safeguards.  
**Next Action:** Confirm no build/test tooling references the legacy script paths before removing placeholders.  
**Related Files:** archive/research-hdc-2025/**/*, docs/research/**/*

---

### Entry
**Date:** 2025-11-01  
**Author:** Pending  
**Context:** Follow-up cleanup to keep working tree aligned with the eleven-service scope.  
**Change Summary:** Removed leftover HDC placeholder files/directories from `docs/research`, leaving only the documentation log and redirect README.  
**Next Action:** Monitor for broken links in docs; update references if consumers report missing paths.  
**Related Files:** docs/research/README.md

---

### Entry
**Date:** 2025-11-01  
**Author:** GitHub Copilot  
**Context:** Established documentation skeleton for the eleven in-scope services and supporting platform areas.  
**Change Summary:** Created governance tracker, platform section scaffolding, and per-service README templates to guide migration.  
**Next Action:** Migrate approved content into the new structure and update legacy links once validations (archive approvals, link checks) are complete.  
**Related Files:** docs/README.md, docs/governance/archive-validation.md, docs/platform/**/*, docs/services/**/*

---

### Entry
**Date:** 2025-11-01  
**Author:** GitHub Copilot  
**Context:** First migration batch for survey and standards services under the manifest-driven structure.  
**Change Summary:** Enriched service READMEs with content from legacy guides, documented approval requests, and populated platform navigation guidance.  
**Next Action:** Secure owner approvals, continue migrating remaining service docs, and run link/reference validation before final commit.  
**Related Files:** docs/services/survey-self-assessment/README.md, docs/services/standards-comparison/README.md, docs/governance/archive-validation.md, docs/platform/README.md, docs/SURVEY_SERVICE_GUIDE.md, docs/SUSTAINABLE_NATIONAL_STANDARD_ARCHITECTURE.md
