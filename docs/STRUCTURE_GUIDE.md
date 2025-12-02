# Repository Structure Guide

Last updated: 2025-11-01

## Objectives

- Present a predictable top-level layout for all source, infrastructure, documentation, and archived assets.
- Minimise duplicate entry points (e.g. multiple frontend or backend roots).
- Preserve historical material in clearly labelled archive areas.
- Document the workflow for adding new files so the structure remains consistent.

## Confirmed Top-Level Layout

| Category                                          | Purpose                                                                               | Owner              | Notes                                                                  |
| ------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------ | ---------------------------------------------------------------------- |
| `apps/`                                           | Active applications (admin, farmer, certificate, backend API, shared frontend shell). | Platform Eng.      | Single source of truth for deployable apps.                            |
| `packages/`                                       | Shareable libraries (config, constants, types, UI, utils).                            | Platform Eng.      | Published via pnpm workspace.                                          |
| `scripts/`                                        | Operational/maintenance scripts.                                                      | DevOps             | Include new cleanup helpers; keep README updated.                      |
| `docs/`                                           | Authoritative documentation.                                                          | PMO / Tech Writing | Use thematic folders plus curated root index.                          |
| `infrastructure/`, `k8s/`, `terraform/`, `nginx/` | Deployment manifests.                                                                 | DevOps             | Keep separated by technology.                                          |
| `archive/`                                        | Frozen or historical content.                                                         | PMO                | Nested by initiative (`research-hdc-2025`, `migration-reports`, etc.). |
| `examples/`                                       | Small code samples for reference.                                                     | Platform Eng.      | Move canonical tutorials into docs when stable.                        |
| `public/`                                         | Shared static assets.                                                                 | Frontend           | Review `legacy-backup/` for archiving.                                 |
| Root scripts (`deploy-*.ps1`, `.sh`)              | Legacy deployment entry points.                                                       | DevOps             | Replace with script packages or move into `scripts/deploy/`.           |

## Items Requiring Decision

1. **`app/frontend/` duplication**
   - Inspect commit history and imports to confirm it is an outdated copy.
   - If unused: move entire `app/` directory into `archive/_holding/2025-11-01-app-frontend/`.
2. **`backend/` directory (outside `apps/`)**
   - Determine whether any services/scripts are unique.
   - Preferred approach: fold required modules into `apps/backend/` or a dedicated `packages/backend-*` library. Otherwise archive.
3. **`business-logic/` modules**
   - Run workspace-wide search (`rg "business-logic" -g"*.{js,ts,tsx}"`).
   - If actively imported, migrate modules into `packages/` under a new `packages/business-logic/`. If orphaned, archive them.
4. **Root-level deployment scripts**
   - Review each `deploy*.ps1/.sh` and `start-*.js` to document live usage.
   - Consolidate operational scripts into `scripts/deploy/` or reference them from `docs/MAINTENANCE.md`.
5. **`docs/` root markdown sprawl**
   - Tag each file with intended category.
   - Move into existing folders (`05_DEPLOYMENT`, `platform/`, etc.) or create new subfolders (`audits/`, `summaries/`).
   - Maintain a curated `docs/README.md` linking to major sections.
6. **`package.json (partial)`**
   - Identify provenance; likely temporary note.
   - Either merge contents into root `package.json` or move to `archive/_holding/`.
7. **Checked-in `node_modules/`**
   - Confirm with tooling owners whether committed artifacts are intentional (e.g. packaged CLI).
   - If not required, remove and ensure `.gitignore` prevents future commits.

## Proposed Migration Plan

1. **Validation**
   - Owners sign off on decisions above.
   - Track outcomes in `docs/INVENTORY.md` under a new “Resolutions” section.
2. **Preparation**
   - Create dated folders inside `archive/_holding/` for any large moves.
   - Update build/test scripts if paths change.
3. **Execution (by batch)**
   - Move redundant frontend/backends (`git mv app/frontend archive/_holding/...`).
   - Relocate `business-logic/` modules according to decision.
   - Restructure `docs/` (grouping markdowns) with focused commits.
   - Consolidate deployment scripts inside `scripts/` or document deprecation.
4. **Post-migration**
   - Run `pnpm lint`, `pnpm type-check`, and smoke tests for each affected app.
   - Update `docs/MAINTENANCE.md` to reflect new conventions.
   - Announce structure changes to the team (release notes, Slack, etc.).

## Guidelines for Future Additions

- Applications ➜ `apps/<app-name>/` (no new root-level directories).
- Shared code ➜ create or extend a `packages/<scope>/` module.
- Documentation ➜ place under an existing thematic folder in `docs/`; update `docs/README.md` for discoverability.
- Experiments or deprecated content ➜ `archive/<project>/<year>/` with README explaining context.
- Temporary or generated assets ➜ keep outside version control unless explicitly required; otherwise put in `archive/_holding/`.
