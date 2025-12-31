# 📝 GACP Platform Changelog

All notable changes to this project will be documented in this file.

---

## [2.1.0] - 2025-12-31

### Added
- 🆕 **Shared Modules**
  - `@/lib/design-tokens.ts` - Centralized design system (23 colors)
  - `@/components/ui/icons.tsx` - 5 reusable SVG icons
  - `@/utils/thai-id-validator.ts` - 13-digit ID checksum validation
  - `@/utils/error-translator.ts` - 30+ EN→TH error mappings

- 🧪 **Testing Infrastructure**
  - Jest + ts-jest setup
  - Unit tests for thai-id-validator
  - Unit tests for error-translator
  - Chaos test suite (24 tests)

- 📚 **Documentation**
  - `docs/SHARED_UTILITIES.md` - Shared module usage guide
  - `docs/API.md` - API endpoint documentation

### Changed
- 🔄 **Refactored Auth Pages** (-220 lines)
  - login/page.tsx - Uses shared modules
  - register/page.tsx - Uses shared modules
  - forgot-password/page.tsx - Uses design tokens
  - register/success/page.tsx - Uses design tokens
  - staff/login/page.tsx - Uses shared modules
  - system-guard.tsx - Uses design tokens

- 🔧 **Backend Updates**
  - CORS config updated for production URL
  - Chaos test suite targets production

### Removed
- 🗑️ Dependencies: `axios`, `lucide-react`
- 🗑️ Dead files: 4 components archived
- 🗑️ Unused assets: `moph-logo.png` (338KB)

### Security
- ✅ Chaos tests pass: Injection, XSS, Token bypass
- ✅ Thai ID checksum validation

---

## [2.0.0] - 2025-12-30

### Added
- Initial production deployment to AWS EC2
- PostgreSQL + Prisma ORM
- Redis session store
- PM2 process management
- Nginx reverse proxy

---

## Previous Versions
See git history for earlier changes.
