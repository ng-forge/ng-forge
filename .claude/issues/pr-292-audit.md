# PR #292 Audit — Issues to File

Audit of the sandbox testing infrastructure added in PR #292
(material/primeng/ionic E2E test scenarios).

---

## Issue 1 — ~47 test scenario files are byte-for-byte identical across adapters

**Type:** `refactor` | **Scope:** `sandbox`

### Problem

The new testing directories under `apps/examples/sandbox/src/app/testing/`
contain massive copy-paste across the three adapters. The following files are
**byte-for-byte identical** in material, primeng, and ionic:

**Shared infrastructure (3 copies each):**

- `shared/test-scenario.component.ts` (351 lines)
- `shared/fixtures.ts`
- `shared/test-utils.ts`
- `shared/test-index.component.ts` (different only in hard-coded color hex)

**Routes files (6 suites × 3 adapters = 18 copies):**

- `accessibility/accessibility.routes.ts`
- `conditional-visibility/conditional-visibility.routes.ts`
- `expression-logic/expression-logic.routes.ts`
- `form-submission/form-submission.routes.ts`
- `validation/validation.routes.ts`
- `multi-page/multi-page.routes.ts`

**Suite registry files (same 6 suites × 3 adapters = 18 copies)**

**Individual scenario files (~40+ files × 3 adapters):**

- All 5 accessibility scenarios: `all-fields-aria`, `aria-attributes`,
  `error-announcements`, `focus-management`, `keyboard-navigation`
- All 4 validation scenarios: `async-validation`, `custom-validator`,
  `email-validation`, `required-validation`
- Most conditional-visibility, expression-logic, form-submission,
  multi-page scenarios

**Estimated impact:** ~65% of test lines are pure duplication.

### Why this matters

- Any bug fix or improvement must be applied 3×
- Reviewers cannot tell which differences between adapters are intentional
  vs accidental drift
- This is the canonical AI code generation artifact: generate-and-paste
  per adapter instead of designing a shared contract

### Fix

1. Extract adapter-agnostic scenarios to
   `apps/examples/sandbox/src/app/testing/shared/scenarios/`
2. Extract common route/suite registrations to
   `apps/examples/sandbox/src/app/testing/shared/routes/`
3. Each adapter's testing folder imports from shared; overrides only what
   actually differs (selectors, CSS class names specific to that adapter's
   rendered output)

---

## Issue 2 — Pervasive `waitForTimeout` in new E2E specs

**Type:** `fix` | **Scope:** `sandbox`

### Problem

Per CLAUDE.md: _"Arbitrary delays, `setTimeout` workarounds, and skipped
tests are code smells."_

`waitForTimeout()` appears throughout the new E2E specs with hardcoded 200ms
delays:

| File                                                   | Count   |
| ------------------------------------------------------ | ------- |
| `testing/material/accessibility/accessibility.spec.ts` | **20×** |
| `testing/primeng/` (various specs)                     | 6×      |
| `testing/ionic/` (various specs)                       | 6×      |
| `testing/shared/test-utils.ts`                         | 1×      |

These hide race conditions between Angular's change detection and DOM
updates. They make tests slow and fragile — on slow CI they may still fail.

### Fix

Replace with Playwright's built-in auto-retry assertions:

```typescript
// BEFORE (fragile, slow):
await page.waitForTimeout(200);
await expect(input).toHaveAttribute('aria-invalid', 'true');

// AFTER (robust, no arbitrary wait):
await expect(input).toHaveAttribute('aria-invalid', 'true');
// Playwright retries this automatically up to the configured timeout
```

For cases requiring explicit synchronisation, use state-based waits:

- `expect(locator).toBeVisible()`
- `expect(locator).toHaveValue()`
- `page.waitForSelector('[aria-invalid="true"]')`

---

## Issue 3 — `test-scenario.component.ts` uses `any` cast + eslint-disable

**Type:** `fix` | **Scope:** `sandbox`

### Problem

