# node-boilerplate-2026-single-app

TypeScript + Express single-app boilerplate to start backend projects quickly without Nx workspaces/monorepos.

This version includes:
- `pnpm` as package manager
- health endpoint
- sample feature (`GET` endpoint)
- sample `service` + `usecase` architecture
- Jest coverage enabled by default
- lint, typecheck, prettier, build, and CI workflows

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
pnpm run dev:sample
```

Build:

```bash
pnpm run build:sample
```

Start compiled app:

```bash
pnpm run start:sample
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

## Quality scripts

- `pnpm lint`
- `pnpm test`
- `pnpm test:coverage`
- `pnpm typecheck`
- `pnpm prettier-check`
- `pnpm check-code`

## Versioning

- `pnpm version:patch`
- `pnpm version:minor`
- `pnpm version:major`

## Project structure

## Root structure

```text
src/
  app.ts
  app.test.ts
  types/
    express-augment.d.ts
  index.ts
  start-server.ts
  common/
    constants/
    context/
    middlewares/
    types/
    utils/
  core/
    config/
    logger/
  features/
    health/
      presentation/
    sample/
      data-access/
      domain/
        dtos/
        services/
        usecases/
      http-presentation/
  versions/
    v1/
```
