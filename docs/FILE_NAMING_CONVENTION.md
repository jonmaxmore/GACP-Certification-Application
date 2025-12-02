# File Naming Convention Guide
## Botanical Audit Framework - Code Standards

**Version:** 1.0  
**Last Updated:** 2025-11-08  
**Status:** ✅ Enforced by ESLint

---

## 📋 Quick Reference

| Category | Convention | Example | Why? |
|----------|------------|---------|------|
| **Files (JS/TS)** | kebab-case | `auth-service.js` | Linux-safe, consistent |
| **Folders** | kebab-case | `modules/auth-farmer/` | URL-friendly, readable |
| **Classes** | PascalCase | `class UserService {}` | JavaScript standard |
| **Functions** | camelCase | `getUserData()` | JavaScript standard |
| **Constants** | UPPER_SNAKE_CASE | `MAX_RETRY_ATTEMPTS` | Visibility |
| **Env Variables** | UPPER_SNAKE_CASE | `MONGODB_URI` | Industry standard |
| **React Components** | PascalCase | `UserCard.tsx` | React convention |
| **Test Files** | kebab-case + `.test.js` | `user-service.test.js` | Jest pattern |

---

## 🎯 Why kebab-case for Files?

### Problem: Inconsistent Naming Causes Production Bugs

```javascript
// ❌ These all look different but might be the same file:
require('./AuthService.js')      // Windows: works
require('./authService.js')      // Linux: ERROR - file not found
require('./auth_service.js')     // Confusing - snake_case
require('./auth-Service.js')     // Mixed convention
```

**Result:** Works on developer's Mac, fails in Linux CI/CD! 🔥

### Solution: One Convention Everywhere

```javascript
// ✅ Always use kebab-case:
require('./auth-service.js')     // Works everywhere
```

**Benefits:**
- ✅ Case-insensitive OS (Windows, macOS) - works
- ✅ Case-sensitive OS (Linux, Docker) - works
- ✅ Git handles renames correctly
- ✅ URL-safe (can use in endpoints: `/api/auth-service`)
- ✅ Easy to read (hyphens natural word separators)

---

## 📁 Folder Structure Example

```
apps/backend/
├── config/
│   ├── mongodb-manager.js      ✅ kebab-case
│   ├── redis-manager.js         ✅ kebab-case
│   └── app-config.json          ✅ kebab-case
├── modules/
│   ├── auth-farmer/             ✅ kebab-case folder
│   │   ├── index.js             ✅ index is standard
│   │   ├── container.js         ✅ DI container
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   └── user.js      ✅ kebab-case
│   │   │   └── value-objects/
│   │   │       ├── email.js     ✅ kebab-case
│   │   │       └── password.js  ✅ kebab-case
│   │   ├── application/
│   │   │   └── use-cases/
│   │   │       ├── register-user.js    ✅ kebab-case
│   │   │       └── verify-email.js     ✅ kebab-case
│   │   └── __tests__/
│   │       ├── register-user.test.js   ✅ test suffix
│   │       └── user.test.js            ✅ test suffix
│   └── auth-dtam/               ✅ kebab-case folder
├── services/
│   ├── logger.js                ✅ single word
│   ├── email-service.js         ✅ kebab-case
│   └── notification-service.js  ✅ kebab-case
└── shared/
    ├── logger.js                ✅ standard name
    ├── constants.js             ✅ standard name
    └── response-helpers.js      ✅ kebab-case
```

---

## 🔧 Class Names Inside Files

Even though **files use kebab-case**, **classes use PascalCase**:

```javascript
// ✅ File: user-service.js
class UserService {  // ✅ Class: PascalCase
  constructor() {}
  
  getUserById(id) {  // ✅ Method: camelCase
    // ...
  }
}

module.exports = UserService;
```

---

## 🧪 Test Files

