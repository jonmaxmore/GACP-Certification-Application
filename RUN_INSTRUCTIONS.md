# How to Run the GACP Certification Application

The system is fully implemented and ready to run. Follow these steps to start the Backend and Frontend.

## 1. Start the Backend Server (Mock Mode)

The backend runs in "Mock Mode" for development, meaning it doesn't require a real MongoDB connection.

**Command:**
```bash
cd apps/backend
npm run dev:mock
```
*Note: The backend server is currently running in the background of this session.*

**API Endpoint:** `http://localhost:3004`

## 2. Setup and Run the Frontend (Flutter)

Since this is a fresh "Pure Flutter" migration, you need to generate the platform-specific files (Android, iOS, Web) first.

### Step 2.1: Generate Platform Files
Run this command **once** in your terminal:

```bash
cd apps/mobile_app
flutter create . --platforms=web,android,ios
```

### Step 2.2: Run the Application
**For Web (Admin Portal):**
```bash
flutter run -d chrome
```
*Access at: `http://localhost:3000` (or the port Flutter assigns)*

**For Mobile (Auditor App):**
```bash
flutter run -d <device-id>
```
*Use `flutter devices` to see available emulators or connected devices.*

## 3. Login Credentials (Mock Data)

Use these credentials to test the different roles:

| Role | Email | Password | Features |
|---|---|---|---|
| **Farmer** | `farmer@example.com` | `password` | Submit Applications |
| **Officer** | `officer@dtam.go.th` | `password` | Dashboard, Assign Jobs |
| **Auditor** | `auditor@dtam.go.th` | `password` | My Assignments, Inspection Form |

## 4. Testing the Workflow
1.  **Login as Officer**: Go to Dashboard -> Task Queue -> Assign a job to "Auditor".
2.  **Login as Auditor**: Go to "My Assignments" -> Accept Job -> Start Inspection -> Submit Form.
3.  **Offline Mode**: Turn off internet on mobile device -> Submit Form -> Reconnect -> Data syncs automatically.
