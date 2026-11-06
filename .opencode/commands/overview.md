---
description: Explain what the project is about using the analyze-project skill
agent: plan
---

Explain what this project is about. Stay read-only: do not edit files, install
packages, or change configuration.

Scope: `$ARGUMENTS`. When empty, cover the whole project. When it names a path,
feature, or area, restrict the explanation to that part.

## 1. Load the skill

Use the skill tool to load `analyze-project`, then follow its read-only
operating principles. Treat its deep learning specifics as optional: apply the
parts that fit a TypeScript/Express application and ignore the rest.

## 2. Inspect the real source

Read the entry points, config, and feature code before making claims:

- `README.md`, `AGENTS.md`, `package.json`, `.nvmrc`, `.env.template`
- `src/index.ts`, `src/app.ts`, `src/versions/v1/routes.ts`
- `src/core/`, `src/common/`, and `src/features/`
- `docs/` for architecture and style guidance

Do not guess. If something is unclear from the code, say so as an open
question.

## 3. Report

Use H2 headings and this order:

## What it is
Two or three sentences on the project's purpose and who it serves.

## Stack
Language, runtime, framework, package manager, tests, and build output.

## How it is organized
The folder structure and the three-layer feature architecture, in a few lines.

## What it does today
The endpoints, features, and middleware that actually exist, with the main
request flow from entry point to response.

## How to run it
Setup, dev, test, build, and start commands, copied from the real scripts.

## Key files
A short list of the files a new contributor should read first, each cited as
`path:line`.

Keep it tight. Prefer concrete facts from the code over restating the docs.
Cite paths as `path:line` so the reader can jump to the source.
