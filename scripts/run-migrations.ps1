$ErrorActionPreference = "Stop"

$services = @(
  "services/auth-service",
  "services/user-service",
  "services/outlet-service",
  "services/product-service",
  "services/inventory-service",
  "services/sales-service",
  "services/purchase-service",
  "services/accounts-service",
  "services/manufacturing-service",
  "services/ecommerce-service",
  "services/reporting-service",
  "services/notification-service",
  "services/audit-service",
  "services/logistics-service",
  "services/payment-service"
)

foreach ($svc in $services) {
  Write-Host "Running migrations for $svc ..."
  Push-Location $svc
  try {
    npm run migration:run
  } finally {
    Pop-Location
  }
}

Write-Host "All migrations attempted."

