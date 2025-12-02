# 🎨 06 - Frontend

**Category**: Frontend Development & UI/UX  
**Last Updated**: October 15, 2025

---

## 📋 Overview

This folder contains frontend-specific documentation, including sitemap, design guidelines, analytics tracking, and website briefs.

---

## 📚 Documents in this Folder

### 1. ⭐ [GACP_UNIFIED_FRONTEND_SITEMAP.md](./GACP_UNIFIED_FRONTEND_SITEMAP.md)

Complete frontend sitemap for all portals

**Contents:**

- Farmer Portal sitemap (40+ pages)
- DTAM Portal sitemap (50+ pages)
- Public Services sitemap (10+ pages)
- Navigation structure
- Page hierarchy
- User flows

**Who should read:** Frontend developers, UX/UI designers

---

### 2. [TAILWIND_GUIDE.md](./TAILWIND_GUIDE.md)

TailwindCSS implementation guide

**Contents:**

- TailwindCSS setup
- Custom configuration
- Design tokens
- Component patterns
- Responsive design
- Dark mode
- Best practices

**Who should read:** Frontend developers

---

### 3. [GA4_TRACKING_PLAN.md](./GA4_TRACKING_PLAN.md)

Google Analytics 4 tracking plan

**Contents:**

- GA4 setup
- Event tracking
- Custom events
- User properties
- Conversion tracking
- Dashboard setup
- Analytics strategy

**Who should read:** Frontend developers, Marketing team

---

### 4. [GACP_PLATFORM_AUDIT_AND_WEBSITE_BRIEF.md](./GACP_PLATFORM_AUDIT_AND_WEBSITE_BRIEF.md)

Platform audit and website brief

**Contents:**

- Platform audit results
- Website requirements
- Design system
- Content strategy
- SEO requirements
- Accessibility requirements

**Who should read:** UX/UI designers, Frontend developers, Stakeholders

---

## 🎯 Frontend Structure

### 3 Portals (Monorepo):

**1. Farmer Portal** (`apps/farmer-portal/`)

```
Port: 3001
Framework: Next.js 15
Routes: 40+ pages

Main Sections:
- Login 1: Application Module (5 pages)
  └─ /application/new (Wizard: 5 steps)
  └─ /application/list
  └─ /application/[id]
  └─ /payment
  └─ /certificate

- Login 2: Farm Management (15 pages)
  └─ /farms
  └─ /farms/[id]
  └─ /crops
  └─ /sop (5 steps)
  └─ /chemicals
  └─ /qr-codes
  └─ /dashboard
```

**2. DTAM Portal** (`apps/dtam-portal/`)

```
Port: 3002
Framework: Next.js 15
Routes: 50+ pages

4 Role Dashboards:
- Reviewer Dashboard (10 pages)
  └─ /reviewer/dashboard
  └─ /reviewer/queue
  └─ /reviewer/application/[id]
  └─ /reviewer/review-form

- Inspector Dashboard (15 pages)
  └─ /inspector/dashboard
  └─ /inspector/queue
  └─ /inspector/inspection/[id]
  └─ /inspector/checklist
  └─ /inspector/report

- Approver Dashboard (10 pages)
  └─ /approver/dashboard
  └─ /approver/queue
  └─ /approver/application/[id]
  └─ /approver/certificate-preview

- Admin Dashboard (15 pages)
  └─ /admin/dashboard
  └─ /admin/users
  └─ /admin/reports
  └─ /admin/analytics
  └─ /admin/settings
```

**3. Public Services** (`apps/public-services/`)

```
Port: 3003
Framework: Next.js 15
Routes: 10 pages

Public Pages:
- Landing Page (/)
- Survey (/survey)
- Standards Comparison (/standards)
- Track & Trace (/track)
- About GACP (/about)
- FAQ (/faq)
- Contact (/contact)
```

---

## 💻 Tech Stack

### Core:

```
Framework: Next.js 15 (React 18)
Language: TypeScript
Styling: TailwindCSS + Material-UI
```

### State Management:

```
Global State: Zustand
Server State: React Query (TanStack Query)
Form State: React Hook Form + Zod
```

### UI Libraries:

```
Components: Material-UI (MUI)
Icons: Heroicons + MUI Icons
Charts: Recharts
PDF: react-pdf
QR Code: react-qr-code
Camera: react-webcam
```

### Development:

```
Build: Turbo (Monorepo)
Linting: ESLint + Prettier
Testing: Jest + React Testing Library + Playwright
```

---

## 🎨 Design System

### Colors:

```css
/* Primary Colors */
--primary-50: #eff6ff;
--primary-500: #3b82f6;
--primary-900: #1e3a8a;

/* Secondary Colors */
--secondary-50: #f0fdf4;
--secondary-500: #10b981;
--secondary-900: #064e3b;

/* Semantic Colors */
--error: #ef4444;
--warning: #f59e0b;
--success: #10b981;
--info: #3b82f6;
```

### Typography:

```css
/* Thai Font */
font-family: 'Prompt', 'Sarabun', sans-serif;

/* English Font */
font-family: 'Inter', sans-serif;

/* Sizes */
h1: 48px / 60px
h2: 36px / 45px
h3: 30px / 37.5px
body: 16px / 24px
caption: 12px / 18px
```

### Spacing:

```
Base unit: 4px
Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128
```

---

## 🚀 Development

### Setup:

```bash
# Install dependencies
pnpm install

# Start farmer portal
cd apps/farmer-portal
pnpm dev

# Start DTAM portal
cd apps/dtam-portal
pnpm dev

# Start public services
cd apps/public-services
pnpm dev

# Start all portals
pnpm dev
```

### Build:

```bash
# Build specific portal
cd apps/farmer-portal
pnpm build

# Build all portals
pnpm build
```

### Test:

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Component tests
pnpm test:component
```

---

## 🔗 Related Documentation

- **System Architecture**: [../01_SYSTEM_ARCHITECTURE/](../01_SYSTEM_ARCHITECTURE/)
- **Deployment Guide**: [../05_DEPLOYMENT/HOW_TO_START_FRONTEND.md](../05_DEPLOYMENT/HOW_TO_START_FRONTEND.md)
- **User Guides**: [../07_USER_GUIDES/](../07_USER_GUIDES/)

---

## 📞 Contact

**Frontend Team:**

- Frontend Lead: คุณสมหวัง - somwang@gacp.go.th

**UX/UI Team:**

- UX/UI Lead: คุณสมนิด - somnit@gacp.go.th

**Slack Channels:**

- #gacp-frontend
- #gacp-ux-ui
- #gacp-design

---

**Navigation:**

- 🏠 [Back to Main README](../../README.md)
- 📚 [All Documentation](../)
- ⬅️ [Previous: Deployment](../05_DEPLOYMENT/)
- ➡️ [Next: User Guides](../07_USER_GUIDES/)
