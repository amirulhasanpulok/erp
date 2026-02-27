param(
  [Parameter(Mandatory = $true)][string]$BackupDir,
  [string]$PgUser = "postgres",
  [string]$PgHost = "localhost",
  [int]$PgPort = 5432
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $BackupDir)) {
  throw "Backup directory not found: $BackupDir"
}

$dumps = Get-ChildItem -Path $BackupDir -Filter "*.dump" | Sort-Object Name
foreach ($dump in $dumps) {
  $db = ($dump.BaseName -split "-")[0]
  Write-Host "Restoring $($dump.FullName) -> $db"
  pg_restore -c --if-exists -h $PgHost -p $PgPort -U $PgUser -d $db $dump.FullName
}

Write-Host "Restore completed."
