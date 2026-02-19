# Area 07 — Conditions & Expressions

## Key Files

- `packages/dynamic-forms/src/lib/core/expressions/expression-parser.ts`
- `packages/dynamic-forms/src/lib/core/expressions/expression-evaluator.ts`
- `packages/dynamic-forms/src/lib/core/expressions/http-condition-logic-function.ts`
- `packages/dynamic-forms/src/lib/core/expressions/custom-logic-function.ts`
- `packages/dynamic-forms/src/lib/core/expressions/parser/` (subdirectory)
- `packages/dynamic-forms/src/lib/core/expressions/` (all 16 files)
- `packages/dynamic-forms/src/lib/core/derivation/field-state-extractor.ts`

## Scenarios to Check

- [ ] Expression sandbox security — three-layer defense: syntax restriction, blocked property set, method whitelist, scope isolation
- [ ] `provideHttpClient` missing for HTTP conditions — `inject(HttpClient)` without `{ optional: true }`
- [ ] Async condition functions — race conditions, cancellation
- [ ] Condition evaluated against stale field state — timing with derivation pipeline
- [ ] Logic function cache — keyed correctly? No cross-form pollution?
- [ ] `formFieldState` Proxy — unknown field keys return undefined, chained access throws silent TypeError
- [ ] `formFieldState` dot-path notation — `formFieldState['address.street']` works, but `formFieldState['address']['street']` does NOT
- [ ] Expression with `Math` functions — not in scope, blocked by whitelist
- [ ] Expression with undefined variables — error handling, fallback behavior
- [ ] HTTP condition caching — `stableStringify` called multiple times per condition per change
- [ ] Module-scoped AST cache (`astCache`) — SSR safety violation
- [ ] Custom logic functions — registration, execution context, error handling
- [ ] Expression evaluation context — what variables are available? `formValue`, `rootFormValue`, `formFieldState`, `externalData`?

## Known Findings

- **B41** (high) — `inject(HttpClient)` without `{ optional: true }` in HTTP condition logic
- **B18** (medium) — Module-scoped AST cache violates SSR safety contract
- **B32** (low) — `formFieldState.nonExistentField.hidden` throws silent TypeError; zero feedback on typos
- **P3** (medium) — New Proxy + Map created on every expression evaluation
- **P5** (medium) — `stableStringify` called 3–5 times per HTTP condition per form value change
- Security surface confirmed clean.
