# Stability Assessment — Issues Found

Format: `ID | severity | file:line | description`

Severity scale: **critical** | **high** | **medium** | **low**

---

## Session 1: 2026-02-19 (initial pass)

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
- **Fix:** Count components recursively, including array item template roots.

---

### B38 — Duplicate field keys: silent last-write-wins

- **Severity:** medium
- **File:** `packages/dynamic-forms/src/lib/core/schema-builder.ts` (keyBy / schema construction)
- **Description:** No deduplication or validation at config parse time. `keyBy()` overwrites on duplicate keys. In the schema builder, the second field's validators silently overwrite the first's. No error thrown, no warning logged.
- **Fix:** Validate field key uniqueness at config parse time; throw a `DynamicFormError` with `[Dynamic Forms]` prefix and list the duplicate keys.

---

### B39 — Cross-field validators read pre-derivation stale values

- **Severity:** high
- **File:** `packages/dynamic-forms/src/lib/core/cross-field/cross-field-collector.ts` + derivation orchestration
- **Description:** No ordering guarantee between derivation runs and cross-field validator execution. When a field value changes, cross-field validators can fire before sibling derivations have updated their computed outputs, reading stale values. Async cross-field validators also have the same race condition.
- **Fix:** Ensure derivation pass completes before cross-field validators are evaluated in the same change cycle.

---

### B40 — Async Zod refinements silently pass (always valid)

- **Severity:** high
- **File:** `packages/dynamic-forms/src/lib/core/form-schema-merger.ts:30`
- **Description:** `validateStandardSchema` is synchronous. If `formLevelSchema` uses `.refine(async () => ...)`, Zod returns a `Promise` instead of a boolean. The Promise is truthy, so validation silently reports valid. The refinement body never runs, no error is ever generated, and `valid()` has no pending state.
- **Fix:** Either document the limitation clearly (async refinements unsupported) and add a dev-mode warning when a Promise is detected, or adopt Angular's async schema validation path if available.

---

### B41 — `inject(HttpClient)` without `{ optional: true }` in HTTP condition logic

- **Severity:** high
- **File:** `packages/dynamic-forms/src/lib/core/expressions/http-condition-logic-function.ts:48`
- **Description:** `derivation-orchestrator.ts` correctly uses `inject(HttpClient, { optional: true })` with a friendly error message. But `http-condition-logic-function.ts` uses `inject(HttpClient)` without the optional flag. Any form with an HTTP condition expression — even one that never fires — crashes at condition evaluation time with Angular's raw `NullInjectorError` instead of a `DynamicFormError`.
- **Fix:** Change to `inject(HttpClient, { optional: true })` and throw a `DynamicFormError` with instructions to add `provideHttpClient()`.

---

## Session 2: 2026-02-19 (extended pass)

### B1 — Derivation sorter creates false dependency edges via array relative path double-indexing

- **Severity:** high
- **File:** `packages/dynamic-forms/src/lib/core/derivation/derivation-sorter.ts:47–66`
- **Description:** Entries targeting `items.$.lineTotal` are indexed twice — once under the full key `items.$.lineTotal`, and again under the bare relative segment `lineTotal`. If a root-level field is also named `lineTotal`, a dependency declared on `lineTotal` will inadvertently pull in the array derivation as a producer too. This creates a false edge in the topological sort, potentially changing execution order.
- **Extended finding:** `appliedDerivations` is created once per `applyDerivations()` call and never cleared between while loop iterations. A derivation that runs in iteration 1 is permanently skipped in iterations 2 and 3, even if its dependencies changed as a result of other derivations' outputs.
- **Fix:** Single `chainContext.appliedDerivations.clear()` at the top of the loop body. `derivation-applicator.ts:154–176` (loop), `:281,358,436,479` (check/add sites).

---

### B2 — `currentPageValid` only checks top-level fields; nested group/row fields are invisible

- **Severity:** high
- **File:** `packages/dynamic-forms/src/lib/core/page-orchestrator/page-orchestrator.component.ts:182–212`
- **Description:** The computed iterates only `currentPage.fields` and calls `form[fieldKey].valid()`. Fields nested inside a group or row on that page are never traversed. Invalid fields inside a group or row do not prevent page advancement.

---

### B3 — `navigateToNextPage()` has no validation guard; the orchestrator can be bypassed programmatically

