# Fix nested routes paths
# Fixes paths in routes/routes/v2/ folder specifically

$v2Path = "c:\Users\usEr\Documents\GitHub\GACP-Certification-Application\gacp-ecosystem\backend\core-api\src\routes\routes\v2"

Write-Host "Fixing v2 route files..." -ForegroundColor Yellow

$files = Get-ChildItem -Path $v2Path -File -Include "*.js"
$fixCount = 0

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    if (-not $content) { continue }
    
    $original = $content
    
    # Fix ../../models -> ../../../database/models
    $content = $content -replace "require\(['\`"]\.\.\/\.\.\/models\/", "require('../../../database/models/"
    
    # Fix ../../services -> ../../../services/services
    $content = $content -replace "require\(['\`"]\.\.\/\.\.\/services\/", "require('../../../services/services/"
    
    # Fix ../../middleware -> ../../../middleware
    $content = $content -replace "require\(['\`"]\.\.\/\.\.\/middleware\/", "require('../../../middleware/"
    
    # Fix ../../config -> ../../../config
    $content = $content -replace "require\(['\`"]\.\.\/\.\.\/config\/", "require('../../../config/"
    
    # Fix ../../shared -> ../../../shared
    $content = $content -replace "require\(['\`"]\.\.\/\.\.\/shared\/", "require('../../../shared/"
    
    # Fix ../../utils -> ../../../utils
    $content = $content -replace "require\(['\`"]\.\.\/\.\.\/utils\/", "require('../../../utils/"
    
    if ($content -ne $original) {
        Write-Host "  Fixed: $($file.Name)" -ForegroundColor Green
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $fixCount++
    }
}

Write-Host "`nFixed $fixCount files in v2/" -ForegroundColor Yellow

# Also fix routes/routes/api/ folder
$apiPath = "c:\Users\usEr\Documents\GitHub\GACP-Certification-Application\gacp-ecosystem\backend\core-api\src\routes\routes\api"
Write-Host "`nFixing api route files..." -ForegroundColor Yellow

$apiFiles = Get-ChildItem -Path $apiPath -File -Include "*.js"
$apiFixCount = 0

foreach ($file in $apiFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    if (-not $content) { continue }
    
    $original = $content
    
    # Fix ../../controllers -> ../../../controllers
    $content = $content -replace "require\(['\`"]\.\.\/\.\.\/controllers\/", "require('../../../controllers/"
    
    # Fix ../../models -> ../../../database/models
    $content = $content -replace "require\(['\`"]\.\.\/\.\.\/models\/", "require('../../../database/models/"
    
    # Fix ../../services -> ../../../services/services
    $content = $content -replace "require\(['\`"]\.\.\/\.\.\/services\/", "require('../../../services/services/"
    
    # Fix ../../middleware -> ../../../middleware
    $content = $content -replace "require\(['\`"]\.\.\/\.\.\/middleware\/", "require('../../../middleware/"
    
    # Fix ../../shared -> ../../../shared
    $content = $content -replace "require\(['\`"]\.\.\/\.\.\/shared\/", "require('../../../shared/"
    
    # Fix ../../config -> ../../../config
    $content = $content -replace "require\(['\`"]\.\.\/\.\.\/config\/", "require('../../../config/"
    
    if ($content -ne $original) {
        Write-Host "  Fixed: $($file.Name)" -ForegroundColor Green
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $apiFixCount++
    }
}

Write-Host "`nFixed $apiFixCount files in api/" -ForegroundColor Yellow
Write-Host "`nTotal fixed: $($fixCount + $apiFixCount) route files" -ForegroundColor Green
