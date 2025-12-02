# Compliance & Competitive Research Execution Plan

## 1. Purpose

Provide a structured programme to validate that every enabled module satisfies international GACP/GMP expectations and that the platform remains competitive with leading national or continental solutions before expanding functionality.

## 2. Scope

- **Certification Workflow** – Farmer, DTAM officer, inspector, approver journeys.
- **Traceability & Audit** – Seed-to-sale, document retention, evidence, digital signatures.
- **Payments & Finance** – Fee processing, reconciliation, refund handling.
- **IoT & Telemetry** – Sensor onboarding, data provenance, integrity, alerting.
- **AI & Analytics** – Recommendation transparency, bias controls, model governance.
- **Security & Privacy** – Authentication, authorization, data residency, incident response.

All investigations must confirm whether a code module already exists. Harden or refactor the existing component prior to proposing new builds.

## 3. Reference Standards & Sources

| Standard / System                        | Notes                                                                                |
| ---------------------------------------- | ------------------------------------------------------------------------------------ |
| **WHO GACP** (World Health Organization) | Core medicinal plant practices; baseline for documentation and inspections.          |
| **EU-GMP Annex 7**                       | Additional processing controls for herbal substances; map to post-harvest modules.   |
| **Health Canada CTLS & Cannabis Act**    | National seed-to-sale, reporting, inventory, and audit requirements.                 |
| **US METRC / BioTrack**                  | State-level cannabis tracking benchmarks for traceability and compliance automation. |
| **APEC / ASEAN Agricultural Guidelines** | Regional expectations for cross-border trade and data sharing.                       |
| **Thai DTAM Regulations**                | Local operating requirements, form templates, and inspection SOPs.                   |
| **ISO/IEC 27001 & ISO 27017**            | Security controls for cloud-hosted government solutions.                             |
| **OECD & EU AI Act Draft**               | Ethical AI guidance for Phase 3 services.                                            |

## 4. Workstreams & Deliverables

1. **Module Inventory Refresh**
   - Review existing repositories under `apps/` and `modules/`.
   - Produce matrix linking modules to functional requirements (`docs/compliance/module-inventory.xlsx` or `.md`).
   - Flag gaps, deprecated assets, duplicates to archive.

2. **Compliance Comparison Matrix**
   - Build `docs/compliance/compliance-matrix.md` enumerating regulatory clauses vs. implementation evidence.
   - Highlight remediation tasks (owner, priority, timeline).

3. **Competitor Benchmark Deep Dive**
   - Update `docs/COMPETITIVE_ANALYSIS.md` with findings from validated sources (regulator docs, vendor whitepapers).
   - Capture differentiators, parity targets, and strategic opportunities.

4. **Operational Readiness Audit**
   - Evaluate logging, monitoring, DR, IAM, and data lifecycle.
   - Document improvements in `docs/compliance/operational-readiness.md` with actionable backlog items.

5. **Governance & Reporting**
   - Establish change-log template for compliance updates.

- Schedule quarterly review cycle with DTAM stakeholders.

## 5. Execution Timeline (Indicative)

| Week | Milestone                                                                            |
| ---- | ------------------------------------------------------------------------------------ |
| 1    | Finalise research scope, access authoritative materials, align with DTAM legal team. |
| 2    | Complete module inventory refresh and draft compliance matrix skeleton.              |
| 3    | Deliver initial competitor benchmark appendix and assign remediation tasks.          |
| 4    | Present consolidated findings, approve backlog adjustments, and update roadmap.      |

## 6. Collaboration Guidelines

- Archive superseded manuals or conflicting documents under `archive/` with timestamped filenames.
- Record all source citations in the relevant markdown files to maintain traceability.
- Confirm cannabis is positioned as the first crop in every UI context when validating modules touching plant catalogues.
- Coordinate with backend and frontend owners to patch existing implementations before introducing new microservices or portals.
