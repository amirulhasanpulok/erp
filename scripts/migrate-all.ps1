param(
  [string]$Root = "."
)

$ErrorActionPreference = "Stop"

$services = @(
  "auth-service",
  "user-service",
  "outlet-service",
  "product-service",
  "inventory-service",
  "sales-service",
  "purchase-service",
  "accounts-service",
  "manufacturing-service",
  "ecommerce-service",
  "reporting-service",
  "notification-service",
  "audit-service",
  "logistics-service",
  "payment-service"
)

foreach ($svc in $services) {
  $path = Join-Path $Root "services\$svc"
  if (Test-Path $path) {
    Write-Host "Running migrations for $svc ..."
    Push-Location $path
    if (Test-Path "package.json") {
      npm run migration:run
    }
    Pop-Location
  }
}

Write-Host "All available service migrations executed."
