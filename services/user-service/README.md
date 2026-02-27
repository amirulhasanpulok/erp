# User Service

User management microservice for ERP.

## Features
- Create user with outlet and roles
- List/get/update/deactivate user
- JWT access token guard
- PostgreSQL migrations
- RabbitMQ event publisher/subscriber with DLQ
- Redis idempotency for event consumers
- Swagger (`/api/docs`)
- Health endpoint (`/api/v1/health`)

