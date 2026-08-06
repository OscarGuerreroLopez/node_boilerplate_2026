# node-boilerplate-2026-single-app

TypeScript + Express single-app boilerplate to start backend projects quickly without Nx workspaces/monorepos.

This version includes:
- **pnpm** for dependency management
- **Health check endpoint** (public `GET /health`)
- **Sample feature** with complete implementation showing the architecture pattern
- **3-layer architecture** (presentation → domain → data-access) with dependency injection
- **API versioning** support (v1)
- **Request context** (request ID tracking and user info)
- **API key authentication** middleware
- **Jest** with coverage enabled
- **ESLint + Prettier** for code quality
- **GitHub Actions** for CI/CD (lint, test, build on all branches)

## Requirements

- Node.js `>=22.13.0` (see `.nvmrc`)
- pnpm `>=11.0.0`

## Setup

```bash
nvm use
pnpm install
cp .env.template .env
```

## Environment

`.env.template` includes:

```env
SAMPLE_PORT=9000
API_KEY=your-local-api-key
NODE_ENV=local
```

Optional variables:

```env
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
MAX_JSON_BODY_SIZE=300kb
SMALL_REQUEST_BYTES=65536
```

## Run

Development:

```bash
pnpm dev
```

Build:

```bash
pnpm build
```

Start compiled app:

```bash
pnpm start
```

## Endpoints

- Health (public): `GET /health`
- Sample (versioned + API key protected): `GET /api/v1/sample`

Example requests:

```bash
curl http://localhost:9000/health

curl "http://localhost:9000/api/v1/sample?name=Oscar" \
  -H "x-api-key: your-local-api-key" \
  -H 'user: {"id":"u-1","email":"oscar@example.com"}'
```

## Architecture

### Layered Design
Each feature module follows a clean architecture with clear separation of concerns:

- **Controllers** handle HTTP requests and delegate to usecases
- **Usecases** orchestrate business logic with dependency injection via function composition
- **Services** contain reusable business logic
- **DTOs** provide type-safe data transfer and validation
- **Repositories** (data-access layer) manage persistence

### Request Flow
HTTP request → Route → Controller → Usecase → Services → Repository → Response

### Middleware Stack
1. **Express Essentials** — JSON parsing, CORS, Helmet security
2. **Request Context** — Extracts `code` (request ID) and `user` from headers
3. **API Key Validation** — Applied per-route to protected endpoints

Example of adding authentication to a route:
```typescript
router.get('/protected', validateApiKey, controller.handler);
```

### Adding a New Feature

1. Create directory: `src/features/your-feature/`
2. Structure with: `http-presentation/`, `domain/` (with `dtos/`, `services/`, `usecases/`)
3. Export routes from `http-presentation/routes.ts`
4. Register routes in `src/versions/v1/routes.ts`
5. Implement using the sample feature as template

## Quality Scripts

- `pnpm lint` — Run ESLint
- `pnpm test` — Run Jest
- `pnpm test:coverage` — Generate coverage
- `pnpm typecheck` — TypeScript validation
- `pnpm prettier-check` — Format validation
- `pnpm check-code` — Run all checks (recommended before committing)

## Versioning

- `pnpm version:patch`
- `pnpm version:minor`
- `pnpm version:major`

## Project Structure

Each feature in `src/features/` follows a 3-layer architecture:

1. **HTTP Presentation** — Routes and controllers
2. **Domain** — Business logic (usecases, services, DTOs)
3. **Data Access** — Repository/persistence layer

Common utilities and middleware are in `src/common/`, core infrastructure (config, logger) in `src/core/`.

```text
src/
  ├── app.ts                    # Express app setup
  ├── index.ts                  # Entry point
  ├── start-server.ts           # Server initialization
  ├── types/                    # Global types (express augmentation)
  ├── common/                   # Shared infrastructure
  │   ├── constants/            # HTTP status codes, etc.
  │   ├── context/              # Request context parsing
  │   ├── middlewares/          # Express middleware
  │   ├── types/                # Common type definitions
  │   └── utils/                # Shared utilities
  ├── core/                     # Core services
  │   ├── config/               # Environment configuration
  │   └── logger/               # Logging service
  ├── features/                 # Feature modules
  │   ├── health/               # Health check feature
  │   │   └── http-presentation/
  │   └── sample/               # Sample feature (template)
  │       ├── domain/
  │       │   ├── dtos/         # Data transfer objects
  │       │   ├── services/     # Business logic
  │       │   └── usecases/     # Application orchestration
  │       └── http-presentation/
  └── versions/                 # API versioning
      └── v1/
```
