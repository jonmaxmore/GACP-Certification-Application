# 🚀 Quick Start Guide

## Development Mode (แนะนำสำหรับการพัฒนา)

### 1. Start Servers

```powershell
.\start-dev-simple.ps1
```

This will open 2 PowerShell windows:

- **Backend** on port 5000
- **Frontend** on port 3000

### 2. Access Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

### 3. Stop Servers

Close both PowerShell windows or press `Ctrl+C` in each window.

---

## Production Mode (สำหรับ Production/Staging)

### 1. Build Frontend (First Time Only)

```powershell
cd apps/frontend
pnpm build
cd ..\..
```

### 2. Start Production Servers

```powershell
.\start-production.ps1
```

### 3. Monitor with PM2

```powershell
# View status
pnpm exec pm2 status

# View logs
pnpm exec pm2 logs

# Restart all
pnpm exec pm2 restart all

# Stop all
pnpm exec pm2 stop all
```

### 4. Stop Servers

```powershell
pnpm exec pm2 delete all
```

---

## Troubleshooting

### Port Already in Use

```powershell
# Find and kill process
netstat -ano | findstr ":3000"
netstat -ano | findstr ":5000"
Stop-Process -Id <PID> -Force
```

### MongoDB Not Running

```powershell
# Start MongoDB
Start-Service MongoDB

# Check status
Get-Service | Where-Object { $_.DisplayName -like "*MongoDB*" }
```

### Check for Zombie Processes

```powershell
.\monitor-zombies.ps1 -DurationMinutes 5
```

---

## 📚 Full Documentation

- [SERVER_MANAGEMENT_GUIDE.md](./SERVER_MANAGEMENT_GUIDE.md) - Complete server management guide
- [PRODUCTION_FINAL_REPORT.md](./PRODUCTION_FINAL_REPORT.md) - Final production report
- [PM2_GUIDE.md](./PM2_GUIDE.md) - PM2 detailed usage

---

**Note**: Always use `start-dev-simple.ps1` for development. Only use PM2 (`start-production.ps1`) for production builds!
