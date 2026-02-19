# Area 15 — HTTP Support

## Key Files

- `packages/dynamic-forms/src/lib/core/http/http-request-resolver.ts`
- `packages/dynamic-forms/src/lib/core/http/` (all 7 files)
- `packages/dynamic-forms/src/lib/core/derivation/http-derivation-stream.ts`
- `packages/dynamic-forms/src/lib/core/expressions/http-condition-logic-function.ts`
- `packages/dynamic-forms/src/lib/models/http/`

## Scenarios to Check

- [ ] URL template parameter interpolation — missing param behavior (undefined → empty string)
- [ ] URL template with typo in field key — fires request to wrong endpoint
- [ ] Body expression evaluation — shallow only; nested objects not evaluated
- [ ] Method default — `GET` when omitted; GET with body is non-standard
- [ ] HTTP response caching — invalidation strategy, stale responses
- [ ] HTTP error responses — network error vs 4xx/5xx, retry behavior
- [ ] HTTP request cancellation — on rapid signal changes, on config swap
- [ ] `provideHttpClient` missing — different error quality in derivations vs conditions
- [ ] HTTP condition response handling — caching, distinctUntilChanged, stableStringify overhead
- [ ] HTTP derivation with `switchMap` — in-flight request cancellation correctness
- [ ] Request parameter interpolation — query params, headers, all expression-aware?
- [ ] HTTP timeout — is there a configurable timeout? What's the default?

## Known Findings

- **B4** (critical) — HTTP derivation race on config hot-swap; in-flight response lands on new config
- **B13** (medium) — HTTP body `evaluateBodyExpressions` evaluates shallow only; nested objects sent as literals
- **B14** (medium) — URL template fires with empty segment when field is undefined
- **B19** (low) — HTTP derivation silently sends GET with body when method omitted
- **B41** (high) — `inject(HttpClient)` without `{ optional: true }` in HTTP condition logic
- **P5** (medium) — `stableStringify` called 3–5x per HTTP condition per form value change
