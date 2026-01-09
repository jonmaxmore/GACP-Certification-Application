# 🏗️ GACP Certification Platform Architecture

## 1. System Overview
The GACP Certification Platform uses a **Layered Architecture** style, transitioning from a legacy module-based structure. This document defines the standard for all future development.

- **Frontend**: Next.js (App Router), Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL (via Prisma ORM)
- **Queue/Cache**: Redis (BullMQ)

---

## 2. Backend Structure (`apps/backend`)

### 📂 Directory Standards
All business logic MUST follow this structure. **Do not create new directories in root.**

```plaintext
apps/backend/
├── controllers/       # Input validation, format response, call services
│   └── *-controller.js
├── routes/
│   └── api/           # Route definitions (URL + Middleware only)
│       └── *.js
├── services/          # Business logic & Database interaction (Prisma)
│   └── prisma-*-service.js
└── prisma/            # Database Schema
    └── schema.prisma
```

### 🚫 Anti-Patterns (Do NOT do this)
- ❌ **No `modules/` folder**: Do not group by feature folders anymore.
- ❌ **No Logic in Routes**: Routes should only handle HTTP routing and Middleware.
- ❌ **No Direct DB in Controllers**: Controllers must call Services.

---

## 3. Key Conventions

### 🔐 Authentication
*   **Middleware**: Use `authenticateFarmer` from `middleware/auth-middleware`.
*   **User Object**: Always access user ID via `req.user.id` (Standardized).
    *   *Deprecated*: `req.user.userId`

### 📝 Responses
All API responses must follow this JSON format:
```json
// Success
{
  "success": true,
  "data": { ... }
}

// Error
{
  "success": false,
  "message": "User friendly message",
  "error": "Debug info (optional)"
}
```

### 🪵 Logging
*   Use `logger.info()`, `logger.warn()`, `logger.error()`
*   Avoid `console.log` in production code.

---

## 4. Deployment
*   **Docker**: Each service (frontend/backend) is containerized.
*   **CD**: Automated via GitHub Actions (or Manual SSH trigger).
*   **Production Branch**: `main`

---
*Last Updated: 2026-01-09 by Antigravity Agent*
