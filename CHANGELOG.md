# Changelog

All notable changes to the LexiNote project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), 
and this project adheres to Semantic Versioning as it matures.

## [Unreleased / Latest] - 2026-04-02

### Added
- **GitNexus Integration**: Added GitNexus skill documentation for improved project intelligence.
- **Welcome Guide & Settings**: Implemented a welcome guide for new users and a settings service for application configuration.
- **Internationalization (i18n)**: Expanded localization support across the application.

### Changed
- **Repository Management**: Updated `.gitignore` to exclude project metadata files and removed local assistant meta tags from the remote repository.

---

## [Backend Migration & Full Stack App] - 2026-03-29

### Added
- **NestJS Backend**: Initialized the new NestJS backend with Prisma configuration.
- **Authentication Service**: Implemented robust JWT-based session management, email verification, and password reset functionality.
- **Database Synchronization**: Added a PowerShell script (`sync-db.ps1`) to synchronize local and remote Supabase databases effortlessly.
- **Frontend App Shell**: Implemented the main App component including routing, authentication flow, and a dashboard layout structure.
- **RTK Query Integration**: Set up an RTK Query API slice with automatic token refresh and seamless authentication handling.

---

## [Backend Enhancements & i18n Setup] - 2026-03-22

### Added
- **Language & Settings**: Added word types management in settings (noun, verb, adjective, etc.). Created `LanguageSettingsPage` with support for English and Vietnamese.
- **JWT Guards & Strategies**: Implemented robust JWT authentication with `JwtAuthGuard` and `JwtStrategy`.
- **System Internals**: Added `MetaController`/`MetaService` for health checks, `ReviewController` for flashcard reviews, and `WordController` for CRUD operations on vocabulary.
- **Internationalization (i18n)**: Integrated `i18next` for seamless language detection and translation across Profile, Navigation, Dashboard, Library, and Games.

### Fixed
- **Render Deployment**: Corrected `dist/main` path forRender, added `db:push` scripts, and moved build-time dependencies appropriately.
- **Cleanups**: Removed unused i18n imports to optimize component rendering.

### Chore
- Added `tsconfig.build.tsbuildinfo` to enable faster incremental compilation for TypeScript.

---

## [Authentication & Foundation] - 2026-03-21

### Added
- **Auth Features**: Deeply enhanced password management with master verification code and visibility toggles for password fields.
- **Controllers Workflow**: Built out `AuthController` to handle user registration, login, token refresh, and profile updates.
- **Core Systems Setup**: Deployed foundational global styling alongside a robust authentication framework.

---

## [Initial Setup & Pre-migration Backend] - 2026-03-17 to 2026-03-20

### Added
- **First Iterations**: Initialized the LexiNote project.
- **Frontend Foundations**: Built the initial React-based interface encompassing word management, a study mode component, routing, scroll-to-top functionality, and global CSS styling.
- **File Imports**: Added a robust word import component utilizing CSV/Excel uploads and manual text pasting with instant data preview capabilities.
- **Legacy Backend Setup**: Initial setup using Sails.js. Configured security headers, CORS, rate limiting policies, database connections, and Vercel routing configurations. *(Note: Backend architecture was subsequently migrated to NestJS on March 22-29).*
