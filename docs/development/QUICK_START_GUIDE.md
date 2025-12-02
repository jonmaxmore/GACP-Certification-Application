# 🚀 GACP Platform - Quick Start Guide

**Version**: 2.0.0 (Turborepo Monorepo)  
**Updated**: October 14, 2025

---

## ⚡ Quick Commands

### Start Development

```bash
# Start everything (Backend + All Frontend Apps)
pnpm dev

# Start backend only
pnpm dev --filter=@gacp/backend

# Start farmer portal only
pnpm dev --filter=@gacp/farmer-portal

# Start multiple apps
pnpm dev --filter=@gacp/backend --filter=@gacp/farmer-portal
```

### Build & Deploy

```bash
# Build all apps
pnpm build

# Build specific app
pnpm build --filter=@gacp/farmer-portal

# Start production
pnpm start
```

### Testing & Quality

```bash
# Run all tests
pnpm test

# Lint all code
pnpm lint

# Type check
pnpm type-check

# Clean everything
pnpm clean
```

---

## 🌐 Access URLs

| Service            | URL                   | Status     |
| ------------------ | --------------------- | ---------- |
| **Backend API**    | http://localhost:3004 | ✅ Running |
| **Farmer Portal**  | http://localhost:3001 | ✅ Running |
| DTAM Portal        | http://localhost:3002 | Ready      |
| Certificate Portal | http://localhost:3003 | Ready      |
| Survey Portal      | http://localhost:3005 | Ready      |
| Trace Portal       | http://localhost:3006 | Ready      |
| Standards Portal   | http://localhost:3007 | Ready      |
| Farm Management    | http://localhost:3008 | Ready      |
| Admin Portal       | http://localhost:3009 | Ready      |

---

## 📦 Project Structure

```
gacp-platform/
├── apps/
│   ├── backend/              (Express API - port 3004)
│   ├── farmer-portal/        (Next.js - port 3001)
│   ├── dtam-portal/          (Next.js - port 3002)
│   ├── certificate-portal/   (Next.js - port 3003)
│   ├── farm-management-portal/ (Next.js - port 3008)
│   ├── survey-portal/        (Next.js - port 3005)
│   ├── trace-portal/         (Next.js - port 3006)
│   ├── standards-portal/     (Next.js - port 3007)
│   └── admin-portal/         (Next.js - port 3009)
│
├── packages/
│   ├── ui/                   (Shared React components)
│   ├── types/                (TypeScript type definitions)
│   ├── config/               (Shared configurations)
│   ├── utils/                (Utility functions)
│   └── constants/            (Constants & enums)
│
├── package.json              (Root workspace config)
├── pnpm-workspace.yaml       (Workspace definition)
├── turbo.json               (Turborepo pipeline)
└── tsconfig.base.json       (Base TypeScript config)
```

---

## 📝 Adding Dependencies

### To Specific App

```bash
pnpm add <package> --filter=@gacp/farmer-portal
pnpm add -D <package> --filter=@gacp/farmer-portal
```

### To Workspace Root

```bash
pnpm add -w <package>
pnpm add -D -w <package>
```

### Using Workspace Packages

```json
{
  "dependencies": {
    "@gacp/ui": "workspace:*",
    "@gacp/types": "workspace:*",
    "@gacp/utils": "workspace:*",
    "@gacp/constants": "workspace:*"
  }
}
```

---

## 🔧 Common Tasks

### Create New Frontend App

1. Copy existing app: `apps/farmer-portal/`
2. Update `package.json`:
   - Change name to `@gacp/new-app-name`
   - Change port in dev script
3. Run `pnpm install`
4. Add to workspace in `pnpm-workspace.yaml`

### Extract Shared Component

1. Move component to `packages/ui/src/components/`
2. Export from `packages/ui/src/index.tsx`
3. Import in app: `import { Button } from '@gacp/ui'`

### Add Shared Type

1. Add type to `packages/types/src/index.ts`
2. Export type: `export interface MyType { ... }`
3. Import in app: `import type { MyType } from '@gacp/types'`

---

## 🐛 Troubleshooting

### Ports Already in Use

```bash
# Kill process on specific port (Windows)
netstat -ano | findstr :3001
taskkill /PID <process-id> /F
```

### Dependencies Issues

```bash
# Clean and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Build Cache Issues

```bash
# Clear Next.js cache
rm -rf apps/*/.next

# Clear Turborepo cache
pnpm clean
```

### TypeScript Errors

```bash
# Rebuild TypeScript
pnpm type-check
```

---

## 📚 Important Files

### Configuration

- `package.json` - Root workspace config
- `pnpm-workspace.yaml` - Workspace packages definition
- `turbo.json` - Turborepo build pipeline
- `tsconfig.base.json` - Base TypeScript config

### Backend

- `apps/backend/server.js` - Main backend entry point
- `apps/backend/modules/` - 16 backend modules
- `apps/backend/shared/` - Shared utility modules

### Frontend

- `apps/*/app/` - Next.js app directory
- `apps/*/components/` - UI components
- `apps/*/lib/` - Utility functions

---

## 🎯 Development Workflow

### Daily Development

```bash
# 1. Pull latest changes
git pull

# 2. Install dependencies
pnpm install

# 3. Start development
pnpm dev

# 4. Make changes...

# 5. Run tests
pnpm test

# 6. Commit changes
git add .
git commit -m "feat: your message"
git push
```

### Before Deploy

```bash
# 1. Build all apps
pnpm build

# 2. Run tests
pnpm test

# 3. Check types
pnpm type-check

# 4. Lint code
pnpm lint

# 5. Deploy
# (follow your deployment process)
```

---

## 🔐 Environment Variables

### Backend (.env)

```env
MONGODB_URI=mongodb://localhost:27017/gacp_platform
PORT=3004
JWT_SECRET=your_secret_key
NODE_ENV=development
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3004
NEXT_PUBLIC_APP_ENV=development
```

---

## 📞 Need Help?

### Documentation

- [COMPLETE_SYSTEM_MODULES.md](./COMPLETE_SYSTEM_MODULES.md) - System overview
- [MIGRATION_SUCCESS_REPORT.md](./MIGRATION_SUCCESS_REPORT.md) - Detailed report
- [MIGRATION_COMPLETE_TH.md](./MIGRATION_COMPLETE_TH.md) - รายงานภาษาไทย

### External Resources

- [Turborepo Docs](https://turbo.build/repo/docs)
- [pnpm Docs](https://pnpm.io/)
- [Next.js Docs](https://nextjs.org/docs)

---

## ✅ Quick Checklist

Before starting work:

- [ ] `pnpm install` - Dependencies installed
- [ ] MongoDB running (for backend)
- [ ] `pnpm dev` - Development servers running
- [ ] All tests passing

Before committing:

- [ ] `pnpm lint` - Code is linted
- [ ] `pnpm type-check` - Types are correct
- [ ] `pnpm test` - Tests passing
- [ ] `pnpm build` - Build succeeds

---

**Last Updated**: October 14, 2025  
**Version**: 2.0.0  
**Status**: ✅ Ready for Development
