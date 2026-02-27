# API Gateway

NestJS API Gateway for ERP microservices.

## Features
- REST entrypoint for all services
- URI versioning (`/api/v1/...`)
- Swagger docs (`/api/docs`)
- JWT bearer guard scaffold
- RabbitMQ publisher/subscriber with event envelope
- Idempotent event consumption using Redis `SET NX`
- Dead-letter queue setup
- Health endpoint (`/api/v1/health`)

## Run
```bash
npm install
npm run start:dev
```

