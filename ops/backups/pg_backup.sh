#!/usr/bin/env bash
set -euo pipefail

BACKUP_ROOT="${BACKUP_ROOT:-/var/backups/erp}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"

mkdir -p "$BACKUP_ROOT/$TIMESTAMP"

services=(
  AUTH USER OUTLET PRODUCT INVENTORY SALES PURCHASE ACCOUNTS
  MANUFACTURING ECOMMERCE REPORTING NOTIFICATION AUDIT LOGISTICS PAYMENT
)

for svc in "${services[@]}"; do
  host_var="${svc}_DB_HOST"
  port_var="${svc}_DB_PORT"
  name_var="${svc}_DB_NAME"
  user_var="${svc}_DB_USER"
  pass_var="${svc}_DB_PASSWORD"

  host="${!host_var:-}"
  port="${!port_var:-5432}"
  db_name="${!name_var:-}"
  db_user="${!user_var:-}"
  db_pass="${!pass_var:-}"

  if [[ -z "$host" || -z "$db_name" || -z "$db_user" || -z "$db_pass" ]]; then
    echo "[skip] missing DB vars for ${svc}"
    continue
  fi

  export PGPASSWORD="$db_pass"
  output="$BACKUP_ROOT/$TIMESTAMP/${svc,,}.dump"
  echo "[backup] ${svc} -> ${output}"
  pg_dump --host="$host" --port="$port" --username="$db_user" --format=custom --file="$output" "$db_name"
  unset PGPASSWORD
done

find "$BACKUP_ROOT" -mindepth 1 -maxdepth 1 -type d -mtime "+$RETENTION_DAYS" -exec rm -rf {} +

echo "backup complete at $BACKUP_ROOT/$TIMESTAMP"
