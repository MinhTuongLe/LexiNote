# LexiNote Admin Dashboard

The dashboard is the admin-facing React 19 + Vite application for managing users, sessions, vocabulary content, moderation, analytics, system configuration, and audit records.

Dashboard endpoints require a JWT issued to a user with `role=ADMIN`.

## Setup

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

The default environment variable points to the dashboard API:

```env
VITE_API_URL=http://localhost:1337/api/v1/dashboard
```

Vite normally chooses the next available port when the client frontend is already using `5173`, commonly `http://localhost:5174`.

## Commands

```powershell
npm run dev
npm run lint
npm test
npm run build
npm run preview
```

See the [root README](../README.md) for the complete local setup, Swagger links, and Postman collection.
