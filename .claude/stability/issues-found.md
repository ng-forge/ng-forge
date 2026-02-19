# Stability Assessment — Issues Found

Format: `ID | severity | file:line | description`

Severity scale: **critical** | **high** | **medium** | **low**

---

## Bugs

### B1 — Derivation sorter creates false dependency edges via array relative path double-indexing

- **Severity:** high
- **File:** `packages/dynamic-forms/src/lib/core/derivation/derivation-sorter.ts:47–66`
- **Description:** Entries targeting `items.$.lineTotal` are indexed twice — once under the full key `items.$.lineTotal`, and again under the bare relative segment `lineTotal`. If a root-level field is also named `lineTotal`, a dependency on `lineTotal` inadvertently pulls in the array derivation as a producer too, creating a false edge in the topological sort.
- **Confirmed extension:** `derivation-applicator.ts:154–176` — `appliedDerivations` is created once per `applyDerivations()` call and never cleared between `while` loop iterations. A derivation that runs in iteration 1 is permanently skipped in iterations 2 and 3, even if its dependencies changed from other derivations' outputs. Fix: `chainContext.appliedDerivations.clear()` at the top of the loop body (check/add sites: `:281,358,436,479`).
- **Risk:** Derivations run in wrong order when root field names collide with array item field names; multi-iteration derivation chains silently skip re-evaluation.

---

### B2 — `currentPageValid` only checks top-level fields; nested group/row fields invisible

- **Severity:** high
- **File:** `packages/dynamic-forms/src/lib/core/page-orchestrator/page-orchestrator.component.ts:182–212`
- **Description:** The computed iterates only `currentPage.fields` and calls `form[fieldKey].valid()`. Fields nested inside a group or row on that page are never traversed. Invalid fields inside a group or row do not prevent page advancement.
- **Risk:** Multi-page forms with groups/rows can advance past a page while carrying invalid nested fields.

---

### B3 — `navigateToNextPage()` has no validation guard; orchestrator can be bypassed programmatically

- **Severity:** high
- **File:** `packages/dynamic-forms/src/lib/core/page-orchestrator/page-orchestrator.component.ts:235–267`
- **Description:** The navigation method never calls `currentPageValid`. The UI button mapper checks it, but any programmatic caller of `navigateToNextPage()` skips validation entirely. Compounded by B2 even when the UI path is used.
- **Risk:** Programmatic navigation bypasses all page validation.

---

### B4 — Old HTTP derivation response can land on a new config's field after hot-swap

- **Severity:** critical
- **File:** `packages/dynamic-forms/src/lib/core/derivation/derivation-orchestrator.ts:321–384`
- **Description:** On config change, `teardownHttpStreams()` unsubscribes Angular subscriptions, but in-flight HTTP requests are already dispatched and can complete. The response handler reads `context.form()` fresh at completion time. If the new config retains the same field key with different semantics, the old response silently overwrites the new form's field value.
- **Risk:** Silent data corruption when configs are swapped mid-flight and share a field key.

---

### B5 — `reEngageOnDependencyChange` never fires for intra-array-item dependencies

- **Severity:** high
- **File:** `packages/dynamic-forms/src/lib/core/derivation/derivation-applicator.ts:645–664`
- **Description:** `changedFields` is populated with root-level keys (e.g., `lineItems`), but `entry.dependsOn` for array derivations contains relative names (e.g., `quantity`, `unitPrice`). The comparison is an exact string match, so relative dependencies never match. The feature combination `stopOnUserOverride: true` + `reEngageOnDependencyChange: true` is silently non-functional inside arrays. Acknowledged in a JSDoc comment but will surprise users.
- **Risk:** User overrides on derived array item fields are permanent; re-engagement never fires.

---

### B6 — No explicit async validator cancellation when an array item is removed

- **Severity:** high
- **File:** `packages/dynamic-forms/src/lib/fields/array/array-field.component.ts:614–630`
- **Description:** Item removal updates the resolved-items signal and splices the form value, but no `AbortController` or explicit unsubscribe exists for in-flight async validators for the removed item. Angular's scoped injector destruction is the only cleanup, which happens asynchronously. A validator response completing after removal may emit observable invalid state before the injector teardown completes.
- **Risk:** Transient invalid state after rapid remove operations with slow async validators.

