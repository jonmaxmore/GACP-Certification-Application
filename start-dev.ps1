# GACP Platform - Start Script
# Use: ./start-dev.ps1
# This script ensures reliable startup of both backend and frontend

$ErrorActionPreference = "Stop"

Write-Host "🚀 GACP Platform - Development Startup" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Step 1: Kill existing node processes
Write-Host "`n[1/5] Killing existing Node processes..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null
Start-Sleep -Seconds 2

# Step 2: Check if ports are free
Write-Host "`n[2/5] Checking ports 3000 and 3001..." -ForegroundColor Yellow
$port3000 = netstat -ano | findstr ":3000"
$port3001 = netstat -ano | findstr ":3001"

if ($port3000) {
    Write-Host "⚠️  Port 3000 is in use. Attempting to free..." -ForegroundColor Red
    $port3000 -match "(\d+)$" | Out-Null
    if ($matches) { taskkill /PID $matches[1] /F 2>$null }
}

if ($port3001) {
    Write-Host "⚠️  Port 3001 is in use. Attempting to free..." -ForegroundColor Red
    $port3001 -match "(\d+)$" | Out-Null
    if ($matches) { taskkill /PID $matches[1] /F 2>$null }
}

Write-Host "✅ Ports are free" -ForegroundColor Green

# Step 3: Clear caches
Write-Host "`n[3/5] Clearing Next.js cache..." -ForegroundColor Yellow
$webAppPath = Join-Path $PSScriptRoot "apps\web-app"
Remove-Item -Recurse -Force (Join-Path $webAppPath ".next") -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force (Join-Path $webAppPath "node_modules\.cache") -ErrorAction SilentlyContinue
Write-Host "✅ Cache cleared" -ForegroundColor Green

# Step 4: Start Backend (Port 3001)
Write-Host "`n[4/5] Starting Backend on port 3001..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "apps\backend"
$env:PORT = 3001
# Read DATABASE_URL from .env file (more secure - not hardcoded)
# Make sure apps/backend/.env has: DATABASE_URL=postgresql://...
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; `$env:PORT=3001; node simple-start.js" -WindowStyle Normal
Start-Sleep -Seconds 5

# Check backend health
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3001/health" -TimeoutSec 5
    Write-Host "✅ Backend running: $($health.status)" -ForegroundColor Green
}
catch {
    Write-Host "⚠️  Backend may still be starting..." -ForegroundColor Yellow
}

# Step 5: Start Frontend (Port 3000)
Write-Host "`n[5/5] Starting Frontend on port 3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$webAppPath'; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 8

# Final check
Write-Host "`n=======================================" -ForegroundColor Cyan
Write-Host "🎉 GACP Platform Started!" -ForegroundColor Green
Write-Host "" 
Write-Host "  Backend:  http://localhost:3001" -ForegroundColor White
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  API Docs: http://localhost:3001/api-docs" -ForegroundColor White
Write-Host "" 
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
