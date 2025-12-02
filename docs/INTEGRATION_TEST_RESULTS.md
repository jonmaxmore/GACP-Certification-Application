# Integration Test Results

Date: October 31, 2025

## Test Coordination

- **Test Lead:** _Assign owner_
- **Participants:** _List QA/devs_
- **Environment:** _Staging / Local / AWS_
- **Data Set:** _Reference seed data or production snapshot_

## Summary

| Scenario | Description | Result | Evidence | Follow-up |
|----------|-------------|--------|----------|-----------|
| Multi-role workflow | Farmer submits → Inspector reviews → Admin approves → Certificate issued | ⏳ In Progress | _Link screenshots/API logs_ | Complete pending UI pieces |
| Certificate verification | Verify by number + QR code | ⚙️ Blocked | _Attach verify response_ | Detail page pending |
| Track & Trace lookup | QR code search → history table | ⚠️ Blocked | _N/A_ | Build frontend route |
| Survey submission | Inspector completes inspection survey | ⚠️ Blocked | _N/A_ | Implement form & submission |
| GACP comparison | Dashboard shows compliance deltas | ⚠️ Blocked | _N/A_ | Implement visualization |
| Auth token handling | Login/logout for all roles | ✅ Pass | _Attach auth logs_ | None |

## Detailed Test Logs

### 1. Farmer → Inspector → Admin → Certificate Flow

- **Steps Executed:**
  1. Login as Farmer and create new application (`/farmer/application/create`).
  2. Admin assigns inspector via `/admin/applications/:id/assign`.
  3. Inspector submits inspection report.
  4. Admin approves application and triggers certificate issuance.
  5. Certificate Portal verifies number and displays detail.
- **Status:** _Currently blocked at certificate detail UI._
- **Artifacts:** _Insert screenshots (Farmer submission, Admin dashboard, Inspector report) and raw API responses._

### 2. Authentication & Authorization

| Role | Login Route | Result | Token TTL | Notes |
|------|-------------|--------|-----------|-------|
| Farmer | `/login` | ✅ | _Value_ | Session persisted; localStorage token name `authToken`. |
| Inspector | `/login` | ✅ | _Value_ | Redirect to `/inspector/dashboard` confirmed. |
| Admin | `/login` | ✅ | _Value_ | Dashboard charts load after auth. |

### 3. API Endpoint Verification

| Endpoint | Method | Purpose | Status | Response Time | Notes |
|----------|--------|---------|--------|---------------|-------|
| `/api/applications` | GET | List applications | ✅ | _ms_ | Pagination OK |
| `/api/inspections/:id` | GET | Inspection detail | ✅ | _ms_ | Needs auth header |
| `/api/certificates/verify` | POST | Verify certificate | ⚙️ | _ms_ | Response OK, UI pending |
| `/api/trace/:id` | GET | Trace history | ⚠️ | _ms_ | Endpoint ready, no UI |

### 4. Automated Test Suites

| Suite | Command | Pass/Fail | Logs |
|-------|---------|-----------|------|
| Lint | `npm run lint` | ✅ | _Attach log excerpt_ |
| Type Check | `tsc --noEmit` | ✅ | _Attach log excerpt_ |
| Jest (unit/integration) | `pnpm --filter frontend test` | ✅ | _Attach summary_ |
| Playwright / E2E | `pnpm --filter frontend test:e2e` | ⏳ | _Pending scheduling_ |

## Issues & Blockers

1. Certificate Portal detail page still under development; integration flow stops here.
2. Track & Trace UI missing prevents end-to-end verification.
3. Survey form and GACP comparison dashboards need implementation to validate analytics endpoints.

## Next Steps

- Finish UI tasks per sprint plan.
- Re-run integration tests with updated evidence.
- Update results table and attach new logs.

## Sign-off

- **QA Lead:** _Sign & Date_
- **Product Owner:** _Sign & Date_
- **Engineering Lead:** _Sign & Date_