- **Severity:** high
- **File:** `packages/dynamic-forms/src/lib/core/page-orchestrator/page-orchestrator.component.ts:235–267`
- **Description:** The navigation method itself never calls `currentPageValid`. The UI button mapper does check it, but any programmatic caller of `navigateToNextPage()` skips validation entirely. This is compounded by B2 above even when the UI path is used. `disableWhenPageInvalid: true` is button-only; direct calls from application code or keyboard shortcuts bypass page validation entirely. Combined with B2, even the button guard is incomplete.

---

### B4 — Old HTTP derivation response can land on a new config's field after hot-swap

- **Severity:** critical
- **File:** `packages/dynamic-forms/src/lib/core/derivation/derivation-orchestrator.ts:321–384`
- **Description:** On config change, `teardownHttpStreams()` unsubscribes Angular subscriptions, but in-flight HTTP requests are already dispatched and can complete. The response handler reads `context.form()` fresh at completion time. If the new config retains the same field key (with different semantics), the old response applies its value to the new form. A field not present in the new config is safely skipped with a warning, but a key collision causes silent data overwrite.

---

### B5 — `reEngageOnDependencyChange` never fires for intra-array-item dependencies

- **Severity:** high
- **File:** `packages/dynamic-forms/src/lib/core/derivation/derivation-applicator.ts:645–664`
- **Description:** `changedFields` is populated with root-level keys (e.g., `lineItems`), but `entry.dependsOn` for array derivations contains relative names (e.g., `quantity`, `unitPrice`). The comparison is an exact string match, so relative dependencies never match and re-engagement never triggers. The behavior is acknowledged in a code comment as a known limitation, but it makes the feature combination of `stopOnUserOverride: true` + `reEngageOnDependencyChange: true` silently non-functional inside arrays.

---

### B6 — No explicit async validator cancellation when an array item is removed

- **Severity:** high
- **File:** `packages/dynamic-forms/src/lib/fields/array/array-field.component.ts:614–630`
- **Description:** Item removal updates the resolved-items signal and splices the form value, but there is no `AbortController` or explicit unsubscribe for async validators in-flight for the removed item. Angular's scoped injector destruction is the only cleanup, which happens asynchronously. A validator response completing after removal attempts to update a field that no longer exists — the write is silently swallowed via `applyValueToForm`'s missing-field guard, but validation state may have already been observed before the cleanup completes.

---

### B7 — `submission.action` bypasses the pending-validator guard

- **Severity:** high
- **File:** `packages/dynamic-forms/src/lib/state/form-state-manager.ts:682–706`
- **Description:** The `(submitted)` output stream has an explicit `filter(() => !this.valid())` guard — if async validators are pending, `valid()` is false and the event is swallowed. The `submission.action` path does not have this guard; it delegates directly to Angular's native `submit()` with no equivalent check. Same user action, two different safety contracts depending on which submission mechanism is wired up.
- **Extended:** The wrapped action awaits the result but is passed to Angular Signal Forms' `submit()` which does not catch Promise rejections. The `(submitted)` path has an explicit error callback in `subscribe()`. `submission.action` does not — a rejected Promise surfaces as an unhandled rejection at the runtime level. (`utils/submission-handler/submission-handler.ts:39–51`)

---

### B8 — Duplicate field keys are silently accepted; last definition wins

- **Severity:** medium
- **File:** `packages/dynamic-forms/src/lib/utils/object-utils.ts:179–187`
- **Description:** `keyBy()` uses reduce with no deduplication check — later entries silently overwrite earlier ones. No warning is logged, no error is thrown. A test explicitly documents the "last wins" behavior. If a developer accidentally declares the same key twice in a config (e.g., copy-paste in a large form), one field's validators, handlers, and logic are silently dropped. (Same root cause as B38, different file.)

---

### B9 — Async validators that never resolve hang the form permanently

- **Severity:** medium
- **File:** `packages/dynamic-forms/src/lib/core/validation/validator-factory.ts`
- **Description:** No timeout mechanism anywhere in the async validator pipeline. A custom async validator that returns a Promise that never settles (due to a hung network request, uncaught error in user code, etc.) leaves the form's `pending()` state permanently true. The `(submitted)` output guard checks `valid()` which includes pending state — the form can never be submitted. No escape hatch exists unless the component is destroyed.

---

### B10 — `reset()` does not clear Angular's dirty flag; `stopOnUserOverride` remains engaged

