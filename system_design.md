# LexiNote System Design 🐰✨

LexiNote is a modern, cute, and efficient vocabulary learning application built with **Sails.js** (Backend) and **React** (Frontend). It uses a Spaced Repetition System (SRS) to help users memorize words effectively.

## 🏗️ Architecture Overview

The system follows a classic Client-Server architecture:

1.  **Frontend (Client)**: A Single Page Application (SPA) built with React, Vite, and Redux Toolkit.
2.  **Backend (Server)**: A RESTful API built with Sails.js (Node.js framework).
3.  **Database**: PostgreSQL for persistent storage of user data, words, and review history.

---

## 🚀 Deployment Strategy (Go Live)

To ensure stability, scalability, and cost-effectiveness (Free Tier), the following stack is used for production:

### 1. Persistent Layer (Database)
- **Provider**: [Supabase](https://supabase.com/) or [Neon](https://neon.tech/)
- **Service**: Managed PostgreSQL
- **Free Tier Benefits**: High availability, automatic backups (Supabase), and generous storage (500MB+).

### 2. Backend API (Server)
- **Provider**: [Render](https://render.com/)
- **Service**: Web Service (Docker or Native Node.js)
- **Environment Variables**:
    - `NODE_ENV`: `production`
    - `DATABASE_URL`: Connection string from Supabase.
    - `JWT_SECRET`: Secure random string for token signing (JWT).
    - `ALLOWED_ORIGINS`: Your Vercel domain (e.g., `https://lexinote.vercel.app`).
- **Optimization**: Use an external pinger (like Cron-job.org) to keep the service awake.

### 3. Frontend Application
- **Provider**: [Vercel](https://vercel.com/)
- **Service**: Static Site Hosting
- **Environment Variable**: 
    - `VITE_API_URL`: pointing to the Render backend URL (e.g., `https://lexinote-api.onrender.com/api`).

---

## 🔐 Security & Authentication

### JWT Authentication
- Users authenticate via Email/Password.
- Backend issues a JSON Web Token (JWT) on success.
- Frontend stores the JWT in `localStorage` and includes it in the `Authorization` header for all protected API calls.

### Data Ownership
- Every `Word` and `Review` record is linked to a `User` via an `owner` ID.
- Policies (Sails.js `isLoggedIn`) ensure that users can only access and modify their own data.

## 🛠️ Tech Stack Summary

- **Frontend**: React 18, Vite, Redux Toolkit (RTK Query), Framer Motion, Lucide React.
- **Backend**: Sails.js v1.5 (Node.js), JWT, Bcrypt.js.
- **Database**: PostgreSQL.
- **Design**: Vanilla CSS with a Custom Design System (Soft colors, rounded corners, playful animations).

---

*Last Updated: 2026-03-18*