`apps/examples/sandbox/src/app/testing/shared/test-scenario.component.ts`
(and all three adapter copies of it) contains:

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
resolve((event as any).detail.data);
```

This disables type checking on a `CustomEvent` instead of using the generic
form.

### Fix

```typescript
interface FormSubmittedEvent {
  detail: { data: Record<string, unknown>; testId: string };
}
resolve((event as unknown as FormSubmittedEvent).detail.data);
```

---

## Issue 4 — `input()` alias anti-pattern in shared test components

**Type:** `fix` | **Scope:** `sandbox`

### Problem

`test-scenario.component.ts` and `suite-index.component.ts` use:

```typescript
// eslint-disable-next-line @angular-eslint/no-input-rename
readonly config = input<...>(undefined, { alias: 'testConfig' });
```

This suppresses an eslint rule rather than just naming the property
correctly. The `alias` option exists for migrating public APIs — it is not
appropriate here.

### Fix

Rename the property to match its public name:

```typescript
readonly testConfig = input<...>();
```

---

## Issue 5 — Missing `ChangeDetectionStrategy.OnPush` on test components

**Type:** `fix` | **Scope:** `sandbox`

### Problem

All three adapter `TestIndexComponent` files are missing
`changeDetection: ChangeDetectionStrategy.OnPush`, violating the project
convention that all components must declare it explicitly.

**Files:**

- `testing/material/test-index.component.ts`
- `testing/primeng/test-index.component.ts`
- `testing/ionic/test-index.component.ts`

### Fix

Add to each component decorator:

```typescript
changeDetection: ChangeDetectionStrategy.OnPush,
```

---

## Issue 6 — `window.dispatchEvent()` without `isPlatformBrowser` guard

**Type:** `fix` | **Scope:** `sandbox`

### Problem

`apps/examples/sandbox/src/app/testing/shared/test-scenario.component.ts`
calls `window.dispatchEvent()` directly with no platform guard. Same issue
in `suite-index.component.ts` and `reactive-config-test.component.ts`.

Per CLAUDE.md SSR compatibility rules: browser APIs must be guarded.

### Fix

```typescript
const platformId = inject(PLATFORM_ID);

if (isPlatformBrowser(platformId)) {
  window.dispatchEvent(new CustomEvent(...));
}
```

---

## Issue 7 — Module-scoped `Map` in `suite-index.component.ts` breaks SSR

**Type:** `fix` | **Scope:** `sandbox`

### Problem

`apps/examples/sandbox/src/app/testing/shared/suite-index.component.ts`
initialises a `new Map()` as a class field. In SSR this Map persists across
requests and leaks state between renders.

Per CLAUDE.md: _"Never use module-scoped mutable state (Maps, caches,
singletons outside DI). These break SSR because they're shared across
requests."_

### Fix

Move the Map into a factory function or DI-scoped service, or ensure it is
recreated per component instance via a computed signal.

---

## Issue 8 — PrimeNG and Ionic missing test scenarios present in Material

**Type:** `test` | **Scope:** `sandbox`

### Problem

The new primeng and ionic test suites are missing scenarios that were added
for material, with no explanation for the omission.

**PrimeNG array-fields suite missing (10 scenarios):**

- `arrayButtonDisabledLogicScenario`
- `arrayButtonHiddenLogicScenario`
- `simplifiedArrayPrimitiveScenario`
- `simplifiedArrayObjectScenario`
- `simplifiedArrayEmptyScenario`
- `simplifiedArrayButtonCustomizationScenario`
- `simplifiedArrayButtonOptoutScenario`
- `simplifiedArrayConditionalScenario`
- `simplifiedArrayMinLengthScenario`
- `simplifiedArrayMaxLengthScenario`

Ionic is missing an even larger subset.

### Fix

Either:

1. Add the missing scenarios (preferred if the adapter supports the feature)
2. Add a comment in the suite file explaining why they're intentionally
   excluded — e.g. `// PrimeNG does not expose simplified array controls`
