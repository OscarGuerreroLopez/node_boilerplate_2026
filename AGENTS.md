# AGENTS.md

## Project overview

- Single TypeScript/Express application; not an Nx or pnpm workspace.
- Node.js version is pinned in `.nvmrc` (`v22.13.0`).
- Package manager: pnpm `11.3.0`, as specified by `package.json`.
- Application entry point: `src/index.ts` → `src/app.ts`.
- Compiled output: `dist/`. Production entry point: `dist/src/index.js`.
- Read the actual source files before changing behavior or relying on assumptions documented here.

## Project structure

```text
src/
├── index.ts                  # Application bootstrap
├── start-server.ts           # HTTP server startup
├── app.ts                    # Express app and global middleware
├── app.test.ts               # App-level tests
├── common/
│   ├── constants/            # Shared constants, such as HTTP status codes
│   ├── context/              # Request-context helpers
│   ├── middlewares/          # Essentials, API key, request context and size limits
│   ├── types/                # Shared types, such as environment and user
│   └── utils/                # Shared helpers and their tests
├── core/
│   ├── config/               # Environment configuration
│   └── logger/               # Logger implementations and types
├── features/
│   ├── index.ts              # Feature exports
│   ├── health/
│   │   └── http-presentation/ # Health routes and controller
│   └── sample/
│       ├── data-access/      # Repositories and persistence
│       ├── domain/
│       │   ├── dtos/
│       │   ├── services/
│       │   └── usecases/
│       └── http-presentation/ # Routes and controller
├── types/
│   └── express-augment.d.ts  # Express request augmentation
└── versions/
    ├── index.ts
    └── v1/
        ├── index.ts
        └── routes.ts         # /api/v1 route registration
```

## Setup and environment

```bash
nvm install
nvm use
corepack enable
corepack prepare pnpm@11.3.0 --activate
pnpm install
```

- Environment configuration is defined in `src/core/config/env.ts`.
- Check `.env.template`, the environment configuration and current tests before changing environment variable names, defaults or validation.
- Do not assume a variable is required merely because it appears in an example, or optional merely because an example omits it.
- CI sets `NODE_ENV=test` and `API_KEY=test-api-key`.

## Application structure

- `src/index.ts` initializes the application.
- `src/app.ts` configures Express and application-wide middleware.
- Register versioned endpoints in `src/versions/v1/routes.ts`.
- `/health` and other health endpoints: verify the current implementation before relying on their paths or behavior.
- `src/features/sample/` is the reference implementation for new features.

### Feature architecture

Follow the existing three-layer feature structure:

- `http-presentation/`: routes, controllers and HTTP-specific concerns.
- `domain/`: DTOs, services and use cases.
- `data-access/`: repositories and persistence-related concerns.

Use the sample feature as the source of truth for naming, dependency injection, error handling and testing conventions.

New versioned feature routes must be exported and registered in the appropriate version's routes file.

### Middleware and request context

- Follow the middleware ordering established in `src/app.ts`.
- Application-wide middleware includes Express essentials, such as security headers, CORS and JSON parsing, followed by request-context middleware.
- Apply route-level API-key validation and request-size limits according to the existing middleware patterns.
- Follow the established request-context conventions for accessing `req.user`, `req.code` and other request-scoped data.
- Use `createLogger` from `@core/logger` where appropriate.
- Preserve existing error-handling conventions unless a change is explicitly required.

## TypeScript and imports

- Path aliases are defined in `tsconfig.base.json`: `@common/*`, `@core/*`, `@features/*` and `@versions/*`.
- Jest mappings must remain consistent with TypeScript path aliases.
- Inspect `tsconfig.json`, `tsconfig.build.json` and `jest.config.ts` before changing compilation, aliases or test configuration.
- Prefer explicit types and the existing project conventions over `any`.

## Commands

```bash
pnpm dev
pnpm build
pnpm start

pnpm check-code

pnpm typecheck
pnpm lint
pnpm lint-and-fix
pnpm prettier-check
pnpm prettier-format
pnpm test
pnpm test:watch
pnpm test:coverage
```

- `pnpm check-code` runs the full verification sequence: typecheck, lint, Prettier check, tests and build.
- Run a specific Jest test with:

```bash
pnpm test -- src/path/to/file.test.ts
```

- Development uses `ts-node-dev` and `tsconfig-paths/register`.
- The build clears `dist`, compiles TypeScript and rewrites aliases with `tsc-alias`.
- Production startup expects `dist/src/index.js`.
- Verify package scripts before assuming a command's behavior.

## Testing and CI

- Jest with `ts-jest` is used for tests.
- Coverage is collected by default; `dist/` is excluded from test discovery.
- CI configuration is in `.github/workflows/ci.yml`.
- CI installs dependencies with `pnpm install --frozen-lockfile` and runs `pnpm check-code`.
- Add or update tests when changing application behavior.
- Prefer focused tests during development, followed by `pnpm check-code` before considering a change complete.

## Working conventions

- Inspect the relevant implementation and tests before modifying code.
- Keep changes focused and consistent with established feature patterns.
- Do not introduce new architectural abstractions or dependencies without a clear need.
- Do not modify generated `dist/` files directly.
- Do not claim checks passed unless they were actually run and succeeded.
- If repository behavior contradicts this document, verify the implementation and update this guidance when appropriate.
