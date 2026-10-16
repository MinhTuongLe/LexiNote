<div align="center">

# 📝 LexiNote

**A full-stack vocabulary learning application with spaced repetition, analytics, and an admin dashboard.**

[![React](https://img.shields.io/badge/React-19-20232A?logo=react&logoColor=61DAFB)](https://react.dev/)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Fastify](https://img.shields.io/badge/Fastify-5-000000?logo=fastify&logoColor=white)](https://fastify.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-7-3982CE?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

[Report a bug](https://github.com/MinhTuongLe/LexiNote/issues) · [Request a feature](https://github.com/MinhTuongLe/LexiNote/issues) · [API collection](docs/postman/LexiNote.postman_collection.json)

</div>

## Overview

LexiNote helps learners build and retain an English vocabulary through personal word libraries, spaced repetition reviews, study statistics, and a vocabulary matching game. The repository also contains a separate admin dashboard for user, content, moderation, analytics, configuration, and audit management.

## Repository structure

```text
LexiNote/
├── backend/       NestJS API, Fastify adapter, Prisma, PostgreSQL
├── frontend/      Client learning application
├── dashboard/     Admin dashboard application
├── docs/postman/  Postman collection and API usage notes
├── CHANGELOG.md
├── CONTRIBUTING.md
└── master_feature_roadmap.md
```

### Applications

| Application | Stack | Default URL | API base path |
| --- | --- | --- | --- |
| Backend | NestJS 11, Fastify 5, Prisma 7 | `http://localhost:1337` | — |
| Client | React 19, Vite 8, Redux Toolkit | `http://localhost:5173` | `/api/v1/client` |
| Dashboard | React 19, Vite 8, Redux Toolkit | Vite chooses an available port, usually `5174` | `/api/v1/dashboard` |

## Features

- Personal vocabulary CRUD and bulk import/export.
- Spaced repetition reviews and learning statistics.
- Weekly activity, progress analytics, weak-word insights, and achievements.
- Match Game with recorded scores and weekly leaderboard.
- JWT access/refresh-token authentication with email verification and password recovery.
- Vietnamese and English interfaces.
- Admin user/session management, moderation, audit logs, archive recovery, configuration, and analytics.

## Requirements

- Node.js 20.19+ or 22.12+ (required by the current Vite version).
- npm or Yarn.
- PostgreSQL.
- A mail provider configuration if testing registration, verification, or password-reset emails.

## Local setup

Open three terminals from the repository root.

### 1. Backend

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Edit `backend/.env` and provide at least a working `DATABASE_URL` and `JWT_SECRET`. For local development, also configure the allowed frontend origins and mail settings when needed.

```powershell
npm run db:push
npx prisma generate
npm run start:dev
```

The API is then available at `http://localhost:1337`.

### 2. Client frontend

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

The default `frontend/.env` value is:

```env
VITE_API_URL=http://localhost:1337/api/v1/client
```

### 3. Admin dashboard

```powershell
cd dashboard
npm install
Copy-Item .env.example .env
npm run dev
```

The default `dashboard/.env` value is:

```env
VITE_API_URL=http://localhost:1337/api/v1/dashboard
```

Use an account with `role=ADMIN` to sign in to the dashboard.

## Swagger and API testing

With the backend running, open:

- Swagger UI: [http://localhost:1337/api/docs](http://localhost:1337/api/docs)
- OpenAPI JSON: [http://localhost:1337/api/docs-json](http://localhost:1337/api/docs-json)
- Health check: [http://localhost:1337/api](http://localhost:1337/api)

For repeatable requests, import [the Postman collection](docs/postman/LexiNote.postman_collection.json). It includes all client and dashboard routes, stores tokens automatically after login, and uses `http://localhost:1337` by default. To target production, change only the collection variable `apiOrigin` to the deployed backend origin.

Protected Swagger requests require `Authorize` with:

```text
Bearer <access-token>
```

Client and dashboard tokens are separate in the Postman collection. Dashboard endpoints additionally require an admin role.

## Useful commands

### Backend

```powershell
cd backend
npm run lint
npm test
npm run test:e2e
```

### Client frontend

```powershell
cd frontend
npm run lint
npm run build
```

### Admin dashboard

```powershell
cd dashboard
npm run lint
npm test
npm run build
```

## Documentation

- [Postman collection guide](docs/postman/README.md)
- [Contribution guide](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)
- [Master feature roadmap](master_feature_roadmap.md)

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request and follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

This repository currently does not include a `LICENSE` file. The backend package is marked `UNLICENSED`; add and document an explicit license before distributing the project under an open-source license.