---

### B7 — `submission.action` bypasses the pending-validator guard; unhandled Promise rejection

- **Severity:** high
- **File:** `packages/dynamic-forms/src/lib/state/form-state-manager.ts:682–706`; `packages/dynamic-forms/src/lib/utils/submission-handler/submission-handler.ts:39–51`
- **Description:** The `(submitted)` output stream has an explicit `filter(() => !this.valid())` guard — if async validators are pending, `valid()` is false and the event is swallowed. The `submission.action` path delegates directly to Angular's native `submit()` with no equivalent check. Additionally, the wrapped action awaits the result but Angular Signal Forms' `submit()` does not catch Promise rejections — a rejected Promise surfaces as an unhandled rejection at the runtime level.
- **Risk:** Two different safety contracts for the same user action; async submission errors are uncaught.

---

### B8 — Duplicate field keys silently accepted; last definition wins

- **Severity:** medium
- **File:** `packages/dynamic-forms/src/lib/utils/object-utils.ts:179–187`
- **Description:** `keyBy()` uses `reduce` with no deduplication check. A test explicitly documents the "last wins" behavior. A developer who accidentally declares the same key twice loses one field's validators, handlers, and logic with no signal. _(Also independently confirmed as B38 this session.)_

---

### B9 — Async validators that never resolve hang the form permanently

- **Severity:** high
- **File:** `packages/dynamic-forms/src/lib/core/validation/validator-factory.ts`
- **Description:** No timeout mechanism in the async validator pipeline. A custom async validator returning a Promise that never settles leaves `pending()` permanently `true`. The `(submitted)` output guard checks `valid()` which includes pending state — the form can never be submitted. No escape hatch unless the component is destroyed.

---

### B10 — `reset()` does not clear Angular's dirty flag; `stopOnUserOverride` remains engaged

- **Severity:** high
- **File:** `packages/dynamic-forms/src/lib/state/form-state-manager.ts:773–786`
- **Description:** `reset()` writes new values to the form's value signal but does not call Angular Signal Forms' `reset()` on the underlying form instance. The Angular dirty flag is not cleared. Fields with `stopOnUserOverride: true` still appear dirty to the derivation engine after reset — derivations don't re-run and stale manually-entered values persist.

---

### B11 — `externalData` signal changes do not trigger derivation re-evaluation

- **Severity:** high
- **File:** `packages/dynamic-forms/src/lib/core/derivation/derivation-orchestrator.ts:557–574`
- **Description:** HTTP and async derivations read `externalData` with `untracked()` — no reactive dependency established. Logic conditions do establish reactive dependencies and re-evaluate when `externalData` signals change. Asymmetric reactivity: conditions update immediately, derivations only pick up the new value when some other form field change triggers the stream. Undocumented.

---

### B12 — Unregistered field type passes form initialization silently; throws only at render time

- **Severity:** medium
- **File:** `packages/dynamic-forms/src/lib/utils/inject-field-registry/inject-field-registry.ts:126`
- **Description:** Field type validation is lazy. A config referencing an unregistered type initializes the form successfully. The `DynamicFormError` is thrown only when the component tries to render that field. In large forms with conditional visibility, an unregistered type on a hidden section can go undetected until a user interaction reveals it.

---

### B13 — HTTP request body expression evaluation is shallow; nested object values silently not evaluated

- **Severity:** high
- **File:** `packages/dynamic-forms/src/lib/core/http/http-request-resolver.ts:40–54`
- **Description:** Only top-level keys of the request body are evaluated as expressions. `body: { user: { id: 'formValue.userId' } }` sends the literal string `'formValue.userId'` to the server. No error, no warning. Inconsistent with top-level key behavior.
- **Risk:** Silent data corruption on POST derivations with nested payloads.

---

### B14 — HTTP derivation URL template fires with empty segment when field value is `undefined`

