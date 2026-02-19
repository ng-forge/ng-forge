# Stability Assessment — Issues Found

Format: `ID | severity | file:line | description`

Severity scale: **critical** | **high** | **medium** | **low**

---

<!-- Add prior session findings above this line -->

---

## Session: 2026-02-19 (this session, areas 1–9)

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
