# 📝 Changelog

All notable changes to the **LexiNote** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to Semantic Versioning as it matures.

---

## 🚀 [Released / Latest] — 2026-04-27

### ✨ Added
- **Match Game** — A new vocabulary matching mini-game with two-column layout, real-time score tracking, error/success animations, and sound effects.
- **SRS Flashcard System** — Implemented a Spaced Repetition System in Study Mode with flip-card animations and a 3-tier rating system (Hard / Medium / Easy) for optimized memory retention.
- **Global Sound Engine** — Centralized `useSound` hook providing audio feedback for clicks, flips, successes, errors, and game wins across the entire application.
- **Danger Zone & Account Management** — Added a dedicated danger zone section in the Profile page, allowing users to deactivate their account with confirmation dialogs and full data cleanup.
- **Backend Settings API** — Extended the Settings service with dedicated endpoints for user preferences management, sound settings persistence, and account deactivation.

### 🔧 Changed
- **Modular CSS Architecture** — Refactored all frontend components and views into isolated CSS modules, eliminating global style collisions and improving maintainability.
- **Settings & Preferences Redesign** — Rebuilt the Settings page into organized sections with a new Language & Study sub-page, toggle switches for sound, and a polished `CuteSelect` dropdown component.
- **Profile Page Enhancement** — Added inline avatar picker with 24 emoji options, editable display name, and a password change modal with visibility toggles.
- **Dependency Modernization** — Upgraded core dependencies via Dependabot:
  - Frontend: TypeScript `5.9.3` → `6.0.2`, React Router → `7.14.0`, i18next `25.10.2` → `26.0.3`, react-i18next → `16.6.5`
  - Backend: Prisma `7.5.0` → `7.8.0`, ESLint `9.39.4` → `10.2.1`, `@nestjs/schematics` bump, `@types/supertest` → `7.2.0`

### 🐛 Fixed
- **Vercel Build Stability** — Resolved critical TypeScript compilation errors: added missing `style` prop to `Card` component interface and removed all unused imports/variables in `SettingsPage`.

---

## ⚡ [Performance & Project Structure] — 2026-04-02 to 2026-04-07

### ✨ Added
- **CI/CD Pipeline** — Configured GitHub Actions workflow for automated testing and deployment.
- **Dependabot Integration** — Set up automated dependency monitoring for frontend, backend, and GitHub Actions.
- **Community & Contribution Docs** — Added `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, issue templates (bug report, feature request), and a PR template.
- **Welcome Guide** — Built a full-screen onboarding experience for new users with illustrated cover images and step-by-step navigation.
- **Global Rate Limiting** — Enabled `ThrottlerGuard` globally to protect the API from DDoS and spam.
- **Fastify Payload Compression** — Integrated `@fastify/compress` for Gzip/Brotli response compression, reducing network latency.
- **SWC Compiler Integration** — Replaced standard `tsc` with `@swc/core` & `@swc/cli` in `nest-cli.json` to deliver ~20× faster compilation.

### 🔧 Changed
- **Backend Restructuring** — Consolidated `backend-nest/` into `backend/`, fully removing the legacy Sails.js codebase and establishing NestJS as the sole backend framework.
- **Database B-Tree Indexing** — Added Prisma schema indexes on `Word.ownerId`, `WordRelation.wordId`, `Review.nextReview`, and `RefreshToken` fields, eliminating sequential scans.
- **Bulk Import Optimization** — Rewrote `WordService.importBulk` with async chunk batching (`Promise.all`), increasing CSV import throughput by >10× and stopping N+1 query bottlenecks.
- **Frontend Perf Strategy** — Reverted SPA speculative prerendering to `prefetch` to avoid background React auth-state collision (401 session resets).
- **RAM Bounds Guarding** — Added a `take: 100` hard limit in `ReviewService.getDueWords` with priority sorting, preventing memory overflow on massive overdue queues.
- **Repository Cleanup** — Updated `.gitignore` to exclude project metadata files and removed assistant meta tags from the remote repository.

### 🐛 Fixed
- **CORS Configuration** — Fixed cross-origin request handling in the NestJS backend for production deployments.

---

## 🏗️ [Backend Migration & Full-Stack App] — 2026-03-29

### ✨ Added
- **NestJS Backend** — Initialized the new NestJS backend with Prisma ORM configuration and database schema.
- **Authentication Service** — Implemented robust JWT-based session management with access/refresh token rotation, email verification, and password reset flows.
- **Database Synchronization** — Added a PowerShell script (`sync-db.ps1`) to synchronize local and remote Supabase databases effortlessly.
- **Frontend App Shell** — Built the main `App` component with React Router, authentication guards, and a complete dashboard layout structure.
- **RTK Query Integration** — Set up an RTK Query API slice with automatic token refresh, 401 interception, and seamless session handling.

---

## 🌐 [Backend Enhancements & i18n Setup] — 2026-03-22

### ✨ Added
- **Language & Settings** — Added word types management in settings (noun, verb, adjective, etc.) with a dedicated `LanguageSettingsPage`.
- **JWT Guards & Strategies** — Implemented robust JWT authentication middleware with `JwtAuthGuard` and `JwtStrategy`.
- **System Internals** — Added `MetaController`/`MetaService` for health checks, `ReviewController` for SRS flashcard reviews, and `WordController` for vocabulary CRUD.
- **Internationalization (i18n)** — Integrated `i18next` with automatic language detection and translations across Profile, Navigation, Dashboard, Library, and Games (English & Vietnamese).

### 🐛 Fixed
- **Render Deployment** — Corrected `dist/main` path for Render, added `db:push` scripts, and moved build-time dependencies to production deps.
- **Code Cleanups** — Removed unused i18n imports to optimize component rendering.

### 🔩 Chore
- Added `tsconfig.build.tsbuildinfo` to enable faster incremental TypeScript compilation.

---

## 🔐 [Authentication & Foundation] — 2026-03-21

### ✨ Added
- **Auth Features** — Enhanced password management with a master verification code system and visibility toggles for all password fields.
- **AuthController** — Built out the full authentication controller handling user registration, login, JWT token refresh, email verification, and profile updates.
- **Core Systems Setup** — Deployed foundational global styling alongside a robust authentication framework with session persistence.

---

## 🌱 [Initial Setup & Pre-migration Backend] — 2026-03-17 to 2026-03-20

### ✨ Added
- **Project Initialization** — Created the LexiNote monorepo with frontend and backend workspaces.
- **Frontend Foundations** — Built the initial React-based interface including word management, study mode with flashcards, a word matching game, library view, routing, scroll-to-top functionality, and global CSS styling.
- **Word Import System** — Added a robust import component supporting CSV/Excel file uploads and manual text pasting with instant data preview and validation.
- **Legacy Backend (Sails.js)** — Configured security headers, CORS policies, rate limiting for auth endpoints, PostgreSQL database connections, and Vercel routing rewrites. *(Note: Backend was subsequently migrated to NestJS starting March 22.)*
