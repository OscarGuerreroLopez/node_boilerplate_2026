# Clean Architecture Instructions for Agents

This document defines how to implement features in this Node/Express/TypeScript boilerplate following clean architecture principles, aligned with the existing codebase patterns.

## Core Principles

- Separation of concerns: domain logic independent of frameworks and infrastructure.
- Dependency rule: dependencies point inward (http-presentation → domain ← data-access; domain has no outward deps).
- Testability: domain and use cases are pure/testable without HTTP or DB.
- Explicit contracts: use DTOs, interfaces, and types.
- Fail fast with typed errors.

## Layer Responsibilities

### http-presentation/
- Routes, controllers, HTTP-specific validation/mapping.
- No business rules. Translate HTTP (req/res) to use case calls.
- Handle status codes, serialization, and middleware concerns.
- Located in `features/<name>/http-presentation/`.

### domain/
- DTOs: input/output shapes (`features/<name>/domain/dtos/`).
- Services: reusable domain logic that doesn't belong to a single use case.
- Use cases: orchestrate domain operations, enforce business rules, define transactions.
- No knowledge of Express, DB drivers, or HTTP.
- Located in `features/<name>/domain/`.

### data-access/
- Repositories: abstract data persistence, implement CRUD/query logic.
- Entities/mappers if needed to isolate persistence models from domain.
- No business rules; return domain-shaped data or throw data-specific errors.
- Located in `features/<name>/data-access/`.

## Feature Structure

Follow the sample feature exactly:

```text
src/features/<feature>/
├── data-access/
│   ├── <Feature>Repository.ts  (or index.ts)
│   └── index.ts
├── domain/
│   ├── dtos/
│   │   ├── <Action><Feature>.dto.ts
│   │   └── index.ts
│   ├── services/
│   │   └── <Feature>Service.ts
│   └── usecases/
│       └── <Action><Feature>.usecase.ts
└── http-presentation/
    ├── <Feature>Controller.ts
    └── <Feature>Routes.ts
```

## Implementation Guidelines

### DTOs
- Define request and response DTOs with explicit types.
- Use interfaces/types in `domain/dtos/`.
- Avoid leaking ORM/DB types to HTTP layer.
- Validate at boundaries (HTTP or use case as appropriate).

### Use Cases
- One use case per action (e.g., `GetSample.usecase.ts`).
- Inject dependencies via constructor (repository, services).
- Return plain domain objects/DTOs.
- Throw domain errors (define in common or feature as needed).
- Keep pure business logic.

### Repositories
- Define interface in domain or data-access as appropriate; follow sample.
- Implement concrete repository in data-access.
- Handle persistence details, mapping to domain shapes.
- Use dependency injection via factories/composition in routes/controllers.

### Controllers
- Thin: extract params/body/query, call use case, map to HTTP response.
- Use status codes from `@common/constants`.
- Delegate errors to error handling middleware.

### Routes
- Register routes under versioned paths in `src/versions/v1/routes.ts`.
- Apply middleware (API key, size limits) per route as needed.
- Export router and register in feature index if used.

## Dependency Injection
- Follow existing DI pattern from sample feature.
- Wire dependencies in route setup or feature composition.
- Avoid global singletons where testability suffers; use factories.
- Define interfaces/ports in domain; implement adapters in data-access/http-presentation.

## Error Handling
- Use typed errors and let global error handler format responses.
- Don't leak stack traces in production responses.
- Follow existing conventions in `src/app.ts` and common middlewares.
- Map domain/data errors to appropriate HTTP status codes in controllers/middlewares.

## Testing
- Unit test use cases and services with mocked repos.
- Integration test controllers/routes with supertest.
- Keep tests colocated or under feature with `.test.ts`.
- Follow Jest/ts-jest config.

## Checklist for New Features
1. Read `src/features/sample/*` to match style.
2. Create DTOs, use case, repository interface/impl, service (if needed), controller, routes.
3. Register routes in `src/versions/v1/routes.ts`.
4. Add types to `@common/types` if shared.
5. Write tests.
6. Run `pnpm typecheck && pnpm lint` and `pnpm test`.
7. Ensure no domain depends on external frameworks/libraries.

## Anti-patterns
- Putting DB queries in controllers/use cases directly.
- Mixing HTTP and domain logic.
- Returning ORM entities from use cases to controllers.
- Skipping DTOs and passing raw objects everywhere.
- Creating circular dependencies.
- Relying on globals or implicit cross-module state.
- Mutating inputs/parameters across layers.
- Putting framework/DB logic in domain.

## Additional Guidance (from industry best practices)
- **Explicit boundaries**: Validate at edges (HTTP/controllers), keep domain pure. Don't leak external types across boundaries.
- **Immutability**: Prefer immutable data where practical; avoid mutating objects/arrays passed between layers.
- **Single responsibility**: Each module/function does one thing. Extract helpers/services when logic is reused or complex.
- **Configuration**: Centralize config (env), inject where needed; avoid hardcoding values.
- **Error handling**: Use typed/domain errors, map to HTTP in presentation layer only.
- **Testing**: Favor unit tests for domain/use cases, integration for HTTP; keep tests deterministic.
- **Dependency inversion**: Domain defines interfaces (ports), data-access/http implement them (adapters). Inject dependencies.
- **Keep it simple**: Apply YAGNI; don't over-engineer. Follow the sample feature as source of truth.
- **Functional style**: Prefer pure functions in domain/use cases where possible; use classes only when necessary for DI/framework integration.