- **Severity:** high
- **File:** `packages/dynamic-forms/src/lib/state/form-state-manager.ts:773–786`
- **Description:** `reset()` writes new values to the form's value signal but does not call Angular Signal Forms' `reset()` on the underlying form instance. The Angular dirty flag is not cleared. Fields with `stopOnUserOverride: true` track user override via the dirty flag — after `reset()` they still appear dirty to the derivation engine, so derivations don't re-run.
- **Extended (deadlock):** When a user has manually overridden a derived field then calls `reset()`: (1) reset clears value to default but NOT dirty flag, (2) derivation pipeline re-fires because base field changed, (3) stopOnUserOverride is still engaged (field still dirty), so derivation is blocked, (4) field is stuck at reset default and can never re-derive. `clear()` shares the same dirty flag issue.

---

### B11 — `externalData` signal changes do not trigger derivation re-evaluation

- **Severity:** high
- **File:** `packages/dynamic-forms/src/lib/core/derivation/derivation-orchestrator.ts:557–574`
- **Description:** HTTP and async derivations read `externalData` with `untracked()` — per-emission reads, no reactive dependency. Logic conditions (show/hide/readonly) establish reactive dependencies and do re-evaluate when externalData signals change. Asymmetric reactivity, undocumented. If you pass `externalData: { taxRate: signal(0.2) }` and update `taxRate`, a derivation computing `price * externalData.taxRate` does NOT re-fire. It picks up the new rate only when some other form field changes and triggers the stream.

---

### B12 — Unregistered field type passes form initialization silently; throws only at render time

- **Severity:** medium
- **File:** `packages/dynamic-forms/src/lib/utils/inject-field-registry/inject-field-registry.ts:126`
- **Description:** Field type validation is lazy. If a config references `type: 'my-custom-input'` that was never registered, the form initializes successfully and resolves field defaults without error. The `DynamicFormError` is only thrown when the component tries to render that specific field. In large forms with conditional visibility, an unregistered type on a hidden section could go undetected until a user interaction reveals it.

---

### B13 — HTTP request body `evaluateBodyExpressions` evaluates shallow only

- **Severity:** medium
- **File:** `packages/dynamic-forms/src/lib/core/http/http-request-resolver.ts:40–54`
- **Description:** Only top-level keys of the request body are evaluated as expressions. If you write `body: { user: { id: 'formValue.userId' } }`, the string `'formValue.userId'` is sent to the server as a literal — not the actual value. No error, no warning. Inconsistent with top-level keys.

---

### B14 — HTTP derivation URL template fires with empty segment when form value field is undefined

- **Severity:** medium
- **File:** `packages/dynamic-forms/src/lib/core/http/http-request-resolver.ts:19`
- **Description:** Path params in URL templates that resolve to undefined (missing field, typo, not-yet-initialized value) are coerced to empty string via `encodeURIComponent('')`. The request fires as `/api/users/` instead of being suppressed. A poorly timed initialization or typo in a field key silently hits a wrong endpoint.

---

### B15 — Hidden page condition leaves user stranded; no automatic navigation fires

- **Severity:** high
- **File:** `packages/dynamic-forms/src/lib/core/page-orchestrator/page-orchestrator.component.ts:154–171`
- **Description:** `currentPageIndex` is never auto-clamped. If the user is on page 3 and its hidden condition becomes true, the index stays at 3, `currentVisiblePosition` resolves to -1, and the page renders as `df-page-hidden`. Navigation guards still work but no automatic redirect to the next visible page fires. The user sees nothing until they manually call `navigateToNextPage()` or `navigateToPreviousPage()`.

---

### B16 — Event handler exceptions propagate uncaught; synchronous throw crashes the component

- **Severity:** high
- **File:** `packages/dynamic-forms/src/lib/events/event.bus.ts:105–119`
- **Description:** `EventBus.dispatch()` calls `subject.next(event)` with no try-catch wrapper. If any subscriber's synchronous handler throws, the exception propagates through the Subject chain and up to the click handler in the component, crashing Angular's error boundary for that component. No isolation.

---

### B17 — `reEngageOnDependencyChange` silently fails for intra-array-item dependency changes

