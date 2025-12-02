# Repository Inventory (Depth 2 Snapshot)

Generated: 2025-11-01

## Top-Level Overview

| Path                                              | Notes                                                                                           |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `app/`                                            | Contains `frontend/` copy of Next.js app – verify if redundant with `apps/frontend/`.           |
| `apps/`                                           | Primary multi-app workspace (admin, farmer, certificate, backend, frontend).                    |
| `archive/`                                        | Organized archives (`migration-reports/`, `research-hdc-2025/`, `weekly-reports/`).             |
| `backend/`                                        | Legacy service scripts and helpers separate from `apps/backend/`; needs consolidation decision. |
| `business-logic/`                                 | Standalone JS modules (GACP systems); unclear if still referenced.                              |
| `config/`                                         | Shared configuration JS/ENV templates.                                                          |
| `database/`                                       | Migration scripts, Prisma schema, models; appears active.                                       |
| `docs/`                                           | Extensive documentation hub (00\_… directories, guides, new maintenance notes).                 |
| `examples/`                                       | Sample usage snippets.                                                                          |
| `infrastructure/`, `k8s/`, `terraform/`, `nginx/` | Deployment configurations.                                                                      |
| `packages/`                                       | Shared workspaces (`config`, `constants`, `types`, `ui`, `utils`).                              |
| `public/`                                         | Legacy static assets (check `legacy-backup/`).                                                  |
| `scripts/`                                        | Automation/maintenance scripts (recent cleanup helpers present).                                |
| `node_modules/`, `.turbo/`, `.trunk/`             | Build artefacts / tooling metadata.                                                             |

## Notable Subdirectories (Depth ≤ 2)

- `archive/research-hdc-2025/docs/` now holds all HDC research markdowns; `experiments/`, `meetings/`, `scripts/` keep `.gitkeep` placeholders.
- `docs/` top level has numerous themed folders (`00_PROJECT_OVERVIEW/`, `05_DEPLOYMENT/`, `platform/`, `services/`, etc.) plus individual markdowns; duplicates/overlaps may need grouping.
- `scripts/` houses many cleanup and database utilities; new `cleanup-build-artifacts.{ps1,sh}` and `archive-markdown.js` confirmed.
- `public/legacy-backup/` should be reviewed—unclear if safe to archive.
- `.storybook/` present alongside monorepo frontends; ensure storybook config is still in use.

## Items Requiring Clarification

1. **`app/frontend/` vs `apps/frontend/`** – determine if both are needed or if `app/` is an obsolete copy from earlier Next.js structure.
2. **`backend/` root folder** – legacy services overlap with `apps/backend/`; confirm live references before moving under `apps/` or `archive/`.
3. **`business-logic/` modules** – confirm consumers (perhaps via import search) to decide whether to integrate into packages or archive.
4. **Standalone deployment scripts (`deploy-*.ps1`, `.sh`)** – identify which are current vs superseded by `scripts/deploy/` or infrastructure automation.
5. **Large number of documentation markdowns in `docs/` root** – consider categorizing into existing subfolders to reduce clutter.
6. **Presence of both `package.json` and `package.json (partial)`** – investigate origin of the partial file to avoid confusion.
7. **`node_modules/` checked in** – verify if required for tooling (pnpm workspace) or if it should be pruned/ignored.

## Next Steps

- Review the outstanding questions above with stakeholders.
- Once clarified, draft the target hierarchy in `docs/STRUCTURE_GUIDE.md` and plan `git mv` operations accordingly.

### Resolutions (to be filled)

- `app/frontend` vs `apps/frontend`: _pending review_
- `backend/` root folder reuse: _pending review_
- `business-logic/` consumer check: _pending review_
- Deployment script consolidation: _pending review_
- `docs/` markdown reorganisation approach: _pending review_
- `package.json (partial)` status: _pending review_
- `node_modules/` version control policy: _pending review_
