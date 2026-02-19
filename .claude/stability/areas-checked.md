# Stability Assessment — Areas Checked

Legend: ✅ clean | 🐛 bug(s) found | ⚠️ design footgun | ❓ not yet investigated

---

## State & Lifecycle

- ✅ `ngOnDestroy` / teardown completeness — comprehensive, no leaks
- ❓ State machine transitions (uninitialized → initializing → ready → transitioning)
- 🐛 `submitting` signal — B7 (pending guard bypass), B29 (config hot-swap during submit), B30 (double-submit Promise race)
- 🐛 Form reset (`FORM_RESET`) — B10 (dirty flag not cleared), B10-ext (reset + stopOnUserOverride deadlock)
- 🐛 Form clear (`FORM_CLEAR`) — same as B10; dirty/touched flags survive clear()
- ❓ Dirty/touched propagation — parent reflects children accurately

## Field Resolution

- ❓ `resolveField` async pipeline — component lazy-load failure behavior
- ❓ `reconcileFields` identity preservation — spurious re-renders if keys shuffle
- ❓ `COMPONENT_CACHE` scoping — shared across form instances on same page?

## Derivations

- 🐛 `explicitEffect` dependency arrays — B36 (group-field stale key)
- 🐛 `totalComponentsCount` for nested arrays — B37 (premature `initialized`)
- 🐛 Cross-field validators read pre-derivation values — B39
- 🐛 Derivation dependency sort — B1 (double-indexing false edges, appliedDerivations not cleared between iterations)
- 🐛 HTTP derivation cancellation — B4 (in-flight response lands on new config after hot-swap)
- 🐛 Async derivation — B20 (non-iterable return crashes stream); notable: exhaustMap window can silently drop rapid-fire changes
- 🐛 `reEngageOnDependencyChange` inside arrays — B5/B17 (root-key vs relative-key mismatch; silently non-functional)
- 🐛 `externalData` signal reactivity — B11 (derivations use `untracked()`; conditions reactive, derivations not — asymmetric)
- ❓ `derivedFrom` deferred teardown timing — destroy before first emission

## Conditions & Expressions

- ✅ Expression sandbox security — three-layer defense (syntax restriction, blocked property set, method whitelist, scope isolation)
- 🐛 `provideHttpClient` missing for HTTP conditions — B41 (non-optional inject, raw NullInjectorError)
- ❓ Async condition functions — race conditions, cancellation
- ❓ Logic function cache — keyed correctly, no cross-form pollution
- ⚠️ `formFieldState` chained bracket access — `formFieldState['address']['street']` silently returns `undefined`; only dot-notation string key `formFieldState['address.street']` is supported (B32 adjacent)
- ⚠️ `Math` not in expression scope — `Math.max()`, `Math.min()`, etc. inaccessible from derivation/condition expressions

## Validators

- 🐛 Async Zod refinements — B40 (silently pass; `validateStandardSchema` sync-only)
- 🐛 Async validators hang — B9 (no timeout; form permanently stuck in pending)
- 🐛 Async validator cancellation on array item remove — B6 (no AbortController; transient invalid state)
- 🐛 Cross-field validators timing — B39 (no ordering guarantee vs derivation pass)
- ❓ Built-in validators — edge case inputs (null, undefined, empty string, 0)
- ❓ Validator ordering — async vs. sync execution order guarantees

## Array / Group / Row / Page Fields

- 🐛 Nested arrays / `totalComponentsCount` — B37
- ⚠️ `addItem`/`removeItem` boundary conditions — reactive enforcement (design, not bug)
- 🐛 `maxLength` not enforced pre-add — B27 (append beyond maxLength silently allowed)
- 🐛 Group field `explicitEffect` — B36
- ❓ Row field grid class derivations — dynamic class binding correctness
- 🐛 Page field navigation — B2 (nested fields not checked), B3 (programmatic bypass), B15 (hidden page strands user), B24 (direct index nav to hidden page)
- ✅ Back navigation preserves field state — by design

## Schema / Zod / Standard Schema

