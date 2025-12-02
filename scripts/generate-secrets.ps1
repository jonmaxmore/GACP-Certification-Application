# ===========================================
# 🔐 Generate Strong Secrets for Production
# ===========================================
# This script generates cryptographically strong secrets for your GACP Platform
# Run this BEFORE deploying to production!
#
# Usage:
#   PowerShell: .\generate-secrets.ps1
#   Linux/Mac: bash generate-secrets.sh
# ===========================================

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "🔐 GACP Platform - Secret Generator" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Function to generate random base64 string
function Generate-RandomSecret {
    param (
        [int]$Length = 64
    )
    
    $bytes = New-Object byte[] $Length
    $random = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $random.GetBytes($bytes)
    $secret = [Convert]::ToBase64String($bytes)
    
    return $secret
}

Write-Host "Generating strong secrets..." -ForegroundColor Yellow
Write-Host ""

# Generate secrets
$JWT_SECRET = Generate-RandomSecret -Length 64
$JWT_REFRESH_SECRET = Generate-RandomSecret -Length 64
$DTAM_JWT_SECRET = Generate-RandomSecret -Length 64
$SESSION_SECRET = Generate-RandomSecret -Length 32
$REDIS_PASSWORD = Generate-RandomSecret -Length 24
$MONGO_ROOT_PASSWORD = Generate-RandomSecret -Length 32

Write-Host "✅ Secrets generated successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Copy these to your .env.production file:" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Output secrets
Write-Host "# JWT Secrets (for Farmer authentication)" -ForegroundColor Gray
Write-Host "JWT_SECRET=$JWT_SECRET" -ForegroundColor White
Write-Host ""

Write-Host "# JWT Refresh Secret (must be different from JWT_SECRET)" -ForegroundColor Gray
Write-Host "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET" -ForegroundColor White
Write-Host ""

Write-Host "# DTAM Staff JWT Secret (must be different from JWT_SECRET)" -ForegroundColor Gray
Write-Host "DTAM_JWT_SECRET=$DTAM_JWT_SECRET" -ForegroundColor White
Write-Host ""

Write-Host "# Session Secret" -ForegroundColor Gray
Write-Host "SESSION_SECRET=$SESSION_SECRET" -ForegroundColor White
Write-Host ""

Write-Host "# Redis Password" -ForegroundColor Gray
Write-Host "REDIS_PASSWORD=$REDIS_PASSWORD" -ForegroundColor White
Write-Host ""

Write-Host "# MongoDB Root Password" -ForegroundColor Gray
Write-Host "MONGO_ROOT_PASSWORD=$MONGO_ROOT_PASSWORD" -ForegroundColor White
Write-Host ""

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "⚠️  IMPORTANT SECURITY NOTES:" -ForegroundColor Red
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 🔒 NEVER commit .env.production to git" -ForegroundColor Yellow
Write-Host "2. 🔄 Store secrets in a secure vault (Azure Key Vault, AWS Secrets Manager)" -ForegroundColor Yellow
Write-Host "3. 📝 Keep a BACKUP of these secrets in a secure location" -ForegroundColor Yellow
Write-Host "4. 🔑 Each environment (dev/staging/prod) should have DIFFERENT secrets" -ForegroundColor Yellow
Write-Host "5. ⏰ Rotate secrets regularly (every 3-6 months)" -ForegroundColor Yellow
Write-Host "6. 👥 Limit access to production secrets (only DevOps team)" -ForegroundColor Yellow
Write-Host ""

# Save to file (optional)
$saveToFile = Read-Host "Do you want to save these to .env.production? (y/N)"

if ($saveToFile -eq "y" -or $saveToFile -eq "Y") {
    $envPath = Join-Path $PSScriptRoot ".env.production"
    
    if (Test-Path $envPath) {
        Write-Host ""
        Write-Host "⚠️  WARNING: .env.production already exists!" -ForegroundColor Red
        $overwrite = Read-Host "Overwrite? This will REPLACE all secrets! (y/N)"
        
        if ($overwrite -ne "y" -and $overwrite -ne "Y") {
            Write-Host "❌ Aborted. Secrets not saved." -ForegroundColor Red
            exit
        }
    }
    
    # Read template
    $templatePath = Join-Path $PSScriptRoot ".env.production.template"
    if (-not (Test-Path $templatePath)) {
        Write-Host "❌ ERROR: .env.production.template not found!" -ForegroundColor Red
        exit 1
    }
    
    $content = Get-Content $templatePath -Raw
    
    # Replace placeholders with actual secrets
    $content = $content -replace 'CHANGE_THIS_TO_RANDOM_STRING_MIN_64_CHARS', $JWT_SECRET
    $content = $content -replace 'JWT_REFRESH_SECRET=.*', "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET"
    $content = $content -replace 'DTAM_JWT_SECRET=.*', "DTAM_JWT_SECRET=$DTAM_JWT_SECRET"
    $content = $content -replace 'SESSION_SECRET=.*', "SESSION_SECRET=$SESSION_SECRET"
    $content = $content -replace 'REDIS_PASSWORD=.*', "REDIS_PASSWORD=$REDIS_PASSWORD"
    $content = $content -replace 'MONGO_ROOT_PASSWORD=.*', "MONGO_ROOT_PASSWORD=$MONGO_ROOT_PASSWORD"
    
    # Save to file
    Set-Content -Path $envPath -Value $content -NoNewline
    
    Write-Host ""
    Write-Host "✅ Secrets saved to .env.production" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  NEXT STEPS:" -ForegroundColor Yellow
    Write-Host "1. Review .env.production and fill in remaining values" -ForegroundColor White
    Write-Host "2. NEVER commit this file to git!" -ForegroundColor White
    Write-Host "3. Upload secrets to your production server securely (SCP, Azure Key Vault, etc.)" -ForegroundColor White
    Write-Host ""
}
else {
    Write-Host ""
    Write-Host "ℹ️  Secrets NOT saved to file. Copy them manually." -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "✅ Done!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
