# LexiNote Client

The client application is the learner-facing React 19 + Vite application. It provides vocabulary management, spaced repetition study, statistics, achievements, and minigames.

## Setup

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

The default environment variable points to the client API:

```env
VITE_API_URL=http://localhost:1337/api/v1/client
```

The Vite development server normally runs at `http://localhost:5173`.

## Commands

```powershell
npm run dev
npm run lint
npm run build
npm run preview
```

See the [root README](../README.md) for backend, Swagger, dashboard, and Postman instructions.
