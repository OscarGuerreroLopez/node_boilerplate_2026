# node-boilerplate-2026-single-app

TypeScript + Express single-app boilerplate to start backend projects quickly without Nx workspaces/monorepos.

This version includes:
- **pnpm** for dependency management
- **Health check endpoint** (public `GET /health`)
- **Sample feature** showing the HTTP presentation and domain layers
- **Feature-oriented layered design** with data access added when persistence is needed
- **API versioning** support (v1)
- **Request context** (request ID tracking and user info)
- **API key authentication** middleware
- **Jest** with coverage enabled
- **ESLint + Prettier** for code quality
- **GitHub Actions** for CI/CD (lint, test, build on all branches)

## Requirements

- [NVM](https://github.com/nvm-sh/nvm)
- Node.js `>=22.13.0` (see `.nvmrc`)
- pnpm `11.3.0` (see `packageManager` in `package.json`)

## First-time setup

```bash
nvm install
nvm use

corepack enable
corepack prepare pnpm@11.3.0 --activate

pnpm install
cp .env.template .env
```

Corepack manages the pnpm version declared by the project. If `pnpm --version` already reports `11.3.0`,
the Corepack commands can be skipped.

## Environment

`.env.template` includes:

```env
PORT=9000
API_KEY=your-local-api-key
NODE_ENV=local
API_PREFIX=/api/v1
TRUST_PROXY=false
TRUST_IDENTITY_HEADER=false
CORS_ALLOWED_ORIGINS=
MAX_JSON_BODY_SIZE=300kb
SHUTDOWN_TIMEOUT_MS=10000
REQUEST_TIMEOUT_MS=300000
HEADERS_TIMEOUT_MS=60000
KEEP_ALIVE_TIMEOUT_MS=5000
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=120
```

`PORT` takes precedence over the legacy `SAMPLE_PORT` fallback. `API_KEY` must be set to a
non-default value when `NODE_ENV=production`, otherwise the process refuses to start.

`CORS_ALLOWED_ORIGINS` is a comma-separated allowlist. When it is empty, local and test
environments allow all origins, while production denies browser origins that are not listed.
Requests without an `Origin` header are always allowed. Credentials are enabled only when the
allowlist is non-empty; an empty allowlist allows all origins without cross-origin cookies or
HTTP auth credentials.

`TRUST_PROXY` controls Express proxy trust and defaults to `false`. Enable it only when the app
runs behind a trusted proxy that sets client IP headers.

`TRUST_IDENTITY_HEADER` defaults to `false`. When enabled, the app reads identity only from the
`x-authenticated-user` header as JSON. Enable it only behind a trusted gateway that strips any
client-supplied identity headers before adding its own. The legacy `user` header is always
ignored.

`MAX_JSON_BODY_SIZE` limits both JSON and URL-encoded request bodies at the parser level. Requests
above the limit receive a structured `413` response.

`SHUTDOWN_TIMEOUT_MS` is the grace period for active requests during `SIGINT` or `SIGTERM`.
Remaining connections are closed after the timeout.

`REQUEST_TIMEOUT_MS`, `HEADERS_TIMEOUT_MS`, and `KEEP_ALIVE_TIMEOUT_MS` set the HTTP server
timeouts in milliseconds. Defaults are 300000 (5 minutes), 60000 (1 minute), and 5000
(5 seconds). `HEADERS_TIMEOUT_MS` must be less than or equal to `REQUEST_TIMEOUT_MS`.
`KEEP_ALIVE_TIMEOUT_MS` should exceed the reverse proxy idle timeout, otherwise the proxy may
close connections and return 502 responses.

`RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX` set the per-IP request limit. Window uses milliseconds:
use `60000` for 60 seconds; `60` means 60 milliseconds. Defaults are 60 seconds and 120 requests.
The app skips rate limiting when `TRUST_PROXY=true`, because that setting means
requests arrive through a trusted service that owns rate limiting. Do not expose the app directly
when this mode is enabled. `/health` is exempt for health probes. The built-in memory store is for
a single app process; use a shared store when running multiple instances.

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
- Sample (versioned + API key protected): `GET {API_PREFIX}/sample`, defaulting to `/api/v1/sample`

Example requests:

```bash
curl http://localhost:9000/health

curl "http://localhost:9000/api/v1/sample?name=Oscar" \
  -H "x-api-key: your-local-api-key"
```

To exercise identity locally, set `TRUST_IDENTITY_HEADER=true` and send a JSON
`x-authenticated-user` header. Do not trust this header outside a controlled gateway.

## Architecture

### Feature Layers
Features separate HTTP concerns from domain logic. Add a data-access adapter when a feature needs persistence:

- **Controllers** handle HTTP requests and delegate to use cases
- **Use cases** orchestrate application logic and receive dependencies through function composition
- **Services** contain reusable business logic
- **DTOs** provide type-safe data transfer and validation
- **Data access** manages persistence when required by a feature

### Request Flow
HTTP request → Route → Controller → Use case → Domain logic → Response

When persistence is needed, the use case also calls a data-access adapter.

### Middleware Stack
1. **Request Context** - Extracts `code` (request ID) and, when enabled, trusted gateway identity
2. **Request Logging** - Logs method, route, status, duration and request code after each response
3. **Express Security** - CORS and Helmet security
4. **Rate Limiting** - Per-IP limit when `TRUST_PROXY=false`, except `/health`
5. **Body Parsing** - JSON and URL-encoded body size limits
6. **API Key Validation** - Applied per-route to protected endpoints
7. **Not Found and Error Handling** - Returns structured `404` and safe `500` responses

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

## AI agent: caveman mode

To make the agent use the caveman skill, say one of:

- "caveman mode"
- "talk like caveman"

If it does not load, say "use the caveman skill" explicitly. To turn it off, say "stop caveman" or "normal mode".

## Project Structure

Features in `src/features/` use separate presentation and domain layers. A data-access layer is added when persistence is required:

1. **HTTP Presentation** — Routes and controllers
2. **Domain** — Business logic (usecases, services, DTOs)
3. **Data Access** — Optional repository and persistence adapters

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