- 🐛 `formLevelSchema` async refinements — B40
- 🐛 Schema path mismatch — B31 (typo in Zod path silently discarded, no warning)
- ❓ `formLevelSchema` with field-level schema — merge conflict behavior
- ❓ Valibot / ArkType schemas — same async issues?
- ❓ Schema registry — multiple schemas for same path, which wins?

## Field Keys & Config

- 🐛 Duplicate field keys — B8/B38 (silent last-write-wins; validators dropped)
- ⚠️ Dynamic field config patch — no patch API, full replacement only (design)
- ❓ Key with dots/slashes — path resolution ambiguity
- ❓ Empty key string — behavior at path resolution

## HTTP Support

- 🐛 `provideHttpClient` missing — B41 (condition logic), B4 (hot-swap race)
- 🐛 HTTP body expression evaluation — B13 (shallow only; nested objects not evaluated)
- 🐛 HTTP URL template — B14 (undefined param → empty string segment; wrong endpoint)
- 🐛 HTTP GET with body — B19 (method omitted + body configured; non-standard, no warning)
- ❓ HTTP response caching — invalidation strategy, stale responses
- ❓ HTTP error responses — network error vs. 4xx/5xx, retry behavior

## Disabled Fields

- 🐛 `excludeValueIfDisabled: false` — B28 (broken no-op; Angular already strips disabled values upstream)
- 🐛 Property derivation `disabled` vs Angular form control `disabled` — B26 (independent systems; visual-only disable via property derivation)
- ✅ `excludeValueIfReadonly` — clean (both directions work; readonly not stripped by Angular)
- ❓ Dynamically re-enabling — validators re-run? dirty state preserved?
- ❓ Disabled array item vs. disabled array field — different behavior?

## SSR

- 🐛 Module-scope AST cache — B18 (`expression-parser.ts` LRUCache outside DI; violates SSR safety contract)
- ✅ Concurrent forms — every service component-scoped via `provideDynamicFormDI()`; zero shared mutable state
- ❓ Deferred observables on SSR — `derivedFromDeferred` with no browser APIs
- ❓ `SideEffectScheduler` using `requestAnimationFrame` — SSR-safe guard?

## DI / Providers

- ❓ Missing `provideDynamicForm()` entirely — error quality
- ❓ Two `provideDynamicForm()` calls on same page — isolation or conflict?
- ❓ Feature token ordering — `withFeature` registration order matters?

## Initialization & Lifecycle Events

- 🐛 `(initialized)` emits before derivation first cycle — B33 (orchestrators not yet injected when event fires)
- 🐛 Initialization hang on container throw — B35 (bare try-catch swallows error; no timeout on `filter(isComplete)`)
- ✅ Adapter field type collision — warning IS logged ("Field type 'x' is already registered. Overwriting."); intentional last-registered-wins

## Two-Way Binding & External Value Changes

- ✅ `[(value)]` two-way binding — correctly triggers derivations; `isEqual` guard prevents spurious re-runs

## Submission

- 🐛 `submission.action` pending-validator bypass + unhandled rejection — B7
- 🐛 Config hot-swap during submission — B29
- 🐛 Double-submit Promise race — B30

## Events & Event Bus

- 🐛 Event handler exceptions propagate uncaught — B16 (dispatch crashes component)
- 🐛 Subscriber exception crashes event pipeline — B25 (raw Subject; no isolation)

## Property Derivations

- 🐛 Property derivation `disabled` vs Angular control `disabled` — B26 (two independent systems)

## Type System

- ❓ `InferFormValue` with deeply nested arrays — type inference correctness
- ❓ `createField()` helper — type safety of `value` vs. inferred field type

## Error Display

- ❓ `shouldShowErrors` — correct gating on touched/dirty/submitted
- ❓ Error message customization — adapter override vs. core default priority

## MCP Server

- ❓ Registry sync with actual library APIs — spot-check field types and validators

## Accessibility

- ⚠️ No focus management anywhere — page navigation, submit, array add/remove produce zero programmatic focus moves; no `aria-live` regions; fully delegated to consuming apps with no guidance