- **Severity:** high
- **File:** `packages/dynamic-forms/src/lib/core/derivation/derivation-applicator.ts:662–702`
- **Description:** When a user manually overrides an array item's derived field, `reEngageOnDependencyChange` is supposed to restart derivation if a listed dependency changes. It only works for top-level form fields. If the dependency is another field within the same array item (e.g., `quantity` inside `items[0]`), the re-engagement never fires — `changedFields` uses root-level keys (`'items'`), not item-path keys (`'items.0.quantity'`). Documented in JSDoc but encountered unexpectedly. (Same root cause as B5.)

---

### B18 — Module-scoped AST cache violates SSR safety contract

- **Severity:** medium
- **File:** `packages/dynamic-forms/src/lib/core/expressions/parser/expression-parser.ts:62`
- **Description:** `const astCache = new LRUCache<string, ASTNode>(1000)` is declared at module scope — outside DI, shared across all SSR requests in the Node.js process. The AST is deterministic per expression string so there's no cross-request behavioral contamination. But `astCache.clear()` is globally callable and nukes the cache for all concurrent requests. Every other cache in the library is DI-scoped (`provideDynamicFormDI()`); this one alone escapes that pattern. Direct violation of the CLAUDE.md rule and the codebase's own internal consistency.

---

### B19 — HTTP derivation silently sends GET with body when method is omitted but body is configured

- **Severity:** low
- **File:** `packages/dynamic-forms/src/lib/core/derivation/http-derivation-stream.ts:190`
- **Description:** Default is `method ?? 'GET'`. Configuring `body: { userId: 'formValue.id' }` without `method` sends a GET with a request body — non-standard, ignored silently by most servers. No config-time warning.

---

### B20 — Async derivation compute function returning a plain non-iterable value throws uncaught TypeError

- **Severity:** medium
- **File:** `packages/dynamic-forms/src/lib/core/derivation/async-derivation-stream.ts:183`
- **Description:** `from(asyncFn(evalContext))` — if the user returns a plain object or number (not a Promise, Observable, or iterable), `from()` throws synchronously with `TypeError: object is not iterable`. The inner next try-catch and the outer catchError both don't protect against this specific call site. The derivation stream crashes.

---

### B21 — Cross-system cycle (value derivation ↔ logic condition) has no detection mechanism

- **Severity:** medium
- **File:** `packages/dynamic-forms/src/lib/core/derivation/cycle-detector.ts`
- **Description:** The cycle detector only covers value derivation → value derivation cycles. Logic condition → logic condition cycles are detected at runtime by Angular's signal system (generic "circular dependency" error). But cross-system cycles — where a derivation's output feeds a logic condition whose state feeds back into a derivation — are caught by neither system. In practice, bounded by `maxDerivationIterations` but produces wrong/unstable output with no warning to the developer.

---

### B22 — Passing a non-signal value in `externalData` crashes with unhelpful TypeError

- **Severity:** medium
- **File:** `packages/dynamic-forms/src/lib/core/registry/field-context-registry.service.ts:244`
- **Description:** TypeScript enforces `Record<string, Signal<unknown>>` but users passing config objects (often deserialized from JSON or constructed without the type checker) bypass this. No runtime `isSignal()` check exists. The cast `(value as Signal<unknown>)()` throws with no indication of which key is the problem or that signals are required.

---

### B23 — Custom logger exceptions propagate uncaught from critical form paths

- **Severity:** low
- **File:** `packages/dynamic-forms/src/lib/state/form-state-manager.ts:629,695,749,822`
- **Description:** Logger calls in field loading errors, state machine error recovery, and submission warning paths have no try-catch. A `DynamicFormLogger` implementation that throws on `warn()` or `error()` crashes the form at those points.

---

### B24 — `navigateToPage(index)` allows direct navigation to a hidden page with no guard

- **Severity:** high
- **File:** `packages/dynamic-forms/src/lib/core/page-orchestrator/page-orchestrator.component.ts:312–344`
- **Description:** Only validates numeric bounds. No visibility check. User lands on a blank hidden page (`aria-hidden="true"`, `df-page-hidden`). The previous/next navigation methods correctly skip hidden pages; direct index navigation does not.

---

### B25 — A subscriber exception inside `(events)` output crashes the entire event pipeline

- **Severity:** high
- **File:** `packages/dynamic-forms/src/lib/events/event.bus.ts:76–81`
- **Description:** The `pipeline$` is a raw Subject. A synchronous throw inside any `(events)` subscriber propagates through `Subject.next()` and kills the observable for all downstream listeners. The form's event system goes dead for the component's remaining lifetime with no recovery.

