# CLEANUP-XXX — Fix act(...) warnings in page.test.tsx

**Project:** certificate-portal  
**Assignee:** @Pongpuwanat  
**Reviewer:** @qa.lead  
**Due date:** 2025-11-07  
**Priority:** Low → Medium  
**Linked Issue:** [#123](https://github.com/jonmaxmore/Botanical-Audit-Framework/issues/123)

---

## Scope

Remove the `act(...)` warnings emitted by `apps/certificate-portal/app/verify/__tests__/page.test.tsx` during the certificate-portal Jest run while keeping all tests passing locally and in CI.

---

## Acceptance Criteria

- No `act(...)` warnings appear in Jest logs for the certificate-portal project.
- All related tests pass locally (exit code 0) and in CI.
- Husky pre-push hook no longer blocks pushes due to these warnings.
- PR includes a short explanation of the test hygiene changes.

---

## Reproduction

```bash
npm install
npm run test -- certificate-portal
```

Observe the `act(...)` warnings in the console output referencing `apps/certificate-portal/app/verify/__tests__/page.test.tsx`.

---

## Suggested Fix

1. Review async interactions in the test file (`fireEvent`, `userEvent`, timers, mock resolutions, etc.).
2. Wrap state-changing interactions in `await act(async () => { ... })` or rely on `await screen.findBy...` / `await waitFor(...)`.
3. For fake timers, advance them within an `act()` wrapper (for example, `await act(async () => { jest.runAllTimers(); });`).
4. Re-run `npm run test -- certificate-portal` to ensure the warnings are gone and tests still pass.

```typescript
import { act } from '@testing-library/react';

await act(async () => {
  userEvent.click(button);
  await waitFor(() => expect(screen.getByText('Success')).toBeInTheDocument());
});
```

---

## Verification Checklist

- [ ] `npm run test` passes for all three Jest projects locally (exit code 0).
- [ ] Console output has no `act(...)` warnings in certificate-portal tests.
- [ ] Husky pre-push checks succeed.
- [ ] CI pipeline passes without regressions.
- [ ] PR note documents the removal of `act(...)` warnings and lack of production impact.

---

## Confirmation

✅ Verified no `act(...)` warnings remain after running `npm run test -- certificate-portal`

✅ All certificate-portal suites pass in CI

✅ PR merged and ticket closed