- **Severity:** high
- **File:** `packages/dynamic-forms/src/lib/core/http/http-request-resolver.ts:19`
- **Description:** Path params resolving to `undefined` (missing field, typo, not-yet-initialized value) are coerced to empty string via `encodeURIComponent('')`. The request fires as `/api/users/` instead of being suppressed. A poorly timed initialization or field key typo silently hits a wrong endpoint.

---

### B15 — Hidden current page strands user with no automatic navigation

- **Severity:** high
- **File:** `packages/dynamic-forms/src/lib/core/page-orchestrator/page-orchestrator.component.ts:154–171`
- **Description:** `currentPageIndex` is never auto-clamped. If the user is on page 3 and its visibility condition becomes `true` (hidden), the index stays at 3, `currentVisiblePosition` resolves to `-1`, and the page renders as `df-page-hidden`. Navigation guards still work but no automatic redirect to the next visible page fires. The user sees a blank page until they manually call a navigation method.

---

### B16 — Event handler exceptions propagate uncaught; synchronous throw crashes the component

- **Severity:** medium
- **File:** `packages/dynamic-forms/src/lib/events/event.bus.ts:105–119`
- **Description:** `EventBus.dispatch()` calls `subject.next(event)` with no try-catch wrapper. If any subscriber's synchronous handler throws, the exception propagates through the Subject chain and up to the click handler, crashing Angular's error boundary for that component. No isolation between subscribers.

---

### B17 — `reEngageOnDependencyChange` fails for intra-array-item dependencies (changedFields path mismatch)

- **Severity:** high
- **File:** `packages/dynamic-forms/src/lib/core/derivation/derivation-applicator.ts:662–702`
- **Description:** Extension of B5. `changedFields` uses root-level keys (`'items'`), not item-path keys (`'items.0.quantity'`). The re-engagement check is an exact match — relative dependency names like `quantity` never match. Documented in JSDoc but the limitation is invisible to users combining these two config flags.

---

### B18 — Module-scoped AST cache violates SSR safety contract

- **Severity:** medium
- **File:** `packages/dynamic-forms/src/lib/core/expressions/parser/expression-parser.ts:62`
- **Description:** `const astCache = new LRUCache<string, ASTNode>(1000)` is declared at module scope — outside DI, shared across all SSR requests in the Node.js process. The AST is deterministic per expression string so there's no cross-request behavioral contamination, but `astCache.clear()` is globally callable and nukes the cache for all concurrent requests. Every other cache in the library is DI-scoped; this one alone escapes that pattern. Direct violation of CLAUDE.md SSR rule and internal consistency.

---

### B19 — HTTP derivation silently sends GET with body when `method` is omitted

- **Severity:** low
- **File:** `packages/dynamic-forms/src/lib/core/derivation/http-derivation-stream.ts:190`
- **Description:** Default is `method ?? 'GET'`. Configuring `body: { userId: 'formValue.id' }` without `method` sends a GET with a request body — non-standard, silently ignored by most servers. No config-time warning.

---

### B20 — Async derivation returning a non-iterable value throws an uncaught `TypeError`

- **Severity:** medium
- **File:** `packages/dynamic-forms/src/lib/core/derivation/async-derivation-stream.ts:183`
- **Description:** `from(asyncFn(evalContext))` — if the user returns a plain object or number (not a Promise, Observable, or iterable), `from()` throws synchronously with `TypeError: object is not iterable`. The inner `next` try-catch and outer `catchError` both fail to protect this call site. The derivation stream crashes.

---

### B21 — Cross-system cycle (value derivation ↔ logic condition) has no detection mechanism

- **Severity:** medium
- **File:** `packages/dynamic-forms/src/lib/core/derivation/cycle-detector.ts`
- **Description:** The cycle detector only covers value derivation → value derivation cycles. Logic condition → logic condition cycles are caught by Angular's signal system. But cross-system cycles — where a derivation's output feeds a logic condition whose state feeds back into the same derivation — are caught by neither system. In practice bounded by `maxDerivationIterations`, but produces wrong/unstable output with no developer warning.

---

