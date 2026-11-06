# JavaScript Style Guide (MDN-aligned)

This guide summarizes MDN's JavaScript code style guidelines and adapts them to this TypeScript/Node/Express codebase. Use Prettier as the formatter; follow these rules for consistency.

This document also incorporates principles from [W3C JavaScript Best Practices](https://www.w3.org/wiki/JavaScript_best_practices).

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
- Only comment things that have business logic complexity.
- Don't leave commented out code in the codebase.
- Don't write journal comments; use git history.

## Functions
- Use function declarations `function foo() {}` over `const foo = function() {}` when possible.
- Use arrow functions for short callbacks if no `this` needed.
- Avoid arrow functions to assign named functions; use declarations.
- Use implicit return for simple arrow functions: `arr.map(e => e.id)`.
- CamelCase names, concise and semantic.
- Functions should be small and do one thing.
- Limit function arguments (ideally 0-2). Use objects for multiple parameters.
- Avoid side effects; prefer pure functions when possible.
- Don't use flags as function parameters.
- Write short functions that are easy to test and understand.

## Loops and Conditionals
- Prefer `for...of` or `forEach()` over classic `for` loops.
- Initialize with `const`/`let`.
- Don't use `for...in` for arrays/strings.
- Prefer array methods (`map`, `every`, `find`, `includes`, etc.) when semantic.
- If `if` returns, don't use `else`.
- Always use braces for control flow/loops.
- In `switch`, return directly (no break after return). Use `default` last. Scope case variables with braces.
- Use `try/catch`; omit catch param if unused.
- Avoid negative conditionals.
- Use conditionals that are explicit and readable.

## Objects
- Use literals `{}` not `new Object()`.
- Classes: PascalCase class, camelCase methods/properties. Use `extends`.
- Object instances: camelCase.
- Method shorthand: `{ foo() {} }` not `{ foo: function() {} }`.
- Prefer shorthand properties `{ name }`.
- Use `Object.hasOwn()` over `hasOwnProperty()`.
- Use getters and setters when appropriate to encapsulate logic.
- Make objects have private members when possible.
- Prefer objects over primitives when you need to pass around and behave.

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
- Use meaningful and pronounceable names.
- Use searchable names.
- Avoid mental mapping.
- Don't add unneeded context.
- Use default arguments instead of short-circuiting or conditionals.

## Web APIs
- Avoid browser prefixes if supported everywhere.
- Avoid deprecated APIs (`XMLHttpRequest` → `fetch()`, `ScriptProcessorNode` → `AudioWorklet`).
- Use `textContent` not `innerHTML` for text.
- Avoid `alert()` in examples; use `console.log/error` or UI.
- Log with `console.log()`, errors with `console.error()`.

## Naming and Globals
- Use clear, short, readable names. Avoid single-letter or cryptic names.
- Avoid global variables/functions. Use module patterns (IIFEs, modules) or namespacing to encapsulate scope.
- Prefer Hungarian notation only if it adds clarity; prioritize readability and English names.

## Architecture and Maintainability
- Modularize: one function per task. Extract helpers for repeated logic.
- Keep functions small and focused with one entry/exit path where sensible.
- Avoid heavy nesting. Extract inner loops/logic into separate functions.
- Enhance progressively: ensure core functionality works without JS; add JS as enhancement.
- Plan for configuration and translation via config objects, not hardcoded strings/CSS/IDs.

## Performance
- Optimize loops: cache array length (`for (let i = 0, len = arr.length; i < len; i++)`).
- Move expensive computations (regex, DOM queries) outside loops.
- Keep DOM access to a minimum. Batch DOM updates and build nodes before inserting.

## Security and Robustness
- Don't trust any data. Validate and sanitize inputs; check types.
- Verify DOM elements exist before manipulating them.
- Avoid mixing concerns: keep styles in CSS, content in HTML/templates, behavior in JS/TS.
- Don't create excessive content via JS; prefer templates/partials loaded as needed.
- Don't rely on browser-specific hacks without isolation/fallbacks.

## Tooling and Lifecycle
- Keep dev code separate from production. Use build/minification and stripping of comments/debug in builds.
- Use established libraries when appropriate, but avoid mixing multiple heavy frameworks.
- Follow strict coding style and linting (run `pnpm check-code` before completing changes).

## Additional Best Practices (Airbnb-aligned)
- **References**: Use `const` by default, `let` if reassigned, never `var`. Both block-scoped.
- **Objects/Arrays**: Use literal syntax. Prefer object/array spreads over `Object.assign()`/`Array.prototype` where appropriate.
- **Strings**: Use single quotes. Use template literals for interpolation.
- **Functions**: Prefer named function expressions or arrow functions as appropriate. Use rest parameters over `arguments`. Avoid mutating/reassigning parameters.
- **Modules**: Use ES modules (`import`/`export`). Put imports at top, one per import source when possible.
- **Classes**: Prefer `class` over prototype manipulation. Use `extends` for inheritance.
- **Destructuring**: Use object destructuring when accessing multiple properties; object destructuring for multiple return values.
- **Properties**: Use dot notation; bracket notation only with variables.
- **Equality**: Use `===`/`!==`. Avoid `eval()`. Don't use `== null` as a catch-all without justification.
- **Comments**: Use `/** ... */` for API docs when needed, `//` for inline; explain why, not what.
- **Whitespace/Style**: Follow the project's Prettier config. Consistency over preference.

## TypeScript Best Practices (AWS CDK-aligned)
- **Types over `any`**: Describe data with types/interfaces; avoid `any`.
- **Interfaces/contracts**: Use interfaces to define contracts; use `readonly` for immutable properties.
- **Extend interfaces**: Prefer extending interfaces over duplicating properties.
- **Avoid empty interfaces**: They don't enforce contracts and cause inconsistency.
- **Enums**: Use enums for named constants; export at global level for reuse.
- **Destructuring**: Use object/array destructuring for cleaner code.
- **Naming**: camelCase for vars/functions, PascalCase for classes/interfaces/types/enums, UPPER_CASE for constants, camelCase for files.
- **Access modifiers**: Use `public`/`private`/`protected` explicitly where intent matters.
- **Utility types**: Leverage `Partial<T>`, `Required<T>`, etc. when transforming types.
- **Factories**: Use factory patterns to decouple object creation.
- **Tooling**: Use ESLint and Prettier with project scripts for consistent style/linting.

## TypeScript Notes (repo-specific)
- Use explicit types; avoid `any`.
- Follow path aliases (`@common/*`, `@core/*`, `@features/*`, `@versions/*`).
- Prefer interfaces/types over enums where possible.
- Keep types in `common/types` or feature `domain/dtos`.
