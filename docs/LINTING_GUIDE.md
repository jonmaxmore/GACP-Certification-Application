# Linting and Code Quality Guide

**Last Updated:** October 26, 2025
**Platform Version:** 2.0.0

---

## Overview

This guide explains how to use linting and code quality tools in the GACP Platform. The project now has **automatic linting on every commit** using Husky and lint-staged.

---

## Tools Installed

### 1. ESLint

- **Purpose:** JavaScript linting and code quality checks
- **Config:** `.eslintrc.json` (root), `apps/backend/.eslintrc.js` (backend)
- **Version:** 8.57.1

### 2. Prettier

- **Purpose:** Code formatting
- **Config:** `.prettierrc` (root)
- **Version:** 3.6.2

### 3. Husky

- **Purpose:** Git hooks management
- **Config:** `.husky/` directory
- **Version:** 9.1.7

### 4. lint-staged

- **Purpose:** Run linters on staged files only (faster)
- **Config:** `package.json` → `lint-staged` section
- **Version:** 16.2.6

---

## Automatic Linting (Pre-commit Hook)

### How It Works

**Every time you commit**, the following happens automatically:

1. **Git Commit Command:** You run `git commit -m "message"`
2. **Husky Triggers:** Pre-commit hook activates
3. **lint-staged Runs:** Only checks files you're committing (staged files)
4. **Auto-fix Applied:** Prettier formats code, ESLint fixes auto-fixable issues
5. **Commit Proceeds:** If no errors, commit succeeds
6. **Commit Blocked:** If unfixable errors exist, commit fails with error report

### Example

```bash
# Make changes to files
vim apps/backend/routes/test.js

# Stage files for commit
git add apps/backend/routes/test.js

# Try to commit
git commit -m "Add new test route"

# Output:
# ✔ Preparing lint-staged...
# ⚠ Running tasks for staged files...
#   ✔ apps/backend/**/*.{js,ts,json} — 2 files
#     ✔ prettier --write
#     ✔ eslint --fix
# ✔ Applying modifications from tasks...
# ✔ Cleaning up temporary files...
# [main 1a2b3c4] Add new test route
#  1 file changed, 10 insertions(+)
```

---

## Manual Linting Commands

### Check All Code (No Fixing)

```bash
# Check frontend and backend
npm run lint:all

# Check backend only
npm run lint:backend

# Check frontend only
npm run lint
```

### Auto-fix Issues

```bash
# Fix backend issues + format all code
npm run lint:fix

# Fix backend only
npm run lint:backend:fix

# Format all code only (no eslint)
npm run format
```

### Check Formatting Only

```bash
# Check if code is formatted correctly (CI/CD)
npm run format:check
```

---

## Current Lint Status

### Summary (October 26, 2025)

**Total Issues:** 392 problems

- **Errors:** 179
- **Warnings:** 213
- **Auto-fixable:** 1 error, 0 warnings

### Critical Errors Fixed (Oct 26)

✅ **3 Critical Errors Fixed:**

1. `middleware/request-validator.js:51` - Unnecessary escape character `\/`
   - Fixed: Changed `/:[^\/]+/g` → `/:[^/]+/g`

2. `modules/application/config/index.js:1029` - Unsafe hasOwnProperty access
   - Fixed: Changed `override.hasOwnProperty(key)` → `Object.prototype.hasOwnProperty.call(override, key)`

3. `modules/application/infrastructure/integrations/government-api-integration.js:255` - Reassigning const
   - Fixed: Changed `const overallStatus` → `let overallStatus`

### Remaining Issues (Non-blocking)

**Most Common Issues:**

1. **`no-unused-vars` (213 warnings):** Variables declared but never used
   - Example: `const logger = require('./logger')` but logger not used
   - **Fix:** Remove unused variables or add `// eslint-disable-next-line no-unused-vars`

2. **`no-prototype-builtins` (1 error):** Unsafe Object.prototype method access
   - Fixed in most files, a few remaining

3. **`no-unreachable` (1 error):** Code after return statement
   - Example: `return x; console.log('unreachable');`
   - **Fix:** Remove unreachable code

