# LexiNote Backend

NestJS 11 API running on the Fastify adapter, with Prisma 7 and PostgreSQL.

The backend is mounted under the global `/api` prefix and exposes two API namespaces:

- Client API: `/api/v1/client`
- Dashboard API: `/api/v1/dashboard`

## Setup

```powershell
npm install
Copy-Item .env.example .env
```

Configure `DATABASE_URL`, `JWT_SECRET`, and any mail provider variables in `.env`.

```powershell
npm run db:push
npx prisma generate
npm run start:dev
```

## API documentation

When the server is running on the default port:

- Swagger UI: `http://localhost:1337/api/docs`
- OpenAPI JSON: `http://localhost:1337/api/docs-json`
- Health check: `http://localhost:1337/api`

The complete Postman collection is available at [`../docs/postman/LexiNote.postman_collection.json`](../docs/postman/LexiNote.postman_collection.json).

## Commands

```powershell
npm run start:dev   # development with watch mode
npm run start       # development without watch mode
npm run build       # compile the backend
npm run start:prod  # run the compiled backend
npm run lint
npm test
npm run test:e2e
npm run test:cov
```

See the [root README](../README.md) for the complete local setup.
