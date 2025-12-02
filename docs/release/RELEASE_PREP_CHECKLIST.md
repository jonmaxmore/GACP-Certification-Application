# Release Prep Checklist (Last Updated 2025-10-28)

## 1. Compliance Verification

- [ ] `docs/compliance/compliance-matrix.md` updated with latest evidence and approvals.
- [ ] All COMPL-### tickets reviewed; status reflects reality in `docs/compliance/backlog.md`.
- [ ] Cannabis-first UI audit executed using `docs/compliance/cannabis-first-checklist.md`; screenshots archived.
- [ ] Module inventory reflects current readiness (`module-inventory.md`).

## 2. Code Quality

- [ ] `pnpm run format:check`
- [ ] `pnpm run lint:all`
- [ ] `pnpm exec tsc --noEmit`
- [ ] `pnpm run test`
- [ ] Integration and E2E suites (Playwright/Artillery) run as required.

## 3. Documentation

- [ ] README and top-level docs updated to describe release scope.
- [ ] Deprecated docs moved to `archive/` with timestamped filename.
- [ ] Release notes drafted (template below) and reviewed.

## 4. Security & Operations

- [ ] Secrets validated (see `apps/backend/modules/shared/utils/validateSecrets.js`).
- [ ] Observability dashboards reviewed (logs, metrics, alerts).
- [ ] Backup & DR procedures confirmed.
- [ ] Vulnerability scan / dependency audit completed.

## 5. Deployment Steps

- [ ] Staging deployment verified with final regression (front + back).
- [ ] Production deployment plan (PM2/Docker/Terraform) double-checked.
- [ ] Rollback plan documented.
- [ ] Stakeholders notified with maintenance window.

## 6. Release Notes Template

```
# Release YYYY-MM-DD

## Highlights
- Feature A ...
- Improvement B ...
- Fix C ...

## Compliance & Evidence
- COMPL-### resolved with link to evidence.
- Cannabis-first audit outcome: PASS/FAIL (link to screenshots).

## Known Issues
- Issue description + workaround.

## Deployment Checklist
- [ ] Step 1
- [ ] Step 2
```
