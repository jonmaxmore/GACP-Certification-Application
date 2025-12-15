# 🍎 GACP Ecosystem

**GACP (Good Agricultural and Collection Practice) Platform**
_รองรับการรับรองมาตรฐานเกษตรกรและเจ้าหน้าที่_

---

## 📁 Ecosystem Map

```
gacp-ecosystem/
├── apps/                    📱 Zone: Applications
│   ├── web-portal/          (Next.js) Web Platform รวม
│   ├── mobile-farmer/       (Flutter) App เกษตรกร
│   └── mobile-staff/        (Flutter) App พนักงาน
│
├── backend/                 🧠 Zone: Intelligence
│   └── core-api/            (Node.js) API Gateway
│
├── packages/                📦 Zone: Shared Resources
│   ├── ui-kit/              Design System (สี, ปุ่ม)
│   ├── ts-types/            TypeScript Interfaces
│   └── utils/               Shared Functions
│
└── infra/                   ☁️ Zone: Infrastructure
    └── docker/              Docker configs
```

---

## 🚀 Quick Start

```bash
# Install all workspaces
npm install

# Start API
npm run dev:api

# Start Web Portal
npm run dev:web

# Mobile Apps
cd apps/mobile-farmer && flutter run
cd apps/mobile-staff && flutter run
```

---

## 📝 Naming Convention

| Type | Style | Example |
|:-----|:------|:--------|
| Files/Folders | `kebab-case` | `user-profile.tsx` |
| Components | `PascalCase` | `UserProfile` |
| Functions | `camelCase` | `getUserById()` |
| DB Tables | `snake_case` plural | `farm_plots` |

---

## 🔑 Environment

Copy `.env.example` → `.env` in each package:

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret
```
