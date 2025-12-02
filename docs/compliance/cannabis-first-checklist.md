# Cannabis-First UI Verification Checklist

All menus, forms, tables, and reports must list “Cannabis” (หรือ “กัญชา/กัญชง”) as the first option when referencing supported crops. Use this checklist during every release cycle.

## 1. Frontend Portals

### Farmer Portal (`apps/frontend/pages/farmer/`)

- `applications.tsx` – application filters, table headers, summary chips.
- `application/create.tsx` – crop selector, cultivation plan tabs, document upload labels.
- `farms.tsx` – farm registration crop dropdown and default card ordering.
- `profile.tsx` – preferred crop selector or interest tags.
- `documents.tsx` / `certificates.tsx` – document type lists and certificate cards.

### Inspector Portal (`apps/frontend/pages/inspector/`)

- `applications.tsx` – review queue filters.
- `schedule.tsx` – inspection creation modal crop dropdown.
- `reports.tsx` – report templates and export options.

### Approver & Document Checker

- `approver/dashboard.tsx` – KPI cards and charts (ensure cannabis metrics lead).
- `document-checker/dashboard.tsx` & `review/[id].tsx` – document category ordering.

### Admin Portal

- `admin/dashboard.tsx` – system summary widgets and charts show cannabis first.
- Side navigation or quick links referencing crop analytics.

### Shared Pages

- `login.tsx` – demo credential list lists cannabis farmer first.
- `services/*` – marketing content emphasises cannabis before other medicinal plants.
- Homepage (`index.tsx`) – hero content, feature grids, and CTA buttons.

## 2. Backend & Data Seeds

- `apps/backend/modules/farm-management` – default crop enumerations set cannabis as index 0.
- `apps/backend/modules/track-trace` – product/category lookup tables.
- `apps/frontend/data/*` and `apps/backend/resources/*` – seed data arrays order cannabis first.
- `openapi/*.yaml` – documentation examples reference cannabis first.

## 3. Analytics & Reports

- `apps/backend/modules/reporting-analytics` – ensure dashboards aggregate cannabis metrics before others.
- Export templates (CSV, PDF) list cannabis columns first.
- Any PowerBI/Tableau definitions (if stored) follow same rule.

## 4. Validation Steps

1. Manually inspect each UI location in staging.
2. Run automated UI tests (when available) to assert ordering.
3. Capture screenshots for audit records.
4. Record findings in the compliance backlog (e.g., `COMPL-004` subtasks).

Archive evidence of completed checks for each release cycle.