### B22 — Non-signal value in `externalData` crashes with unhelpful `TypeError: value is not a function`

- **Severity:** medium
- **File:** `packages/dynamic-forms/src/lib/core/registry/field-context-registry.service.ts:244`
- **Description:** TypeScript enforces `Record<string, Signal<unknown>>` but users passing config objects (deserialized from JSON or constructed without the type checker) bypass this. No runtime `isSignal()` check exists. The cast `(value as Signal<unknown>)()` throws with no indication of which key is the problem or that signals are required.

---

### B23 — Custom logger exceptions propagate uncaught from critical form paths

- **Severity:** low
- **File:** `packages/dynamic-forms/src/lib/state/form-state-manager.ts:629,695,749,822`
- **Description:** Logger calls in field loading errors, state machine error recovery, and submission warning paths have no try-catch. A `DynamicFormLogger` implementation that throws on `warn()` or `error()` crashes the form at those points.

---

### B24 — `navigateToPage(index)` allows direct navigation to a hidden page with no guard

- **Severity:** medium
- **File:** `packages/dynamic-forms/src/lib/core/page-orchestrator/page-orchestrator.component.ts:312–344`
- **Description:** Only validates numeric bounds. No visibility check. User lands on a blank hidden page (`aria-hidden="true"`, `df-page-hidden`). The previous/next navigation methods correctly skip hidden pages; direct index navigation does not.

---

### B25 — Subscriber exception in `(events)` output crashes the entire event pipeline

- **Severity:** medium
- **File:** `packages/dynamic-forms/src/lib/events/event.bus.ts:76–81`
- **Description:** The `pipeline$` is a raw Subject. A synchronous throw inside any `(events)` subscriber propagates through `Subject.next()` and kills the observable for all downstream listeners. The form's event system goes dead for the component's remaining lifetime with no recovery.

---

### B26 — Property derivation `disabled: true` applies only to component input layer, not Angular form control

- **Severity:** high
- **File:** `packages/dynamic-forms/src/lib/core/property-derivation/apply-property-overrides.ts:29–80`
- **Description:** Property derivations write to component inputs; logic conditions operate on the Signal Form control state via Angular's `disabled()`. Setting `disabled` via a property derivation produces a visually-disabled field whose form control remains enabled — validators still run, the value stays in the form output, and keyboard navigation may still reach it. The two systems are independent with no merge/precedence logic.

---

### B27 — Array item append beyond `maxLength` silently allowed; only validation flags it after the fact

- **Severity:** medium
- **File:** `packages/dynamic-forms/src/lib/events/constants/append-array-item.event.ts:36–49`
- **Description:** `AppendArrayItemEvent` performs no `maxLength` check. The item is added, the form becomes invalid, but the Add button is not disabled at `maxLength`. The user can keep adding items indefinitely with the form in invalid state — no UI indicator that the limit has been reached.

---

### B28 — `excludeValueIfDisabled: false` is a broken no-op

- **Severity:** high
- **File:** `packages/dynamic-forms/src/lib/state/form-state-manager.ts:443`
- **Description:** `formValue` is computed from Angular Signal Forms' `formInstance().value()`, which already excludes disabled controls by Angular's own design. The library's `filteredFormValue` layer then reads this already-pruned snapshot. When `excludeValueIfDisabled: false` is set (meaning "keep disabled field values"), the filter correctly skips the exclusion step — but the values are already gone upstream. The documented config option never has any effect.

---

### B29 — Config hot-swap during active submission has no guard; rebuilds form around in-flight action

- **Severity:** high
- **File:** `packages/dynamic-forms/src/lib/state/form-state-machine.ts:216–228`
- **Description:** The state machine accepts `ConfigChange` in any state, including while `form.submitting()` is `true`. If the parent component reactively changes `[config]` while an async submission is running, the teardown/rebuild cycle fires alongside the still-in-flight action. The form state is rebuilt around the new config while the old action's Promise still holds a reference to the old form tree.

---

### B30 — Double-submit with Promise actions: `switchMap` cancels the Observable wrapper but not the Promise; both side effects execute

