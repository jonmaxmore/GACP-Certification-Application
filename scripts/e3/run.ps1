# 🧪 GACP E3 Stress Test Runner (Windows)
# Apple-Standard Load Testing

$ErrorActionPreference = "Stop"

Write-Host "🧪 GACP E3 Stress Test" -ForegroundColor Cyan
Write-Host "======================"
Write-Host ""

# Configuration
$TARGET_URL = if ($env:TARGET_URL) { $env:TARGET_URL } else { "http://47.129.167.71" }
$MAX_VUS = if ($env:MAX_VUS) { $env:MAX_VUS } else { "100" }

# Check if k6 is installed
$k6Path = Get-Command k6 -ErrorAction SilentlyContinue
if (-not $k6Path) {
    Write-Host "⚠️ k6 is not installed." -ForegroundColor Yellow
    Write-Host "Installing via chocolatey..." -ForegroundColor Yellow
    choco install k6 -y
}

# Pre-flight check
Write-Host "🔍 Pre-flight checks..." -ForegroundColor Cyan
Write-Host "Target: $TARGET_URL"

try {
    $response = Invoke-WebRequest -Uri "$TARGET_URL/health" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Target is reachable" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Target not reachable" -ForegroundColor Red
    exit 1
}

# Create results directory
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$RESULTS_DIR = ".\results\$timestamp"
New-Item -ItemType Directory -Path $RESULTS_DIR -Force | Out-Null

Write-Host ""
Write-Host "🚀 Starting stress test..." -ForegroundColor Cyan
Write-Host "Max VUs: $MAX_VUS"
Write-Host "Results: $RESULTS_DIR"
Write-Host ""

# Run k6
$env:BASE_URL = $TARGET_URL
k6 run --out json="$RESULTS_DIR\metrics.json" .\stress-test.js 2>&1 | Tee-Object -FilePath "$RESULTS_DIR\output.log"

Write-Host ""
Write-Host "📊 Test complete!" -ForegroundColor Green
Write-Host "Results saved to: $RESULTS_DIR"

# Display summary
if (Test-Path "$RESULTS_DIR\stress-test-results.json") {
    Write-Host ""
    Write-Host "Summary:" -ForegroundColor Cyan
    Get-Content "$RESULTS_DIR\stress-test-results.json"
}
