# Visitflow Local CI Check Runner (PowerShell)
$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Visitflow: Running Local CI Validation" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Frontend Checks
Write-Host "`n[1/3] Running Frontend Linter (oxlint)..." -ForegroundColor Yellow
npm --prefix frontend run lint
if ($LASTEXITCODE -ne 0) { Write-Error "Frontend linting failed!"; exit 1 }

Write-Host "`n[2/3] Running Frontend TypeScript Build..." -ForegroundColor Yellow
npm --prefix frontend run build
if ($LASTEXITCODE -ne 0) { Write-Error "Frontend build failed!"; exit 1 }

# 3. Backend Checks
Write-Host "`n[3/3] Running Backend Tests (PHPUnit)..." -ForegroundColor Yellow
Push-Location backend
try {
    $env:DB_CONNECTION = "sqlite"
    $env:DB_DATABASE = ":memory:"
    php artisan test
    if ($LASTEXITCODE -ne 0) { Write-Error "Backend test suite failed!"; exit 1 }
} finally {
    Pop-Location
}

Write-Host "`n==========================================" -ForegroundColor Green
Write-Host " ALL CI CHECKS PASSED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