```
__tests__/
├── domain/
│   ├── user.test.js             ✅ Matches: domain/entities/user.js
│   ├── email.test.js            ✅ Matches: domain/value-objects/email.js
│   └── password.test.js         ✅ Matches: domain/value-objects/password.js
├── application/
│   ├── register-user.test.js    ✅ Matches: application/use-cases/register-user.js
│   └── verify-email.test.js     ✅ Matches: application/use-cases/verify-email.js
└── integration/
    └── auth.integration.test.js ✅ kebab-case + descriptive suffix
```

**Pattern:** `{filename}.test.js` or `{filename}.integration.test.js`

---

## ⚙️ Configuration Files (Exceptions)

Some files have **standard names** in the ecosystem - keep them:

```
✅ package.json          (npm standard)
✅ tsconfig.json         (TypeScript standard)
✅ jest.config.js        (Jest standard)
✅ .eslintrc.json        (ESLint standard)
✅ .prettierrc           (Prettier standard)
✅ .env                  (dotenv standard)
✅ Dockerfile            (Docker standard)
✅ README.md             (GitHub standard)
✅ CHANGELOG.md          (semantic versioning)
✅ LICENSE               (open source standard)
```

---

## 🚫 What NOT to Do

### ❌ Mixed Case in File Names

```
❌ AuthService.js
❌ userRepo.js
❌ database_helper.js
❌ MongoDBManager.ts
❌ MyComponent.jsx
```

### ❌ Spaces in File Names

```
❌ user service.js
❌ helper functions.js
❌ my component.tsx
```

### ❌ Inconsistent Naming in Same Folder

```
❌ services/
    ├── AuthService.js      (PascalCase)
    ├── userRepo.js         (camelCase)
    ├── email_sender.js     (snake_case)
    └── logger.js           (kebab-case) ✅ only this is correct
```

---

## 🛠️ Migration Tools

### Automated Rename Script

```bash
# Dry run (preview changes):
node scripts/rename-to-kebab.js --dry-run

# Execute rename:
node scripts/rename-to-kebab.js --execute
```

### ESLint Enforcement

Our `.eslintrc.json` enforces kebab-case:

```json
{
  "rules": {
    "unicorn/filename-case": ["error", { "cases": { "kebabCase": true } }]
  }
}
```

**Result:** ESLint will show error if you create `AuthService.js` instead of `auth-service.js`

---

## 📊 Before & After

### Before (Inconsistent) ❌

```
services/
├── AuthService.js       (PascalCase)
├── userRepo.js          (camelCase)
├── database_helper.js   (snake_case)
├── MongoDBManager.js    (mixed)
└── emailSender.js       (camelCase)
```

### After (Consistent) ✅

```
services/
├── auth-service.js
├── user-repository.js
├── database-helper.js
├── mongodb-manager.js
└── email-sender.js
```

---

## 🎓 Senior Engineer Mindset

> "File names are the interface for humans - they must be predictable."

1. **Consistency > Personal Preference**
   - Everyone uses kebab-case, even if you prefer camelCase
   
2. **Think Cross-Platform**
   - Your Mac is case-insensitive, production Linux is not
   
3. **Future-Proof**
   - New team members don't need to guess naming style
   
4. **Tool-Friendly**
   - Works with URLs, git, imports, require(), etc.

---

## ✅ Checklist for New Files

Before creating a new file, ask:

- [ ] Is it kebab-case? (e.g., `user-service.js`)
- [ ] Does it describe what it does? (not just `helper1.js`)
- [ ] Is the folder also kebab-case?
- [ ] If it's a test, does it end with `.test.js`?
- [ ] If it's a config, is it a known standard name?

---

## 🚀 Enforcement

### Automatic (Recommended)

1. **ESLint** - catches wrong names before commit
2. **Pre-commit hook** - prevents bad names from being committed
3. **CI/CD check** - fails build if violations found

### Manual

1. **Code review** - check naming in PRs
2. **Periodic audit** - run rename script quarterly

---

## 📚 Resources

- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)
- [MDN Naming Conventions](https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Writing_style_guide/Code_style_guide/JavaScript#naming_conventions)

---

**Questions?** Check with the team lead before deviating from these conventions.

**Found a file that doesn't follow this?** Run the rename script or fix it in your PR.
