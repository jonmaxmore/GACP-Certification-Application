# The Great Rename - Batch Convert to kebab-case
# This script renames all PascalCase/camelCase files to kebab-case

$rootPath = "c:\Users\usEr\Documents\GitHub\GACP-Certification-Application\gacp-ecosystem"

function ConvertTo-KebabCase {
    param([string]$name)
    
    # Split by uppercase letters, lowercase all, join with hyphen
    $result = $name -creplace '([A-Z])', '-$1'
    $result = $result.ToLower().TrimStart('-')
    
    # Clean up double hyphens
    $result = $result -replace '--', '-'
    
    return $result
}

function Rename-ToKebabCase {
    param([string]$path)
    
    $files = Get-ChildItem -Path $path -Recurse -File -Include "*.tsx","*.ts","*.js","*.dart" | 
             Where-Object { $_.Name -cmatch "[A-Z]" }
    
    $renamed = 0
    foreach ($file in $files) {
        $oldName = $file.Name
        $extension = $file.Extension
        $baseName = $file.BaseName
        
        $newBaseName = ConvertTo-KebabCase -name $baseName
        $newName = "$newBaseName$extension"
        
        if ($oldName -ne $newName) {
            $newPath = Join-Path $file.DirectoryName $newName
            Write-Host "Renaming: $oldName -> $newName"
            
            try {
                Rename-Item -Path $file.FullName -NewName $newName -ErrorAction Stop
                $renamed++
            } catch {
                Write-Host "  ERROR: $_" -ForegroundColor Red
            }
        }
    }
    
    Write-Host "`nTotal renamed: $renamed files"
}

# Run the rename
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "The Great Rename - Batch Script" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Yellow

Write-Host "Processing web-portal..." -ForegroundColor Cyan
Rename-ToKebabCase -path "$rootPath\apps\web-portal"

Write-Host "`nProcessing backend..." -ForegroundColor Cyan
Rename-ToKebabCase -path "$rootPath\backend\core-api"

Write-Host "`nProcessing mobile-farmer..." -ForegroundColor Cyan
Rename-ToKebabCase -path "$rootPath\apps\mobile-farmer"

Write-Host "`nProcessing mobile-staff..." -ForegroundColor Cyan
Rename-ToKebabCase -path "$rootPath\apps\mobile-staff"

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "DONE! All files renamed to kebab-case" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