- **Severity:** high
- **File:** `packages/dynamic-forms/src/lib/utils/submission-handler/submission-handler.ts:85–106`
- **Description:** A second submit event during an in-flight Promise action unsubscribes the first action's Observable subscription but cannot cancel the Promise. Both network requests (or other side effects) fire. Only the second result is applied to form state; the first silently completes in the background. The `submitting()` signal correctly shows in-progress, but the guard is bypassed by the second call replacing it.

---

### B31 — Zod/Standard Schema error at a path that doesn't match any field key is silently discarded

- **Severity:** medium
- **File:** `packages/dynamic-forms/src/lib/core/form-schema-merger.ts:25–37`
- **Description:** A path typo in a Zod schema (`emailAddress` vs the actual field key `email`) produces no error, no warning, and no visible validation in the form. The rule is silently ignored.

---

### B32 — `formFieldState.nonExistentField.hidden` throws `TypeError`; Proxy returns `undefined` for unknown keys with no safe fallback

- **Severity:** medium
- **File:** `packages/dynamic-forms/src/lib/core/derivation/field-state-extractor.ts:120–135`
- **Description:** The Proxy returns `undefined` for unknown field keys. Chained access (`.hidden`, `.disabled`) on `undefined` throws `TypeError: Cannot read properties of undefined`. The expression evaluator's catch block intercepts this silently — the expression returns `undefined`, the condition evaluates as falsy, and no warning is logged. Field key typos in expressions produce zero feedback.
- **Note:** The related chained bracket access footgun: `formFieldState['address']['street']` silently returns `undefined` — only `formFieldState['address.street']` (dot-notation string key) is supported. This is intentional design but produces no runtime error on the wrong pattern.

---

### B33 — `(initialized)` emits before derivation pipeline has processed its first cycle

- **Severity:** high
- **File:** `packages/dynamic-forms/src/lib/dynamic-form.component.ts:255–258`
- **Description:** The `DerivationOrchestrator` and `PropertyDerivationOrchestrator` are lazily injected inside `afterNextRender()`. The `ComponentInitializedEvent` that triggers `initialized$` fires in a render effect in the same render cycle — before the `afterNextRender` callback has injected the orchestrators and started the derivation streams. A consumer reading `formValue()` on `(initialized)` sees only initial/default values; derived field values are not populated yet.

---

### B35 — Initialization hang on container component throw; `(initialized)` never emits

- **Severity:** high
- **File:** `packages/dynamic-forms/src/lib/dynamic-form.component.ts` (initialization tracker)
- **Description:** `emitComponentInitialized` wraps the dispatch in `afterNextRender` with a bare `try-catch` that swallows errors silently (`// Input not available - component may have been destroyed`). If any container component (group, page, row, array) throws before this fires, `(initialized)` hangs forever. The tracker uses `filter(isComplete)` with no `timeout()` operator — no timeout, no fallback, no retry.

---

### B36 — Stale `explicitEffect` dependency in group field

- **Severity:** low
- **File:** `packages/dynamic-forms/src/lib/fields/group/group-field.component.ts:236`
- **Description:** `explicitEffect([this.nestedFieldTree], ...)` reads `this.field()` inside the body but doesn't declare it as a dependency. When the parent changes the `field` input while `nestedFieldTree` is undefined, the warning log emits a stale group key.
- **Fix:** Add `this.field` to the dependency array.

---

### B37 — `totalComponentsCount` undercounts nested array components → premature `(initialized)`

- **Severity:** medium
- **File:** `packages/dynamic-forms/src/lib/utils/initialization-tracker/` (exact counter logic)
- **Description:** The counter only counts direct container fields. Array components nested inside array item templates are invisible to the counter. For forms with nested arrays, the `(initialized)` event fires before all inner components are ready.

---

### B38 — Duplicate field keys: silent last-write-wins _(extends B8)_

- **Severity:** medium
- **File:** `packages/dynamic-forms/src/lib/core/schema-builder.ts` (keyBy / schema construction)
- **Description:** Independently confirmed this session. No deduplication or validation at config parse time. Second field's validators overwrite the first's in the schema builder with no error or warning.
- **Fix:** Validate field key uniqueness at config parse time; throw a `DynamicFormError` listing the duplicate keys.