4. **`no-dupe-keys` (1 error):** Duplicate object keys
   - Example: `{ warnings: [], warnings: {} }`
   - **Fix:** Rename one of the duplicate keys

---

## Lint-staged Configuration

### Current Rules (package.json)

```json
{
  "lint-staged": {
    "apps/frontend/**/*.{js,jsx,ts,tsx,json,css}": ["prettier --write", "eslint --fix"],
    "apps/backend/**/*.{js,ts,json}": ["prettier --write", "eslint --fix"],
    "frontend-nextjs/**/*.{js,jsx,ts,tsx,json,css}": ["prettier --write", "eslint --fix"],
    "*.md": ["prettier --write"]
  }
}
```

### What Gets Checked

- ✅ Backend code (`apps/backend/**/*.js`)
- ✅ Frontend code (`apps/frontend/**/*.{js,jsx,ts,tsx}`)
- ✅ Next.js frontend (`frontend-nextjs/**`)
- ✅ JSON files (`**/*.json`)
- ✅ Markdown files (`*.md`)

### What Gets Applied

1. **Prettier:** Auto-formats code (spacing, line length, etc.)
2. **ESLint:** Fixes auto-fixable issues (unused vars, etc.)

---

## NPM Scripts Reference

| Command                    | Description                         | Use When               |
| -------------------------- | ----------------------------------- | ---------------------- |
| `npm run lint:all`         | Check all code (frontend + backend) | Before pushing to main |
| `npm run lint:backend`     | Check backend only                  | Working on backend     |
| `npm run lint:backend:fix` | Fix backend issues                  | Cleaning up code       |
| `npm run lint:fix`         | Fix backend + format all            | Major cleanup          |
| `npm run format`           | Format all code with Prettier       | Quick format           |
| `npm run format:check`     | Check if formatted correctly        | CI/CD pipeline         |

---

## Disabling Linting (When Necessary)

### Disable for One Line

```javascript
// eslint-disable-next-line no-unused-vars
const unusedVar = 'I know this is unused';
```

### Disable for Multiple Lines

```javascript
/* eslint-disable no-unused-vars */
const var1 = 'unused';
const var2 = 'unused';
/* eslint-enable no-unused-vars */
```

### Disable for Entire File

```javascript
/* eslint-disable */
// All code here is not linted
```

### Disable for Specific Rule

```javascript
/* eslint-disable no-unused-vars, no-console */
// Only these rules disabled
```

**⚠️ Warning:** Only disable linting when absolutely necessary!

---

## Bypassing Pre-commit Hook (Emergency Only)

### Skip Pre-commit Hook

```bash
# Use --no-verify flag (NOT RECOMMENDED)
git commit -m "Emergency fix" --no-verify
```

**⚠️ Use only in emergencies:**

- Production down and need immediate hotfix
- CI/CD pipeline broken
- Linting tool has bugs

**After emergency, create a follow-up PR to fix linting issues!**

---

## ESLint Rules

### Current Configuration

**Root `.eslintrc.json`:**

- Extends: `next`, `prettier`
- Plugins: `prettier`

**Backend `apps/backend/.eslintrc.js`:**

- Environment: Node.js, ES2021
- Extends: `eslint:recommended`, `prettier`
- Rules customized for backend

### Key Rules

| Rule                    | Severity | Description                        |
| ----------------------- | -------- | ---------------------------------- |
| `no-unused-vars`        | warn     | Variables declared but never used  |
| `no-console`            | off      | Console.log allowed                |
| `no-undef`              | error    | Variables used without declaration |
| `no-const-assign`       | error    | Reassigning const variables        |
| `no-prototype-builtins` | error    | Unsafe Object.prototype method     |
| `no-useless-escape`     | error    | Unnecessary escape characters      |

---

## Prettier Configuration

### Current Settings (`.prettierrc`)

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### What Prettier Does

