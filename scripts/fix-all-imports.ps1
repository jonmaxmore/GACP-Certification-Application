# Comprehensive Import Fix Script
# Scans ALL JS files and converts PascalCase requires to kebab-case

$rootPath = "c:\Users\usEr\Documents\GitHub\GACP-Certification-Application\gacp-ecosystem\backend\core-api\src"

function ConvertTo-KebabCase {
    param([string]$name)
    # Insert hyphen before each uppercase letter, then lowercase all
    $result = $name -creplace '([A-Z])', '-$1'
    $result = $result.ToLower().TrimStart('-')
    $result = $result -replace '--', '-'
    return $result
}

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Comprehensive Import Fix Script" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Yellow

$files = Get-ChildItem -Path $rootPath -Recurse -File -Include "*.js", "*.ts"
$totalFixed = 0
$errorFiles = @()

foreach ($file in $files) {
    try {
        $content = Get-Content -Path $file.FullName -Raw -ErrorAction Stop
        if (-not $content) { continue }
        
        $originalContent = $content
        
        # Pattern 1: Fix require('./path/PascalCase') 
        # Match: require('./anything/SomeName')
        $pattern1 = "require\(['\`"]([\.\/]+)([^'\`"]+)/([A-Z][a-zA-Z0-9]+)['\`"]\)"
        $matches1 = [regex]::Matches($content, $pattern1)
        foreach ($m in $matches1) {
            $fullMatch = $m.Value
            $prefix = $m.Groups[1].Value
            $path = $m.Groups[2].Value
            $fileName = $m.Groups[3].Value
            $newFileName = ConvertTo-KebabCase -name $fileName
            if ($fileName -ne $newFileName) {
                $newMatch = "require('$prefix$path/$newFileName')"
                $content = $content.Replace($fullMatch, $newMatch)
            }
        }
        
        # Pattern 2: Fix require('../path/PascalCase')
        $pattern2 = "require\(['\`"](\.\.\/[^'\`"]+)/([A-Z][a-zA-Z0-9]+)['\`"]\)"
        $matches2 = [regex]::Matches($content, $pattern2)
        foreach ($m in $matches2) {
            $fullMatch = $m.Value
            $path = $m.Groups[1].Value
            $fileName = $m.Groups[2].Value
            $newFileName = ConvertTo-KebabCase -name $fileName
            if ($fileName -ne $newFileName) {
                $newMatch = "require('$path/$newFileName')"
                $content = $content.Replace($fullMatch, $newMatch)
            }
        }
        
        # Pattern 3: Fix single file require like require('./PascalCase')
        $pattern3 = "require\(['\`"](\.\/[A-Z][a-zA-Z0-9]+)['\`"]\)"
        $matches3 = [regex]::Matches($content, $pattern3)
        foreach ($m in $matches3) {
            $fullMatch = $m.Value
            $filePath = $m.Groups[1].Value
            $fileName = $filePath.Substring(2) # Remove ./
            $newFileName = ConvertTo-KebabCase -name $fileName
            if ($fileName -ne $newFileName) {
                $newPath = "./$newFileName"
                $newMatch = "require('$newPath')"
                $content = $content.Replace($fullMatch, $newMatch)
            }
        }
        
        if ($content -ne $originalContent) {
            Write-Host "Fixing: $($file.Name)" -ForegroundColor Cyan
            Set-Content -Path $file.FullName -Value $content -NoNewline -Encoding UTF8
            $totalFixed++
        }
    }
    catch {
        Write-Host "Error processing: $($file.Name) - $_" -ForegroundColor Red
        $errorFiles += $file.Name
    }
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "Fixed $totalFixed files" -ForegroundColor Green
if ($errorFiles.Count -gt 0) {
    Write-Host "Errors in: $($errorFiles -join ', ')" -ForegroundColor Yellow
}
Write-Host "========================================" -ForegroundColor Green
