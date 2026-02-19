# Stability Assessment — Areas Checked

Legend: ✅ clean | 🐛 bug(s) found | ⚠️ design footgun | ❓ not yet investigated

---

## State & Lifecycle

- ✅ `ngOnDestroy` / teardown completeness — comprehensive, no leaks
- ❓ State machine transitions (uninitialized → initializing → ready → transitioning)
- ❓ `submitting` signal — concurrent submit, error during submit, re-submit while pending
- ❓ Form reset (`FORM_RESET`) — state after reset, validators re-run, dirty/touched cleared
- ❓ Form clear (`FORM_CLEAR`) — vs. reset, empty vs. initial values
- ❓ Dirty/touched propagation — parent reflects children accurately

## Field Resolution

- ❓ `resolveField` async pipeline — component lazy-load failure behavior
- ❓ `reconcileFields` identity preservation — spurious re-renders if keys shuffle
- ❓ `COMPONENT_CACHE` scoping — shared across form instances on same page?

## Derivations

- 🐛 `explicitEffect` dependency arrays — **see issues-found.md**
- 🐛 `totalComponentsCount` for nested arrays — **see issues-found.md**
- 🐛 Cross-field validators read pre-derivation values — **see issues-found.md**
- ❓ Derivation cycle detection — max iteration truncation, warning quality
- ❓ HTTP derivation — cancellation on rapid signal changes (debounce/switchMap)
- ❓ Async derivation race conditions — two in-flight streams, which wins?
- ❓ Derivation dependency sort — diamond dependency graphs
- ❓ `derivedFrom` deferred teardown timing — destroy before first emission

## Conditions & Expressions

- ❓ Expression sandbox security — `security.spec.ts` exists, scope to confirm
- 🐛 `provideHttpClient` missing for HTTP conditions — **see issues-found.md**
- ❓ Async condition functions — race conditions, cancellation
- ❓ Condition evaluated against stale field state
- ❓ Logic function cache — keyed correctly, no cross-form pollution

## Validators

- 🐛 Async Zod refinements — **see issues-found.md**
- ❓ Async HTTP validators — cancellation, race conditions, `provideHttpClient` missing
- ❓ Built-in validators — edge case inputs (null, undefined, empty string, 0)
- ❓ Validator ordering — async vs. sync execution order guarantees
- 🐛 Cross-field validators timing — **see issues-found.md** (same as derivation staleness)

## Array / Group / Row / Page Fields

- 🐛 Nested arrays / `totalComponentsCount` — **see issues-found.md**
- ⚠️ `addItem`/`removeItem` boundary conditions — reactive enforcement (design, not bug)
- ❓ Array insert at index — bounds check, negative index
- ❓ `minLength`/`maxLength` on array — error message routing, `valid()` signal
- 🐛 Group field `explicitEffect` — **see issues-found.md**
- ❓ Row field grid class derivations — dynamic class binding correctness
- ❓ Page field navigation — validation gate before page advance, back-nav preserves values
- ❓ Multi-page dirty/valid state — page 1 signal independent of page 2?

## Schema / Zod / Standard Schema

- 🐛 `formLevelSchema` async refinements — **see issues-found.md**
- ❓ `formLevelSchema` with field-level schema — merge conflict behavior
- ❓ Valibot / ArkType schemas — same async issues?
- ❓ Schema registry — multiple schemas for same path, which wins?

## Field Keys & Config

- 🐛 Duplicate field keys — **see issues-found.md**
- ⚠️ Dynamic field config patch — no patch API, full replacement only (design)
- ❓ Key with dots/slashes — path resolution ambiguity
- ❓ Empty key string — behavior at path resolution

## HTTP Support

- 🐛 `provideHttpClient` missing — **see issues-found.md**
- ❓ HTTP response caching — invalidation strategy, stale responses
- ❓ HTTP request parameter interpolation — missing param behavior
- ❓ HTTP error responses — network error vs. 4xx/5xx, retry behavior

## Disabled Fields

- ❓ Disabled field value — included or excluded from `form.value()`?
- ❓ Dynamically re-enabling — validators re-run? dirty state preserved?
- ❓ Disabled array item vs. disabled array field — different behavior?

## SSR

- ❓ No module-scope singletons — confirm `COMPONENT_CACHE` not global
- ❓ Deferred observables on SSR — `derivedFromDeferred` with no browser APIs
- ❓ `SideEffectScheduler` using `requestAnimationFrame` — SSR-safe guard?

## DI / Providers

- ❓ Missing `provideDynamicForm()` entirely — error quality
- ❓ Two `provideDynamicForm()` calls on same page — isolation or conflict?
- ❓ Feature token ordering — `withFeature` registration order matters?

## Type System

- ❓ `InferFormValue` with deeply nested arrays — type inference correctness
- ❓ `createField()` helper — type safety of `value` vs. inferred field type

## Error Display

- ❓ `shouldShowErrors` — correct gating on touched/dirty/submitted
- ❓ Error message customization — adapter override vs. core default priority

## Events & Event Bus

- ❓ `FORM_SUBMIT` with validation failure — event fired or swallowed?
- ❓ Array events on destroyed component — event bus leak after teardown?

## MCP Server

- ❓ Registry sync with actual library APIs — spot-check field types and validators
