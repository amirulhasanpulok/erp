#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-.}"

services=(
  "auth-service"
  "user-service"
  "outlet-service"
  "product-service"
  "inventory-service"
  "sales-service"
  "purchase-service"
  "accounts-service"
  "manufacturing-service"
  "ecommerce-service"
  "reporting-service"
  "notification-service"
  "audit-service"
  "logistics-service"
  "payment-service"
)

for svc in "${services[@]}"; do
  path="$ROOT/services/$svc"
  if [[ -d "$path" && -f "$path/package.json" ]]; then
    echo "Running migrations for $svc ..."
    (
      cd "$path"
      npm run migration:run
    )
  fi
done

echo "All available service migrations executed."
