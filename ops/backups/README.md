# PostgreSQL Backup Strategy

This ERP uses database-per-service PostgreSQL databases. The backup script supports all services using the `*_DB_*` variables from `ops/env/.env.prod`.

## Run once

```bash
chmod +x ops/backups/pg_backup.sh
source ops/env/.env.prod
BACKUP_ROOT=/var/backups/erp RETENTION_DAYS=14 ops/backups/pg_backup.sh
```

## Suggested cron (host)

```bash
0 */6 * * * cd /home/pulok/erp-project/erp && /usr/bin/env bash -lc 'source ops/env/.env.prod && BACKUP_ROOT=/var/backups/erp RETENTION_DAYS=14 ops/backups/pg_backup.sh >> /var/log/erp-backup.log 2>&1'
```

## Restore example

```bash
PGPASSWORD=<db_password> pg_restore --host=<db_host> --port=5432 --username=<db_user> --dbname=<db_name> --clean /var/backups/erp/<timestamp>/<service>.dump
```