---

### B26 — Property derivation `disabled: true` applies only to component input, not Signal Form control

- **Severity:** high
- **File:** `packages/dynamic-forms/src/lib/core/property-derivation/apply-property-overrides.ts:29–80`
- **Description:** Property derivations write to component inputs; logic conditions operate on the Signal Form control state via Angular's `disabled()`. Setting `disabled` via a property derivation produces a visually-disabled field whose form control remains enabled — validators still run, the value stays in the form output, and keyboard navigation may still reach it. The two systems are independent with no merge/precedence logic.

---

### B27 — Appending an array item beyond `maxLength` is silently allowed

- **Severity:** medium
- **File:** `packages/dynamic-forms/src/lib/events/constants/append-array-item.event.ts:36–49`
- **Description:** `AppendArrayItemEvent` performs no `maxLength` check. The item is added, the form becomes invalid, but the Add button is not disabled at `maxLength`. The user can keep adding items indefinitely with the form in invalid state — there's no UI indicator that the limit has been reached.

---

### B28 — `excludeValueIfDisabled: false` is a broken no-op

- **Severity:** high
- **File:** `packages/dynamic-forms/src/lib/state/form-state-manager.ts:443`
- **Description:** `formValue` is computed from Angular Signal Forms' `formInstance().value()`, which already excludes disabled controls by Angular's own design. The library's `filteredFormValue` layer then reads this already-pruned snapshot. When `excludeValueIfDisabled: false` is set (meaning "keep disabled field values in the submission"), the filter correctly skips the exclusion step — but the values are already gone. The documented config option never has any effect.

---

### B29 — Config hot-swap during active submission has no guard

- **Severity:** high
- **File:** `packages/dynamic-forms/src/lib/state/form-state-machine.ts:216–228`
- **Description:** The state machine accepts `ConfigChange` in any state, including while `form.submitting()` is true. If the parent component reactively changes `[config]` while an async submission is running, the teardown/rebuild cycle fires alongside the still-in-flight action. The form state is rebuilt around the new config while the old action's Promise still holds a reference to the old form tree.

---

### B30 — Double-submit: `switchMap` cancels the Observable wrapper, not the Promise itself

- **Severity:** medium
- **File:** `packages/dynamic-forms/src/lib/utils/submission-handler/submission-handler.ts:85–106`
- **Description:** A second submit event during an in-flight Promise action unsubscribes the first action's Observable subscription but cannot cancel the Promise. Both network requests (or other side effects) fire. Only the second result is applied to form state; the first silently completes in the background. The button appears to correctly prevent re-entry (via `submitting()`), but that state was replaced by the second call.

---

### B31 — Zod/Standard Schema error at non-matching path is silently discarded

- **Severity:** medium
- **File:** `packages/dynamic-forms/src/lib/core/form-schema-merger.ts:25–37`
- **Description:** A path typo in a Zod schema (`emailAddress` vs the actual field key `email`) produces no error, no warning, and no visible validation in the form. The rule is silently ignored.

---

### B32 — `formFieldState.nonExistentField.hidden` throws a silent TypeError

- **Severity:** low
- **File:** `packages/dynamic-forms/src/lib/core/derivation/field-state-extractor.ts:120–135`
- **Description:** The Proxy returns `undefined` for unknown field keys. Chained access (`.hidden`, `.disabled`) on `undefined` throws `TypeError: Cannot read properties of undefined`. The expression evaluator's catch block intercepts this silently — the expression returns `undefined`, the condition evaluates as falsy, and no warning is logged. Typos in field key references produce zero feedback.

---

### B33 — `(initialized)` output emits before derivation pipeline has processed its first cycle

- **Severity:** medium
- **File:** `packages/dynamic-forms/src/lib/dynamic-form.component.ts:255–258`
- **Description:** The `DerivationOrchestrator` and `PropertyDerivationOrchestrator` are lazily injected inside `afterNextRender()`. The `ComponentInitializedEvent` that triggers `initialized$` fires in a render effect, which runs in the same render cycle — before the `afterNextRender` callback has a chance to inject the orchestrators and start the derivation streams. A consumer reading `formValue()` on `(initialized)` sees only initial/default values; derived field values are not populated yet.

---

### B35 — Initialization hang on container component throw

