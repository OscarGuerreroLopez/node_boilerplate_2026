# Agent Instructions Index

This folder contains instructions for agents working on this repository.

- [Clean Architecture](./architecture/clean-architecture.md) - Feature structure, layers, DI, testing checklist.
- [JavaScript Style (MDN)](./style/javascript-mdn-style.md) - MDN-aligned JS/TS style rules.

## Quick Rules
- Read AGENTS.md and existing code (especially `src/features/sample/`) before changing.
- Follow three-layer feature structure.
- Use path aliases and existing patterns.
- Run `pnpm typecheck && pnpm lint && pnpm test` before considering done.
- Don't commit secrets; follow Conventional Commits.
- Never commit or push unless the user explicitly asks for it.
- Never push to main.
