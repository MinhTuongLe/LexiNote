# Graph Report - backend  (2026-09-22)

## Corpus Check
- 91 files · ~21,628 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 2, .example 1, .log 1)

## Summary
- 774 nodes · 1481 edges · 41 communities (37 shown, 4 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 92 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7a069316`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- @nestjs/common
- app.module.ts
- ResetPasswordDto
- AuthService
- WordService
- User Management Admin
- SettingsService
- package.json
- Mail Service Delivery
- Runtime Dependencies
- ReviewService
- Dev Dependencies & Testing Tools
- Dashboard Words Admin
- AuditService
- TypeScript Compiler Config
- Review Stats Test Script
- scripts
- DashboardConfigController
- seed-mock-stats.js
- test-api-integration.js
- pg
- main.ts
- Jest Test Config
- prisma.config.ts
- @prisma/adapter-pg
- Deep Reset Script
- Daily Reset Script
- Wipe All Script
- I18n Response Interceptor
- ESLint Flat Config
- Nest CLI Config
- AnalyticsController
- TS Build Config
- LoginDto
- RegisterDto
- README.md
- UpdateProfileDto
- VerifyEmailDto
- I18nResponseInterceptor
- meta.service.ts

## God Nodes (most connected - your core abstractions)
1. `@nestjs/common` - 48 edges
2. `PrismaService` - 28 edges
3. `@prisma/client` - 26 edges
4. `@nestjs/swagger` - 23 edges
5. `AuthService` - 22 edges
6. `ManagementController` - 22 edges
7. `compilerOptions` - 22 edges
8. `scripts` - 21 edges
9. `MailService` - 20 edges
10. `ManagementService` - 20 edges

## Surprising Connections (you probably didn't know these)
- `AnalyticsController` --references--> `Roles()`  [EXTRACTED]
  src/dashboard/analytics/analytics.controller.ts → src/common/decorators/roles.decorator.ts
- `AuditController` --references--> `Roles()`  [EXTRACTED]
  src/dashboard/audit/audit.controller.ts → src/common/decorators/roles.decorator.ts
- `DashboardConfigController` --references--> `Roles()`  [EXTRACTED]
  src/dashboard/config/config.controller.ts → src/common/decorators/roles.decorator.ts
- `ManagementController` --references--> `Roles()`  [EXTRACTED]
  src/dashboard/management/management.controller.ts → src/common/decorators/roles.decorator.ts
- `DashboardWordsController` --references--> `Roles()`  [EXTRACTED]
  src/dashboard/words/words.controller.ts → src/common/decorators/roles.decorator.ts

## Import Cycles
- None detected.

## Communities (41 total, 4 thin omitted)

### Community 0 - "@nestjs/common"
Cohesion: 0.07
Nodes (29): IsArray, class-validator, @nestjs/common, @nestjs/swagger, @prisma/client, ChangePasswordDto, ApiProperty, IsString (+21 more)

### Community 1 - "app.module.ts"
Cohesion: 0.06
Nodes (36): @nestjs/config, @nestjs/passport, passport-jwt, supertest, AppModule, Module, AuthModule, Module (+28 more)

### Community 2 - "ResetPasswordDto"
Cohesion: 0.33
Nodes (6): ResetPasswordDto, ApiProperty, IsEmail, IsString, Length, MinLength

### Community 3 - "AuthService"
Cohesion: 0.07
Nodes (22): bcryptjs, ref_crypto, @nestjs/jwt, @nestjs/testing, AuthController, ApiBearerAuth, ApiOperation, ApiTags (+14 more)

### Community 4 - "WordService"
Cohesion: 0.08
Nodes (24): ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Delete, Get, Param (+16 more)

### Community 5 - "User Management Admin"
Cohesion: 0.11
Nodes (15): ManagementController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Delete, Get (+7 more)

### Community 6 - "SettingsService"
Cohesion: 0.09
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

### Community 10 - "ReviewService"
Cohesion: 0.11
Nodes (13): ReviewController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Get, Post (+5 more)

### Community 11 - "Dev Dependencies & Testing Tools"
Cohesion: 0.07
Nodes (28): devDependencies, eslint, eslint-config-prettier, @eslint/eslintrc, @eslint/js, eslint-plugin-prettier, globals, jest (+20 more)

### Community 12 - "Dashboard Words Admin"
Cohesion: 0.11
Nodes (15): DashboardWordsController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Delete, Get (+7 more)

### Community 13 - "AuditService"
Cohesion: 0.12
Nodes (13): AuditController, ApiBearerAuth, ApiOperation, ApiTags, Controller, Delete, Get, Param (+5 more)

### Community 14 - "TypeScript Compiler Config"
Cohesion: 0.08
Nodes (23): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+15 more)

### Community 15 - "Review Stats Test Script"
Cohesion: 0.14
Nodes (14): dist_review_review_service, adapter, colors, getDueWords(), getStreak(), getStudyStats(), getTimestampAtDay(), path (+6 more)

### Community 16 - "scripts"
Cohesion: 0.10
Nodes (21): scripts, // build, // build:prod, // db:pull-live, // db:push, // db:push-live, // format, // graphify (+13 more)

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

### Community 21 - "main.ts"
Cohesion: 0.22
Nodes (8): Catch, @fastify/compress, @fastify/helmet, ref_fs, @nestjs/core, @nestjs/platform-fastify, I18nExceptionFilter, bootstrap()

### Community 22 - "Jest Test Config"
Cohesion: 0.22
Nodes (9): jest, collectCoverageFrom, coverageDirectory, moduleFileExtensions, rootDir, testEnvironment, testRegex, transform (+1 more)

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

### Community 31 - "AnalyticsController"
Cohesion: 0.16
Nodes (9): AnalyticsController, ApiBearerAuth, ApiOperation, ApiTags, Controller, Get, UseGuards, AnalyticsService (+1 more)

### Community 32 - "TS Build Config"
Cohesion: 0.50
Nodes (3): ./tsconfig.json, exclude, extends

### Community 34 - "LoginDto"
Cohesion: 0.13
Nodes (14): LoginDto, ApiProperty, IsEmail, IsString, MinLength, DashboardAuthController, ApiOperation, ApiTags (+6 more)

### Community 35 - "RegisterDto"
Cohesion: 0.40
Nodes (5): RegisterDto, ApiProperty, IsEmail, IsString, MinLength

### Community 36 - "README.md"
Cohesion: 0.20
Nodes (9): Compile and run the project, Deployment, Description, License, Project setup, Resources, Run tests, Stay in touch (+1 more)

### Community 37 - "UpdateProfileDto"
Cohesion: 0.40
Nodes (5): ApiPropertyOptional, IsOptional, IsString, MinLength, UpdateProfileDto

### Community 38 - "VerifyEmailDto"
Cohesion: 0.40
Nodes (5): ApiProperty, IsEmail, IsString, Length, VerifyEmailDto

## Knowledge Gaps
- **210 isolated node(s):** `{ PrismaClient }`, `{ Pool }`, `{ PrismaPg }`, `bcrypt`, `$schema` (+205 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 368 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@nestjs/common` connect `@nestjs/common` to `app.module.ts`, `AuthService`, `package.json`, `Mail Service Delivery`, `meta.service.ts`, `main.ts`, `I18n Response Interceptor`?**
  _High betweenness centrality (0.236) - this node is a cross-community bridge._
- **Why does `@prisma/client` connect `@nestjs/common` to `AuthService`, `package.json`, `Review Stats Test Script`, `seed-mock-stats.js`, `test-api-integration.js`, `pg`, `@prisma/adapter-pg`, `Deep Reset Script`, `Daily Reset Script`, `Wipe All Script`?**
  _High betweenness centrality (0.169) - this node is a cross-community bridge._
- **Why does `@nestjs/swagger` connect `@nestjs/common` to `main.ts`, `package.json`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **What connects `{ PrismaClient }`, `{ Pool }`, `{ PrismaPg }` to the rest of the system?**
  _210 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `@nestjs/common` be split into smaller, more focused modules?**
  _Cohesion score 0.07347915242652085 - nodes in this community are weakly interconnected._
- **Should `app.module.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06475485661424607 - nodes in this community are weakly interconnected._
- **Should `AuthService` be split into smaller, more focused modules?**
  _Cohesion score 0.06994047619047619 - nodes in this community are weakly interconnected._