---

### B39 — Cross-field validators read pre-derivation stale values

- **Severity:** high
- **File:** `packages/dynamic-forms/src/lib/core/cross-field/cross-field-collector.ts` + derivation orchestration
- **Description:** No ordering guarantee between derivation runs and cross-field validator execution. Cross-field validators can fire before sibling derivations have updated their computed outputs, reading stale values.

---

### B40 — Async Zod refinements silently pass (always valid)

- **Severity:** high
- **File:** `packages/dynamic-forms/src/lib/core/form-schema-merger.ts:30`
- **Description:** `validateStandardSchema` is synchronous. `.refine(async () => ...)` causes Zod to return a `Promise` instead of a boolean. The Promise is truthy, so validation silently reports valid. The refinement body never runs, no error is ever generated, `valid()` has no pending state.
- **Fix:** Document the limitation and add a dev-mode warning when a Promise is detected as a refinement result.

---

### B41 — `inject(HttpClient)` without `{ optional: true }` in HTTP condition logic

- **Severity:** high
- **File:** `packages/dynamic-forms/src/lib/core/expressions/http-condition-logic-function.ts:48`
- **Description:** `derivation-orchestrator.ts` correctly uses `inject(HttpClient, { optional: true })` with a friendly error. `http-condition-logic-function.ts` uses `inject(HttpClient)` without the optional flag — any form with an HTTP condition expression crashes at evaluation time with a raw `NullInjectorError`.
- **Fix:** Change to `inject(HttpClient, { optional: true })` and throw a `DynamicFormError` with instructions to add `provideHttpClient()`.

---

## Performance Bottlenecks

### P1 — `isEqual` deep-compares entire form value on every keystroke

- **File:** `packages/dynamic-forms/src/lib/utils/object-utils.ts:33–143`, `state/form-state-manager.ts:341–365`
- **Description:** The `entity` `linkedSignal` has `equal: isEqual` as its equality guard. `isEqual` is recursive with no subtree short-circuiting — always walks the full object. The same `isEqual` runs again in the effect at `:815` for the `deps.value` write-back. Two full deep-comparisons per keystroke.

---

### P2 — `filterFormValue` allocates a new result object every keystroke with no reference preservation

- **File:** `packages/dynamic-forms/src/lib/utils/value-filter/value-filter.ts:65–141`, `state/form-state-manager.ts:453–486`
- **Description:** `filteredFormValue` is a `computed()` that calls `filterFormValue()` on every form value change. Always opens with `const result: Record<string, unknown> = {}` and rebuilds from scratch. Downstream consumers can't rely on reference equality to skip work.

---

### P3 — New `formFieldState` Proxy + backing Map created on every expression evaluation

- **File:** `packages/dynamic-forms/src/lib/core/derivation/field-state-extractor.ts:117–135`
- **Description:** `createFormFieldStateMap()` is called inside a lazy getter on the evaluation context. Every expression evaluation touching `formFieldState` spawns a fresh Proxy and a fresh Map cache — none shared or reused across conditions in the same derivation cycle.

---

### P4 — `validKeys` computed creates a new `Set` on every evaluation

- **File:** `packages/dynamic-forms/src/lib/state/form-state-manager.ts:315–319`
- **Description:** `validKeys` produces `new Set(...)` on every re-evaluation. Infrequent on static configs; allocates on every trigger in dynamic config scenarios.

---

### P5 — `stableStringify` called 3–5 times per HTTP condition per form value change

- **File:** `packages/dynamic-forms/src/lib/core/expressions/http-condition-logic-function.ts:61,89,100,124,136`
- **Description:** Used for cache key generation, `distinctUntilChanged` comparison, and request-change detection at separate call sites. 5 HTTP conditions = ~15 recursive stringify operations per form value change before the cache determines whether to fire a request.

---

### P6 — `getChangedKeys` enumerates and deep-compares all top-level form keys on every emission

