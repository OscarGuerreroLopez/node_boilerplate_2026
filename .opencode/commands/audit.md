---
description: Audit the project for bugs, security risks, performance issues, and quality gaps
agent: plan
---

Audit this project and report findings. Stay read-only: do not edit files, install
packages, or change configuration.

Scope: `$ARGUMENTS`. When empty, audit the whole project. When it names a path,
feature, or concern (for example `src/common` or `security`), restrict the review
to that area.

## 1. Load guidance

Use the skill tool to load:

- `nodejs-backend-patterns` for Express middleware, error handling, auth,
  logging, security, and performance expectations.
- `typescript-pro` for type safety, tsconfig, and build concerns.
- `typescript-advanced-types` only when the findings involve generics, unions,
  or type-level design.
- `pnpm` for dependency and script commands.

Do not load `analyze-project`; it targets deep learning repositories.

## 2. Establish a baseline

Run these and record the exact outcome of each:

```bash
pnpm typecheck
pnpm lint
pnpm prettier-check
pnpm test:coverage
pnpm build
pnpm audit --prod
pnpm outdated
```

If a command needs the network and cannot run, say so instead of guessing.
Never run `pnpm audit --fix`, `pnpm install`, `pnpm update`, or any mutating
command.

## 3. Review the code

Read the actual source before making a claim. Cover these areas:

Security: secret and env handling, API key comparison, CORS and Helmet
configuration, body size limits, trust proxy, error responses leaking stack
traces or internals, log sanitization of credentials and PII, input validation
at HTTP boundaries, path or header trust issues, rate limiting, graceful
shutdown, and dependency vulnerabilities from `pnpm audit`.

Performance: synchronous or blocking calls on the request path, event-loop
stalls, middleware order and redundant work, body parser cost, logging overhead,
unbounded payloads or loops, missing compression or caching where it matters,
and connection pooling or N+1 risks once a database is added.

Code quality: layer boundaries between `http-presentation`, `domain`, and
`data-access`, DTO validation, typed errors, use of `any`, duplicated logic,
dead code, magic numbers, naming, explicit return types, test coverage gaps, and
consistency with the sample feature and the docs in `docs/`.

Maintainability: config shape, scripts, CI alignment with `pnpm check-code`,
dependency freshness, and contradictions between `AGENTS.md`, `README.md`, and
the implementation.

Rules:

- Cite every finding as `path:line`.
- Mark anything unverified as an open question, not a finding.
- Prefer a few real issues over a long list of style nitpicks.
- Do not report something already handled elsewhere without checking.

## 4. Report

Use H2 headings and this order:

## Verdict
Two or three sentences: overall health and the top risks.

## Baseline
One line per command: pass or fail, plus the key number (coverage, CVE count,
outdated packages).

## Findings
Group by severity: Critical, High, Medium, Low. For each finding include:

- ID and short title
- Area: security, performance, quality, or maintainability
- Location: `path:line`
- Evidence: what the code does
- Impact: what can go wrong
- Recommendation: the concrete change
- Effort: small, medium, or large

## Quick wins
Small, low-risk changes worth doing first.

## Larger work
Changes that need design or follow-up tasks.

Do not apply fixes in this command. End by offering to turn selected findings
into a follow-up implementation plan.
