# Graph Report - backend  (2026-09-22)

## Corpus Check
- 91 files · ~21,422 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 2, .example 1, .log 1)

## Summary
- 771 nodes · 1478 edges · 37 communities (36 shown, 1 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 92 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7a069316`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- PrismaService
- @nestjs/common
- auth.controller.ts
- AuthService
- WordService
- User Management Admin
- SettingsService
- package.json
- Mail Service Delivery
- Runtime Dependencies
- ReviewController
- Dev Dependencies & Testing Tools
- Dashboard Words Admin
- AuditController
- TypeScript Compiler Config
- Review Stats Test Script
- NPM Scripts
- DashboardConfigController
- seed-mock-stats.js
- test-api-integration.js
- pg
- I18n Exception Handling
- Jest Test Config
- Fastify & Prisma Bootstrap
- @prisma/adapter-pg
- Deep Reset Script
- Daily Reset Script
- Wipe All Script
- I18n Response Interceptor
- ESLint Flat Config
- Nest CLI Config
- E2E App Test
- TS Build Config
- LoginDto
- MetaController
- README.md

## God Nodes (most connected - your core abstractions)
1. `@nestjs/common` - 48 edges
2. `PrismaService` - 28 edges
3. `@prisma/client` - 26 edges
4. `@nestjs/swagger` - 23 edges
5. `AuthService` - 22 edges
6. `ManagementController` - 22 edges
7. `compilerOptions` - 22 edges
8. `MailService` - 20 edges
9. `ManagementService` - 20 edges
10. `WordService` - 19 edges

## Surprising Connections (you probably didn't know these)
- `AuditController` --references--> `Roles()`  [EXTRACTED]
  src/dashboard/audit/audit.controller.ts → src/common/decorators/roles.decorator.ts
- `DashboardConfigController` --references--> `Roles()`  [EXTRACTED]
  src/dashboard/config/config.controller.ts → src/common/decorators/roles.decorator.ts
- `ManagementController` --references--> `Roles()`  [EXTRACTED]
  src/dashboard/management/management.controller.ts → src/common/decorators/roles.decorator.ts
- `DashboardWordsController` --references--> `Roles()`  [EXTRACTED]
  src/dashboard/words/words.controller.ts → src/common/decorators/roles.decorator.ts
- `AnalyticsController` --references--> `Roles()`  [EXTRACTED]
  src/dashboard/analytics/analytics.controller.ts → src/common/decorators/roles.decorator.ts

## Import Cycles
- None detected.

## Communities (37 total, 1 thin omitted)

### Community 0 - "PrismaService"
Cohesion: 0.06
Nodes (20): bcryptjs, ref_crypto, @nestjs/testing, @prisma/client, ReviewService, Injectable, VALID_WORD_TYPES, ArchivedUserPayload (+12 more)

### Community 1 - "@nestjs/common"
Cohesion: 0.06
Nodes (45): @nestjs/common, @nestjs/config, @nestjs/passport, @nestjs/swagger, passport-jwt, AuthModule, Module, JwtAuthGuard (+37 more)

### Community 2 - "auth.controller.ts"
Cohesion: 0.07
Nodes (30): class-validator, @nestjs/throttler, ChangePasswordDto, ApiProperty, IsString, MinLength, ForgotPasswordDto, ApiProperty (+22 more)

### Community 3 - "AuthService"
Cohesion: 0.09
Nodes (18): AuthController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Get, Patch (+10 more)

### Community 4 - "WordService"
Cohesion: 0.09
Nodes (23): IsArray, CreateWordDto, ApiProperty, ApiPropertyOptional, IsOptional, IsString, UpdateWordDto, ApiBearerAuth (+15 more)

### Community 5 - "User Management Admin"
Cohesion: 0.11
Nodes (15): ManagementController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Delete, Get (+7 more)

### Community 6 - "SettingsService"
Cohesion: 0.10
Nodes (17): IsBoolean, ApiPropertyOptional, IsOptional, IsString, UpdateSettingsDto, SettingsController, ApiBearerAuth, ApiOperation (+9 more)

### Community 7 - "package.json"
Cohesion: 0.05
Nodes (37): author, description, license, name, private, version, class-transformer, eslint (+29 more)

### Community 8 - "Mail Service Delivery"
Cohesion: 0.15
Nodes (17): ref_dns, nodemailer, MailModule, Global, Module, MailService, Injectable, renderAccountDeletedTemplate() (+9 more)

### Community 9 - "Runtime Dependencies"
Cohesion: 0.07
Nodes (30): dependencies, bcryptjs, class-transformer, class-validator, fastify, @fastify/compress, @fastify/helmet, @fastify/static (+22 more)

### Community 10 - "ReviewController"
Cohesion: 0.20
Nodes (11): ReviewController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Get, Post (+3 more)

### Community 11 - "Dev Dependencies & Testing Tools"
Cohesion: 0.07
Nodes (28): devDependencies, eslint, eslint-config-prettier, @eslint/eslintrc, @eslint/js, eslint-plugin-prettier, globals, jest (+20 more)

### Community 12 - "Dashboard Words Admin"
Cohesion: 0.11
Nodes (15): DashboardWordsController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Delete, Get (+7 more)

### Community 13 - "AuditController"
Cohesion: 0.13
Nodes (11): AuditController, ApiBearerAuth, ApiOperation, ApiTags, Controller, Delete, Get, Param (+3 more)

### Community 14 - "TypeScript Compiler Config"
Cohesion: 0.08
Nodes (23): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+15 more)

### Community 15 - "Review Stats Test Script"
Cohesion: 0.14
Nodes (14): dist_review_review_service, adapter, colors, getDueWords(), getStreak(), getStudyStats(), getTimestampAtDay(), path (+6 more)

### Community 16 - "NPM Scripts"
Cohesion: 0.11
Nodes (18): scripts, build, build:prod, db:pull-live, db:push, db:push-live, format, lint (+10 more)

### Community 17 - "DashboardConfigController"
Cohesion: 0.14
Nodes (11): DashboardConfigController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Get, Patch (+3 more)

### Community 18 - "seed-mock-stats.js"
Cohesion: 0.18
Nodes (9): adapter, args, isReset, MOCK_WORDS, path, { Pool }, prisma, { PrismaClient } (+1 more)

### Community 19 - "test-api-integration.js"
Cohesion: 0.15
Nodes (11): ref_path, adapter, API_BASE, bcrypt, colors, path, { Pool }, prisma (+3 more)

### Community 20 - "pg"
Cohesion: 0.29
Nodes (5): bcrypt, { Pool }, { PrismaClient }, { PrismaPg }, pg

### Community 21 - "I18n Exception Handling"
Cohesion: 0.25
Nodes (6): Catch, ref_fs, I18nExceptionFilter, I18nResponseInterceptor, Injectable, bootstrap()

### Community 22 - "Jest Test Config"
Cohesion: 0.22
Nodes (9): jest, collectCoverageFrom, coverageDirectory, moduleFileExtensions, rootDir, testEnvironment, testRegex, transform (+1 more)

### Community 23 - "Fastify & Prisma Bootstrap"
Cohesion: 0.25
Nodes (6): ref_dotenv, @fastify/compress, @fastify/helmet, @nestjs/core, @nestjs/platform-fastify, prisma

### Community 24 - "@prisma/adapter-pg"
Cohesion: 0.29
Nodes (5): @prisma/adapter-pg, bcrypt, { Pool }, { PrismaClient }, { PrismaPg }

### Community 25 - "Deep Reset Script"
Cohesion: 0.29
Nodes (5): adapter, { Pool }, prisma, { PrismaClient }, { PrismaPg }

### Community 26 - "Daily Reset Script"
Cohesion: 0.29
Nodes (5): adapter, { Pool }, prisma, { PrismaClient }, { PrismaPg }

### Community 27 - "Wipe All Script"
Cohesion: 0.29
Nodes (5): adapter, { Pool }, prisma, { PrismaClient }, { PrismaPg }

### Community 28 - "I18n Response Interceptor"
Cohesion: 0.47
Nodes (3): fastify, rxjs, translations

### Community 29 - "ESLint Flat Config"
Cohesion: 0.40
Nodes (4): @eslint/js, eslint-plugin-prettier, globals, typescript-eslint

### Community 30 - "Nest CLI Config"
Cohesion: 0.40
Nodes (4): collection, compilerOptions, $schema, sourceRoot

### Community 31 - "E2E App Test"
Cohesion: 0.50
Nodes (3): supertest, AppModule, Module

### Community 32 - "TS Build Config"
Cohesion: 0.50
Nodes (3): ./tsconfig.json, exclude, extends

### Community 34 - "LoginDto"
Cohesion: 0.13
Nodes (14): LoginDto, ApiProperty, IsEmail, IsString, MinLength, DashboardAuthController, ApiOperation, ApiTags (+6 more)

### Community 35 - "MetaController"
Cohesion: 0.18
Nodes (8): MetaController, ApiBearerAuth, ApiOperation, ApiTags, Controller, Get, Request, UseGuards

### Community 36 - "README.md"
Cohesion: 0.20
Nodes (9): Compile and run the project, Deployment, Description, License, Project setup, Resources, Run tests, Stay in touch (+1 more)

## Knowledge Gaps
- **207 isolated node(s):** `{ PrismaClient }`, `{ Pool }`, `{ PrismaPg }`, `bcrypt`, `$schema` (+202 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 365 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@nestjs/common` connect `@nestjs/common` to `PrismaService`, `auth.controller.ts`, `WordService`, `package.json`, `Mail Service Delivery`, `Fastify & Prisma Bootstrap`, `I18n Response Interceptor`, `E2E App Test`?**
  _High betweenness centrality (0.236) - this node is a cross-community bridge._
- **Why does `@prisma/client` connect `PrismaService` to `@nestjs/common`, `package.json`, `Review Stats Test Script`, `seed-mock-stats.js`, `test-api-integration.js`, `pg`, `@prisma/adapter-pg`, `Deep Reset Script`, `Daily Reset Script`, `Wipe All Script`?**
  _High betweenness centrality (0.169) - this node is a cross-community bridge._
- **Why does `@nestjs/swagger` connect `@nestjs/common` to `auth.controller.ts`, `WordService`, `Fastify & Prisma Bootstrap`, `package.json`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **What connects `{ PrismaClient }`, `{ Pool }`, `{ PrismaPg }` to the rest of the system?**
  _207 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `PrismaService` be split into smaller, more focused modules?**
  _Cohesion score 0.06078316773816481 - nodes in this community are weakly interconnected._
- **Should `@nestjs/common` be split into smaller, more focused modules?**
  _Cohesion score 0.057703081232493 - nodes in this community are weakly interconnected._
- **Should `auth.controller.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07057057057057058 - nodes in this community are weakly interconnected._