- **File:** `packages/dynamic-forms/src/lib/utils/object-utils.ts:308–344`
- **Description:** Used inside the `pairwise()` comparison in the derivation orchestrator's `onChange` stream. Enumerates all keys from both values, then calls `isEqual` on each changed key. O(n) on large flat forms per emission, even when only one field changed. Batched by `auditTime(0)` but not bounded.

---

## Internal Consistency Issues (Not Runtime Bugs)

- **Plain `Error` used instead of `DynamicFormError`** in 5 files: `cross-field-collector.ts:190,212,217` / `derivation-applicator.ts:614,620` / `path-utils.ts:340,351` / `derived-from-deferred.ts:136` / `cycle-detector.ts:371`

---

## Confirmed Clean Areas

| Area                     | Notes                                                                                     |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| `ngOnDestroy` / teardown | All subscriptions use `takeUntilDestroyed`; no leaks                                      |
| Concurrent forms         | Every service is component-scoped via `provideDynamicFormDI()`; zero shared mutable state |
| Memory / cleanup         | `LogicFunctionCacheService` is component-scoped; effects are injection-context-scoped     |

---

## Documented Limitations (Not Bugs)

| ID  | Area                                                                 | Location                            | Notes                                                                                               |
| --- | -------------------------------------------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------- |
| L1  | `condition=false` does not clear derived value                       | `derivation-applicator.ts:242–257`  | Explicitly documented; workaround is an inverse derivation                                          |
| L2  | Page visibility expressions cannot reference array item fields       | `field-context-registry.ts:305–310` | Documented in code; display-only context has no array scoping                                       |
| L3  | Cross-field validators cannot reference fields inside array items    | `cross-field-collector.ts:52`       | Explicitly tested                                                                                   |
| L4  | Visibility expressions inside array items are scoped to the item     | `condition-evaluator.ts:76–80`      | Must use `rootFormValue` to access sibling items or root fields                                     |
| L5  | HTTP is not supported for populating select option lists             | —                                   | `options` is a static `FieldOption<T>[]`; HTTP is only used in derivations/conditions               |
| L6  | Ionic toggle has no native `readonly`; readonly merges into disabled | —                                   | Adapter limitation; visually indistinguishable from disabled                                        |
| L7  | `withEventFormValue` attaches raw (unfiltered) form value to events  | —                                   | Hidden/disabled field values included; inconsistent with `(submitted)` filtered value. Undocumented |

---

## Design Decisions (Not Bugs)

| ID  | Behavior                                                                           | Verdict                                                                                                                             |
| --- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Disabled fields still receive derived values                                       | By design; `excludeValueIfDisabled` controls output, not computation                                                                |
| D2  | Validators execute on disabled fields                                              | Angular Signal Forms does not suppress validators for disabled controls; same class as invalid hidden fields                        |
| D3  | Derivations always overwrite value (no "field default" concept)                    | Deterministic by design; derivations run after initialization                                                                       |
| D4  | Field state is preserved when navigating back in multi-page                        | By design                                                                                                                           |
| D5  | `reset()` returns to value defaults, not a separate initial-value                  | No `initialValue` concept; `value` is both default and reset target                                                                 |
| D6  | Array field value filtering is all-or-nothing                                      | `filterFormValue` short-circuits at array boundary; `excludeValueIfHidden` does not cascade into array items. Intentional per tests |
| D7  | `addItem`/`removeItem` enforce constraints reactively (after mutation)             | Operations are optimistic; violations appear in `form.errors()` afterward                                                           |
| D8  | No field config patch API — full replacement only                                  | Values preserved across transition; reactive field-level changes should use property derivations                                    |
| D9  | `formMode` is a structure flag (paged vs. non-paged), not an edit/read-only toggle | No runtime mode transitions, no validator gating                                                                                    |

---

## Accessibility Gap

No focus management anywhere in the library. Page navigation, first-invalid-field surfacing on submit, array item add/remove — all produce zero programmatic focus moves. No `aria-live` regions. Fully delegated to consuming applications with no guidance or hooks provided.
