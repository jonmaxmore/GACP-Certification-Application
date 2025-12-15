# Fix Imports - Convert PascalCase requires to kebab-case
# Scans all .js files and updates import/require paths

$rootPath = "c:\Users\usEr\Documents\GitHub\GACP-Certification-Application\gacp-ecosystem\backend\core-api\src"

function ConvertTo-KebabCase {
    param([string]$name)
    $result = $name -creplace '([A-Z])', '-$1'
    $result = $result.ToLower().TrimStart('-')
    $result = $result -replace '--', '-'
    return $result
}

# Common PascalCase patterns to fix
$patterns = @(
    @{ Old = 'AuthController'; New = 'auth-controller' },
    @{ Old = 'UserModel'; New = 'user-model' },
    @{ Old = 'ApplicationController'; New = 'application-controller' },
    @{ Old = 'AuthMiddleware'; New = 'auth-middleware' },
    @{ Old = 'ErrorHandler'; New = 'error-handler' },
    @{ Old = 'CacheService'; New = 'cache-service' },
    @{ Old = 'EmailService'; New = 'email-service' },
    @{ Old = 'PaymentService'; New = 'payment-service' },
    @{ Old = 'NotificationService'; New = 'notification-service' },
    @{ Old = 'AuthService'; New = 'auth-service' },
    @{ Old = 'FieldAuditService'; New = 'field-audit-service' },
    @{ Old = 'GacpCertificate'; New = 'gacp-certificate' },
    @{ Old = 'RedisService'; New = 'redis-service' }
    # Add more patterns as needed
)

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Fix Imports Script" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Yellow

$files = Get-ChildItem -Path $rootPath -Recurse -File -Include "*.js", "*.ts" 
$totalFixed = 0

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    
    $modified = $false
    $newContent = $content
    
    foreach ($p in $patterns) {
        if ($newContent -match $p.Old) {
            $newContent = $newContent -replace $p.Old, $p.New
            $modified = $true
        }
    }
    
    # Also fix any remaining PascalCase in require/import paths
    # Pattern: require('./path/SomeName') -> require('./path/some-name')
    $regex = "require\(['\`"]\./([^'\`"]+)/([A-Z][a-zA-Z]+)['\`"]\)"
    if ($newContent -match $regex) {
        $matches = [regex]::Matches($newContent, $regex)
        foreach ($m in $matches) {
            $oldPath = $m.Value
            $fileName = $m.Groups[2].Value
            $newFileName = ConvertTo-KebabCase -name $fileName
            if ($fileName -ne $newFileName) {
                $newPath = $oldPath -replace $fileName, $newFileName
                $newContent = $newContent.Replace($oldPath, $newPath)
                $modified = $true
            }
        }
    }
    
    if ($modified) {
        Write-Host "Fixing: $($file.Name)"
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        $totalFixed++
    }
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "Fixed $totalFixed files" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
