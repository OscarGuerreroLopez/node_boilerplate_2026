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
│   ├── middlewares/          # Essentials, API key, request context and logging
│   ├── types/                # Shared types, such as environment and user
│   └── utils/                # Shared helpers and their tests
├── core/
│   ├── config/               # Environment configuration
│   └── logger/               # Logger implementations and types
├── features/
│   ├── health/
│   │   └── http-presentation/ # Health routes and controller
│   └── sample/
│       ├── data-access/      # Repositories and adapters
│       ├── domain/
│       │   ├── dtos/
│       │   ├── services/
│       │   └── usecases/
│       ├── http-presentation/ # Routes and controller
│       └── composition.ts    # Dependency wiring
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
- Application-wide middleware starts with request context and request logging, then Express essentials such as body parsing limits, security headers and CORS.
- Apply route-level API-key validation according to the existing middleware patterns.
- Request body limits are configured once for JSON and URL-encoded parsers through `MAX_JSON_BODY_SIZE`.
- Follow the established request-context conventions for accessing `req.user`, `req.code` and other request-scoped data.
- Identity is read only from `x-authenticated-user` and only when `TRUST_IDENTITY_HEADER=true` and `TRUST_PROXY=true`. Enable it only behind a trusted gateway that strips client-supplied identity headers. Only `id`, `email`, `name`, and `role` are retained. The legacy `user` header is ignored.
- Use `createLogger` from `@core/logger` where appropriate.
- Preserve existing error-handling conventions unless a change is explicitly required.

## TypeScript and imports

- Path aliases are defined in `tsconfig.base.json`: `@common/*`, `@core/*`, `@features/*` and `@versions/*`.
- Jest mappings must remain consistent with TypeScript path aliases.
- Inspect `tsconfig.json`, `tsconfig.build.json` and `jest.config.ts` before changing compilation, aliases or test configuration.
- Prefer explicit types and the existing project conventions over `any`.
- Prefer functional programming over OOP. Favor pure functions, immutability, composition, and function-based modules over classes where practical. Use classes only when they provide clear, necessary benefits (e.g., framework integration, specific patterns).

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
- Never commit or push changes unless the user explicitly asks for it. Do not proactively run `git commit`, `git push`, or create pull requests.
- If repository behavior contradicts this document, verify the implementation and update this guidance when appropriate.

## Skill routing

- Before planning or changing files, check whether an available skill matches the task. Load the most specific matching skill with the skill-loading tool.
- Treat skill instructions as additional guidance. Higher-priority instructions and this repository's requirements still apply.
- Load a skill for its defined task, not merely because the task contains a related keyword. Do not load multiple skills unless the task has distinct parts that need them.
- Use `nodejs-backend-patterns` for Express API, middleware, authentication, error-handling or backend feature work.
- Use `security-review` when the user asks for a security review, vulnerability audit, or to find security issues. Report only high-confidence exploitable findings, and research the codebase to verify input sources and existing protections.
- Use `security-best-practices` for security guidance or secure-by-default coding. For this Express/TypeScript app, read `.agents/skills/security-best-practices/references/javascript-express-web-server-security.md`. Do not trigger it for general code review, debugging or routine implementation.
- Use `pnpm` for dependency changes, lockfile updates, pnpm configuration or pnpm-specific package management.
- Use `typescript-advanced-types` for complex generics, conditional or mapped types, template-literal types or reusable type utilities.
- Use `typescript-pro` for broader advanced TypeScript work, such as custom type guards, branded types or end-to-end type safety. Prefer `typescript-advanced-types` when the task is specifically about complex type logic.
- Use `analyze-project` for read-only repository exploration or audits. Do not use it for implementation or code changes.
- Use `git-commit` only when the user explicitly asks to create a commit. Repository rules still prohibit pushing unless explicitly requested.
- Use `customize-opencode` only when changing OpenCode configuration, skills, agents, plugins, MCP servers or permissions. Do not use it for application code.
- Use Tavily skills only when the user explicitly requests Tavily. Otherwise, follow the web-search instructions from higher-priority guidance.
- If no available skill fits, follow this file without loading a skill. Do not claim a skill was used unless it was loaded.