- **Severity:** high
- **File:** `packages/dynamic-forms/src/lib/utils/initialization-tracker/` + container components
- **Description:** `emitComponentInitialized` wraps the dispatch in `afterNextRender` with a bare try-catch that swallows the error silently. If any container component (group, page, row, array) throws before this fires, `(initialized)` hangs forever — there is no timeout, no fallback, no retry. The tracker uses `filter(isComplete)` with no `timeout()` operator.

---

## Minor: Internal Consistency

### Plain `Error` used instead of `DynamicFormError` in 5 files

- **Severity:** low
- **Files:**
  - `cross-field-collector.ts:190,212,217`
  - `derivation-applicator.ts:614,620`
  - `path-utils.ts:340,351`
  - `derived-from-deferred.ts:136`
  - `cycle-detector.ts:371`
- **Description:** Internal consistency violation — all should use `DynamicFormError` with `[Dynamic Forms]` prefix per library convention. Not a runtime behavior bug.

---

## Performance Bottlenecks

### P1 — `isEqual` deep-compares the entire form value on every keystroke

- **Severity:** medium
- **Files:** `utils/object-utils.ts:33–143`, `state/form-state-manager.ts:341–365`
- **Description:** The entity `linkedSignal` has `equal: isEqual` as its equality guard. `isEqual` is a recursive depth-first traversal with no subtree short-circuiting — it always walks the full object even if only one leaf changed. On a 100-field form with 3 levels of nesting, every keystroke triggers ~300+ property comparisons. The same `isEqual` runs again in the effect at line 815 to guard the `deps.value` write-back. Two full deep-comparisons of the form value per keystroke.

---

### P2 — `filterFormValue` allocates a new result object every keystroke with no reference preservation

- **Severity:** medium
- **Files:** `utils/value-filter/value-filter.ts:65–141`, `state/form-state-manager.ts:453–486`
- **Description:** `filteredFormValue` is a `computed()` that calls `filterFormValue()` on every form value change. `filterFormValue` always opens with `const result: Record<string, unknown> = {}` and rebuilds from scratch. For a 50-field form in 10 groups: ~100 field iterations + recursive group calls per keystroke, producing a fresh object even when nothing changed. Downstream consumers can't rely on reference equality to skip work.

---

### P3 — A new `formFieldState` Proxy + backing Map is created on every expression evaluation

- **Severity:** medium
- **File:** `core/derivation/field-state-extractor.ts:117–135`
- **Description:** `createFormFieldStateMap()` is called inside a lazy getter on the evaluation context. Every expression evaluation that touches `formFieldState` spawns a fresh Proxy and a fresh Map cache. For a form with 10 logic conditions all accessing `formFieldState`, that's 10 Proxy instances and 10 Map allocations per derivation cycle, none shared, none reused across conditions.

---

### P4 — `validKeys` computed creates a new Set on every evaluation

- **Severity:** low
- **File:** `state/form-state-manager.ts:315–319`
- **Description:** `validKeys` is computed from `formSetup().schemaFields` and produces a `new Set(...)` on every re-evaluation. It sits in the entity `linkedSignal`'s dependency chain. On a form that never changes config this is infrequent; on any dynamic config scenario it allocates a new Set on every trigger.

---

### P5 — `stableStringify` called 3–5 times per HTTP condition per form value change

- **Severity:** medium
- **File:** `core/expressions/http-condition-logic-function.ts:61,89,100,124,136`
- **Description:** HTTP conditions use `stableStringify` for cache key generation, `distinctUntilChanged` comparison, and request-change detection — called separately at each stage. On a form with 5 HTTP conditions, every form value change triggers ~15 recursive stringify operations before the cache even determines whether to fire a request.

---

### P6 — `getChangedKeys` enumerates and deep-compares ALL top-level form keys on every emission

- **Severity:** medium
- **File:** `utils/object-utils.ts:308–344`
- **Description:** Used inside the `pairwise()` comparison in the derivation orchestrator's `onChange` stream. It enumerates all keys from both previous and current form values, then calls `isEqual` on each changed key. On a 100-field flat form: 100 key enumerations + `isEqual` calls per form value emission, even when only 1 field changed. Batched by `auditTime(0)` which helps, but a single user interaction can still trigger this on a large object.

---

## Documented Limitations (Not Hidden, But Worth Tracking)

