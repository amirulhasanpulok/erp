param(
  [Parameter(Mandatory = $true)][string]$OutputDir,
  [string]$PgUser = "postgres",
  [string]$PgHost = "localhost",
  [int]$PgPort = 5432
)

$ErrorActionPreference = "Stop"
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
$ts = Get-Date -Format "yyyyMMdd-HHmmss"

$databases = @(
  "auth_db",
  "user_db",
  "outlet_db",
  "product_db",
  "inventory_db",
  "sales_db",
  "purchase_db",
  "accounts_db",
  "manufacturing_db",
  "ecommerce_db",
  "reporting_db",
  "notification_db",
  "audit_db",
  "logistics_db",
  "payment_db"
)

foreach ($db in $databases) {
  $file = Join-Path $OutputDir "$db-$ts.dump"
  Write-Host "Backing up $db -> $file"
  pg_dump -Fc -h $PgHost -p $PgPort -U $PgUser -d $db -f $file
}

Write-Host "Backup completed."
