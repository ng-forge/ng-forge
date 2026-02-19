# Area 21 — SSR Safety (Cross-Cutting)

## Key Files (scan all for module-scope mutable state)

- `packages/dynamic-forms/src/lib/core/expressions/parser/expression-parser.ts` (known: module-scope `astCache`)
- `packages/dynamic-forms/src/lib/utils/inject-field-registry/inject-field-registry.ts` (COMPONENT_CACHE)
- `packages/dynamic-forms/src/lib/utils/memoize.ts`
- `packages/dynamic-forms/src/lib/utils/derived-from-deferred/derived-from-deferred.ts`
- `packages/dynamic-forms/src/lib/state/side-effect-scheduler.ts` (requestAnimationFrame)
- All files in `packages/dynamic-forms/src/lib/` — grep for `const.*=.*new (Map|Set|WeakMap|LRU)` at module scope

## Scenarios to Check

- [ ] `astCache` (LRUCache at module scope) — shared across SSR requests; `clear()` nukes for all concurrent requests
- [ ] `COMPONENT_CACHE` — is it DI-scoped or module-scoped? Verify via injection token
- [ ] `memoize()` utility — does it cache at module scope or instance scope?
- [ ] Any other `const cache = new Map()` at file scope — grep entire library
- [ ] `requestAnimationFrame` usage in SideEffectScheduler — is there an SSR guard (`typeof window !== 'undefined'`)?
- [ ] `derivedFromDeferred` — uses `toObservable`/`toSignal`; safe on SSR?
- [ ] `document` or `window` access anywhere — grep for direct browser API usage
- [ ] `setTimeout`/`setInterval` at module scope — SSR timing issues

## Known Findings

- **B18** (medium) — Module-scoped AST cache (`astCache = new LRUCache`) violates SSR safety contract. Deterministic per expression (no behavioral contamination) but `clear()` is globally destructive.
- CLAUDE.md rule: "Never use module-scoped mutable state"
- `COMPONENT_CACHE` previously confirmed DI-scoped (per CLAUDE.md gotchas)