- ✅ Max line length: 100 characters
- ✅ Indentation: 2 spaces (no tabs)
- ✅ Semicolons: Required
- ✅ Quotes: Single quotes (')
- ✅ Trailing commas: Always add
- ✅ Line endings: LF (Unix-style)

---

## Troubleshooting

### Problem: "Husky command not found"

**Solution:**

```bash
# Reinstall Husky
pnpm install -D -w husky
npx husky init
```

### Problem: "lint-staged not running"

**Solution:**

```bash
# Check if pre-commit hook exists
ls .husky/pre-commit

# Manually run lint-staged
npx lint-staged
```

### Problem: "Commit always fails"

**Solution:**

```bash
# Check what's failing
npm run lint:backend

# Fix issues manually
npm run lint:backend:fix

# Try commit again
git commit -m "message"
```

### Problem: "Too many lint errors"

**Solution:**

```bash
# Fix one file at a time
cd apps/backend
npx eslint middleware/auth.js --fix

# Or fix all auto-fixable issues
npm run lint:fix

# For remaining errors, fix manually
```

### Problem: "Want to see all errors"

**Solution:**

```bash
# Run lint without --fix to see all issues
cd apps/backend
npm run lint > lint-report.txt

# Open and review
cat lint-report.txt
```

---

## CI/CD Integration

### Recommended GitHub Actions Workflow

```yaml
name: Lint and Format Check

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '24'

      - name: Install pnpm
        run: npm install -g pnpm@8.15.0

      - name: Install dependencies
        run: pnpm install

      - name: Check formatting
        run: npm run format:check

      - name: Lint backend
        run: npm run lint:backend
```

---

## Best Practices

### 1. Commit Frequently

**Good:**

```bash
# Small commits with focused changes
git commit -m "Fix auth middleware validation"
git commit -m "Add logger to payment service"
```

**Bad:**

```bash
# Large commits with many files
git commit -m "Fix everything"  # 50 files changed
```

### 2. Review Lint Errors Before Committing

```bash
# Always run lint before committing
npm run lint:backend

# Fix issues
npm run lint:backend:fix

# Then commit
git add .
git commit -m "message"
```

### 3. Use Meaningful Variable Names

**Good:**

```javascript
const userEmail = getUserEmail();
const validatedData = validateRequest(req.body);
```

**Bad:**

```javascript
const x = getUserEmail(); // What is x?
const temp = validateRequest(req.body); // Temporary what?
```

### 4. Remove Unused Code

**Before:**

```javascript
const logger = require('./logger'); // Not used
const fs = require('fs'); // Not used

function doSomething() {
  return true;
}
```

**After:**

```javascript
function doSomething() {
  return true;
}
```

---

## Roadmap

### Phase 1: Setup (✅ Completed - Oct 26, 2025)

- ✅ Install Husky and lint-staged
- ✅ Configure pre-commit hooks
- ✅ Fix 3 critical errors
- ✅ Create documentation

### Phase 2: Fix Remaining Errors (⏳ Planned)

- 🔄 Fix 179 remaining errors
- 🔄 Fix 213 warnings
- 🔄 Refactor complex files

### Phase 3: Strict Mode (⏳ Future)

- ⏳ Enable stricter ESLint rules
- ⏳ Add TypeScript linting
- ⏳ Add import order linting
- ⏳ Add unused-exports detection

---

## Additional Resources

### Official Documentation

- **ESLint:** https://eslint.org/docs/latest/
- **Prettier:** https://prettier.io/docs/en/
- **Husky:** https://typicode.github.io/husky/
- **lint-staged:** https://github.com/okonet/lint-staged

### GACP Platform Docs

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [DEPRECATED.md](./DEPRECATED.md) - Deprecated code
- [README.md](../README.md) - Project overview

---

## Questions?

If you have questions about linting:

1. **Check this guide first**
2. **Check ESLint error message** - Usually explains the issue
3. **Ask in team chat** or create an issue
4. **Refer to ESLint docs** for specific rules

---

**Remember:** Linting is your friend! It helps catch bugs early and keeps code consistent across the team. 🎯

---

**Maintained By:** GACP Platform Team
**Last Review:** October 26, 2025
**Next Review:** November 26, 2025
