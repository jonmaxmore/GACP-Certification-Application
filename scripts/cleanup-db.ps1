#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Database Cleanup Tool for GACP Platform

.DESCRIPTION
    Clean unused data, optimize indexes, and maintain database health.
    
.PARAMETER Mode
    Cleanup mode: dry-run, execute, or deep
    
.PARAMETER Help
    Show help information
    
.EXAMPLE
    .\cleanup-db.ps1 -Mode dry-run
    Preview cleanup without making changes
    
.EXAMPLE
    .\cleanup-db.ps1 -Mode execute
    Execute basic cleanup
    
.EXAMPLE
    .\cleanup-db.ps1 -Mode deep
    Execute deep cleanup with optimization
#>

param(
    [Parameter(Position=0)]
    [ValidateSet('dry-run', 'execute', 'deep', 'help')]
    [string]$Mode = 'menu',
    
    [switch]$Help
)

# Colors
$ErrorColor = "Red"
$SuccessColor = "Green"
$WarningColor = "Yellow"
$InfoColor = "Cyan"

function Show-Banner {
    Write-Host ""
    Write-Host "====================================" -ForegroundColor $InfoColor
    Write-Host "   GACP Database Cleanup Tool" -ForegroundColor $InfoColor
    Write-Host "====================================" -ForegroundColor $InfoColor
    Write-Host ""
}

function Show-Menu {
    Write-Host "Select cleanup mode:" -ForegroundColor $InfoColor
    Write-Host ""
    Write-Host "1. Dry Run (Preview only - Safe)" -ForegroundColor $SuccessColor
    Write-Host "2. Execute Basic Cleanup" -ForegroundColor $WarningColor
    Write-Host "3. Execute Deep Cleanup" -ForegroundColor $ErrorColor
    Write-Host "4. Show Help"
    Write-Host "5. Exit"
    Write-Host ""
    
    $choice = Read-Host "Enter your choice (1-5)"
    
    switch ($choice) {
        "1" { Invoke-Cleanup -Mode "dry-run" }
        "2" { Invoke-Cleanup -Mode "execute" }
        "3" { Invoke-Cleanup -Mode "deep" }
        "4" { Show-Help }
        "5" { exit 0 }
        default {
            Write-Host "Invalid choice!" -ForegroundColor $ErrorColor
            Show-Menu
        }
    }
}

function Invoke-Cleanup {
    param([string]$Mode)
    
    $scriptRoot = Split-Path -Parent $PSScriptRoot
    Push-Location $scriptRoot
    
    try {
        switch ($Mode) {
            "dry-run" {
                Write-Host ""
                Write-Host "Running in DRY RUN mode (no changes will be made)..." -ForegroundColor $SuccessColor
                Write-Host ""
                node scripts/database-cleanup.js --dry-run
            }
            "execute" {
                Write-Host ""
                Write-Host "WARNING: This will make actual changes to the database!" -ForegroundColor $WarningColor
                $confirm = Read-Host "Are you sure? (yes/no)"
                
                if ($confirm -eq "yes") {
                    Write-Host ""
                    Write-Host "Executing cleanup..." -ForegroundColor $InfoColor
                    node scripts/database-cleanup.js --execute
                } else {
                    Write-Host "Cancelled." -ForegroundColor $InfoColor
                }
            }
            "deep" {
                Write-Host ""
                Write-Host "WARNING: Deep cleanup will optimize and compact the database!" -ForegroundColor $ErrorColor
                Write-Host "This may take several minutes." -ForegroundColor $WarningColor
                $confirm = Read-Host "Are you sure? (yes/no)"
                
                if ($confirm -eq "yes") {
                    Write-Host ""
                    Write-Host "Executing deep cleanup..." -ForegroundColor $InfoColor
                    node scripts/database-cleanup.js --execute --deep
                } else {
                    Write-Host "Cancelled." -ForegroundColor $InfoColor
                }
            }
        }
    }
    finally {
        Pop-Location
    }
}

function Show-Help {
    $scriptRoot = Split-Path -Parent $PSScriptRoot
    Push-Location $scriptRoot
    
    try {
        node scripts/database-cleanup.js --help
    }
    finally {
        Pop-Location
    }
}

# Main execution
Show-Banner

if ($Help -or $Mode -eq "help") {
    Show-Help
    exit 0
}

if ($Mode -eq "menu") {
    Show-Menu
} else {
    Invoke-Cleanup -Mode $Mode
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