| #   | Area                                                              | Location                            | Notes                                                           |
| --- | ----------------------------------------------------------------- | ----------------------------------- | --------------------------------------------------------------- |
| L1  | Condition=false does not clear derived value                      | `derivation-applicator.ts:242–257`  | Explicitly documented; workaround is an inverse derivation      |
| L2  | Page visibility expressions cannot reference array item fields    | `field-context-registry.ts:305–310` | Documented in code; display-only context has no array scoping   |
| L3  | Cross-field validators cannot reference fields inside array items | `cross-field-collector.ts:52`       | Explicitly tested with 'does not recurse into array items'      |
| L4  | Visibility expressions inside array items are scoped to the item  | `condition-evaluator.ts:76–80`      | Must use `rootFormValue` to access sibling items or root fields |

---

## Design Decisions (Not Bugs)

| #   | Behavior                                                             | Verdict                                                                    |
| --- | -------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| D1  | Disabled fields still receive derived values                         | By design; `excludeValueIfDisabled` controls output, not computation       |
| D2  | Derivations always overwrite value (field default)                   | Deterministic by design; derivations run after initialization              |
| D3  | Field state is preserved when navigating back in multi-page          | By design                                                                  |
| D4  | `reset()` returns to value defaults, not to a separate initial-value | No `initialValue` concept exists; `value` is both default and reset target |

---

## Notable Behaviors (Not Bugs)

- **`formMode`** is a structure flag (paged vs. non-paged detection), not an edit/read-only toggle. No runtime mode transitions, no validator gating.
- **Validators execute on disabled fields.** Angular's native `disabled()` call does not suppress validators in Angular Signal Forms. Disabled fields with validators continue to contribute to form validity.
- **`[(value)]` two-way binding DOES trigger derivations** — unlike `externalData` (B11). Parent-driven value changes flow through `deps.value` → `entity` → `formValue` → derivation stream. Well-designed.
- **Adapter field type collision** logs a warning ("Field type 'text' is already registered. Overwriting.") and last-registered wins. Intentional — unlike B8 (duplicate form field keys, which are silent).
- **`withEventFormValue`** attaches raw (unfiltered) form value to events — hidden and disabled field values are included, inconsistent with the filtered value used in `(submitted)`. Undocumented.
- **`exhaustMap` for `onChange` derivations** can drop form changes that arrive during a derivation cycle. Window is tiny (one microtask), but setter-triggered value changes from effects or lifecycle hooks could be silently ignored.
- **Array field value filtering is all-or-nothing.** If an array field is visible, its entire value is passed through — hidden fields within items are not filtered. Intentional per tests.
- **`excludeValueIfReadonly`** works correctly — Angular's `form.value()` only excludes disabled controls; readonly is not stripped by Angular. The library manually filters via `state.readonly()` if `excludeValueIfReadonly: true`.
- **`formFieldState` dot-path notation** — `formFieldState['address.street']` works (proxy splits on `.` and traverses FieldTree). Chained bracket access `formFieldState['address']['street']` does NOT — second bracket hits `FieldStateInfo`, not the FieldTree. Silent undefined, no error.
- **Concurrent forms** are clean. Every service is component-scoped via `provideDynamicFormDI()`. Zero shared mutable state between instances.
- **Ionic toggle/readonly** — adapter limitation. `ion-toggle` has no native readonly attribute; the adapter merges readonly into disabled.
- **HTTP select options** — Select options is a `readonly FieldOption<T>[]` — a static array. HTTP is used only in derivations and conditions, not for populating option lists. Users wanting async-loaded options need external workarounds.
- **Math not in expression scope** — and even if injected, all its methods would be blocked by the object-type whitelist (no object entry exists in `SAFE_METHODS`). `Math.max()`, `Math.min()`, `Math.round()` are inaccessible from derivation expressions.
- **Memory/cleanup** — clean. All subscriptions use `takeUntilDestroyed`, all effects are injection-context-scoped, `LogicFunctionCacheService` is component-scoped.
- **Security surface** — clean. Expression sandbox has three-layer defense (syntax restriction at parse time, blocked property set, type-specific method whitelist, scope isolation). All URL parameters pass through `encodeURIComponent()` and `URLSearchParams`. No injection surfaces found.

---

## Accessibility

- **No focus management anywhere in the library.** Page navigation, first-invalid-field surfacing on submit, array item add/remove — all produce zero focus moves. No `aria-live` regions, no programmatic `focus()` calls. Fully delegated to consuming applications with no guidance.
