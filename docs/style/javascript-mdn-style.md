# JavaScript Style Guide (MDN-aligned)

This guide summarizes MDN's JavaScript code style guidelines and adapts them to this TypeScript/Node/Express codebase. Use Prettier as the formatter; follow these rules for consistency.

## General
- Use Prettier (config in repo). Avoid off-topic style debates.
- Use modern JavaScript/TypeScript features when supported (Baseline). Don't use experimental features in unrelated examples.
- Prefer clarity over cleverness.

## Arrays
- Create with literals: `const arr = []` not `new Array()`.
- Add with `push()` not `arr[arr.length] = value`.

## Async
- Prefer `async/await` over raw Promises when possible.
- Avoid top-level `await` in CommonJS contexts unless necessary.

## Comments
- Use single-line `//` comments. Space after `//`, sentence case, no trailing period.
- Comment intent, not obvious code. Put comments on separate lines before code.
- For logs in examples, put expected output after: `console.log(x); // [...]`
- Use `/* ... */` only for commenting out parameters.
- Mark ellipsis with comment: `// ...`
- Don't use multi-line `/* ... */` blocks.

## Functions
- Use function declarations `function foo() {}` over `const foo = function() {}` when possible.
- Use arrow functions for short callbacks if no `this` needed.
- Avoid arrow functions to assign named functions; use declarations.
- Use implicit return for simple arrow functions: `arr.map(e => e.id)`.
- CamelCase names, concise and semantic.

## Loops and Conditionals
- Prefer `for...of` or `forEach()` over classic `for` loops.
- Initialize with `const`/`let`.
- Don't use `for...in` for arrays/strings.
- Prefer array methods (`map`, `every`, `find`, `includes`, etc.) when semantic.
- If `if` returns, don't use `else`.
- Always use braces for control flow/loops.
- In `switch`, return directly (no break after return). Use `default` last. Scope case variables with braces.
- Use `try/catch`; omit catch param if unused.

## Objects
- Use literals `{}` not `new Object()`.
- Classes: PascalCase class, camelCase methods/properties. Use `extends`.
- Object instances: camelCase.
- Method shorthand: `{ foo() {} }` not `{ foo: function() {} }`.
- Prefer shorthand properties `{ name }`.
- Use `Object.hasOwn()` over `hasOwnProperty()`.

## Operators
- Use ternary for simple assignments/returns: `const x = cond ? 1 : 2`.
- Use strict equality `===`/`!==`. Only `== null` is acceptable with comment if needed.
- Use boolean shortcuts `if (x)`/`if (!x)`, not `=== true/false`.

## Strings
- Quotes: consistent via Prettier (single/double both fine).
- Use template literals for interpolation.
- Don't use template literals when no substitution.

## Variables
- Use `const` by default, `let` if reassigned, never `var`.
- CamelCase, short but semantic, no Hungarian notation, no type suffixes.
- Plural for collections, no articles/possessives unless necessary.
- One declaration per line.
- Avoid implicit coercion: use `Number()`, `String()` not `+val`, `"" + val`.

## Web APIs
- Avoid browser prefixes if supported everywhere.
- Avoid deprecated APIs (`XMLHttpRequest` → `fetch()`, `ScriptProcessorNode` → `AudioWorklet`).
- Use `textContent` not `innerHTML` for text.
- Avoid `alert()` in examples; use `console.log/error` or UI.
- Log with `console.log()`, errors with `console.error()`.

## TypeScript Notes (repo-specific)
- Use explicit types; avoid `any`.
- Follow path aliases (`@common/*`, `@core/*`, `@features/*`, `@versions/*`).
- Prefer interfaces/types over enums where possible.
- Keep types in `common/types` or feature `domain/dtos`.
