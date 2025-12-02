# GACP Certification Platform

A unified digital platform for **Good Agricultural and Collection Practices (GACP)** certification in Thailand, designed to streamline the workflow for farmers, inspectors, and regulatory officers.

## 🚀 Overview

The system provides a seamless digital experience for:
- **Farmers:** Submit applications (Form 9, 10, 11), manage farm data, and track certification status via a responsive mobile/web app.
- **Officers/Inspectors:** Review applications, schedule inspections, and validate compliance (Employee Dashboard).
- **Public:** Verify certificate authenticity via QR codes.

**Core Focus:** Cannabis and medicinal plants (Turmeric, Ginger, etc.).

## 🏗️ Architecture

The platform has been modernized into a unified architecture:

### 📱 Frontend (Unified App)
- **Framework:** Flutter (Dart)
- **Platforms:** iOS, Android, Web (Responsive)
- **Key Features:**
  - **Dynamic Forms:** Support for GACP Forms 9 (Production), 10 (Sale), and 11 (Import/Export).
  - **Offline Capable:** Designed for field use.
  - **Secure:** JWT Authentication & Secure Storage.

### ⚙️ Backend (API)
- **Runtime:** Node.js (Express)
- **Database:** MongoDB (Atlas)
- **Services:**
  - **Application Service:** Handles complex nested form data and state transitions.
  - **Establishment Service:** Manages farm locations and GPS data.
  - **Auth Service:** Role-based access control (Farmer vs. Employee).

## 📂 Project Structure

```
Botanical-Audit-Framework/
├── apps/
│   ├── mobile_app/       # Unified Flutter Application
│   └── backend/          # Node.js/Express API Server
├── docs/                 # Project Documentation
└── scripts/              # Utility scripts
```

## 🛠️ Getting Started

### Prerequisites
- **Flutter SDK:** Latest Stable
- **Node.js:** v18+
- **MongoDB:** Local or Atlas Connection

### Running the Backend
```bash
cd apps/backend
npm install
npm run dev
# Server runs on http://localhost:3000
```

### Running the App
```bash
cd apps/mobile_app
flutter pub get
flutter run
# Select Chrome (Web) or Emulator (Mobile)
```

## 📝 Features & Status

| Feature | Status | Description |
| :--- | :--- | :--- |
| **Authentication** | ✅ Ready | Secure Login/Register with Role Support |
| **Establishments** | ✅ Ready | Create/Manage Farms with GPS & Photos |
| **Dashboard** | ✅ Ready | Real-time status overview |
| **Application Form** | ✅ Ready | **Form 9, 10, 11** fully implemented with validation |
| **Employee Dashboard** | 🚧 In Progress | Officer review & inspection tools |

## 🔐 Security
- **Data Encryption:** At rest and in transit.
- **Role-Based Access:** Strict separation between Applicant and Officer data.
- **Audit Logs:** Comprehensive tracking of all actions.

---
*Proprietary Software - All Rights Reserved*
