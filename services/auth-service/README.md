# Auth Service

Authentication microservice for ERP.

## Features
- Register credential
- Login with outlet-aware credential
- JWT access token + refresh token rotation
- Refresh token hash storage
- RBAC-ready token payload (`role`)
- PostgreSQL migrations
- RabbitMQ event publisher/subscriber scaffold with DLQ
- Redis idempotency for event consumers
- Swagger (`/api/docs`)
- Health endpoint (`/api/v1/health`)

