$ErrorActionPreference = "Stop"

$paths = @(
  "services/api-gateway",
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
  "services/payment-service",
  "apps/admin-web",
  "apps/ecommerce-web",
  "apps/pos-pwa"
)

foreach ($path in $paths) {
  Write-Host "Installing dependencies in $path ..."
  Push-Location $path
  try {
    npm install
  } finally {
    Pop-Location
  }
}

Write-Host "All installs completed."

