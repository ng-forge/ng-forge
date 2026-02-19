# Area 22 — Performance (Cross-Cutting)

## Key Files

- `packages/dynamic-forms/src/lib/utils/object-utils.ts` (isEqual, getChangedKeys)
- `packages/dynamic-forms/src/lib/utils/value-filter/value-filter.ts` (filterFormValue)
- `packages/dynamic-forms/src/lib/core/derivation/field-state-extractor.ts` (Proxy + Map per eval)
- `packages/dynamic-forms/src/lib/state/form-state-manager.ts` (entity linkedSignal, validKeys computed)
- `packages/dynamic-forms/src/lib/core/expressions/http-condition-logic-function.ts` (stableStringify)
- `packages/dynamic-forms/src/lib/utils/object-utils.ts` (getChangedKeys)

## Scenarios to Check

- [ ] `isEqual` — recursive depth-first with no subtree short-circuiting; benchmark on 100+ field form
- [ ] `isEqual` called twice per keystroke — entity linkedSignal guard + deps.value write-back guard
- [ ] `filterFormValue` — allocates fresh object every time; downstream can't use reference equality
- [ ] `formFieldState` Proxy + Map — created per expression evaluation; 10 conditions = 10 Proxy instances per cycle
- [ ] `validKeys` Set — new allocation on every computed re-evaluation
- [ ] `stableStringify` — called 3–5x per HTTP condition per form value change; recursive
- [ ] `getChangedKeys` — full key enumeration + deep compare on every form value emission
- [ ] `auditTime(0)` batching — effective? Verify it actually batches rapid keystrokes
- [ ] Signal equality checks — are computed signals using appropriate equality functions?
- [ ] Derivation pipeline throughput — how many derivations per frame on a complex form?
- [ ] Rendering performance — does `resolvedFields` signal stability prevent unnecessary re-renders?
- [ ] Large form scaling — 100 fields, 200 fields — where do bottlenecks appear?

## Known Findings

- **P1** (medium) — `isEqual` deep-compares entire form value on every keystroke; ~300+ comparisons on 100-field form
- **P2** (medium) — `filterFormValue` allocates fresh result object every keystroke
- **P3** (medium) — New Proxy + Map per expression evaluation that touches `formFieldState`
- **P4** (low) — `validKeys` creates new Set on every evaluation
- **P5** (medium) — `stableStringify` called 3–5x per HTTP condition per change
- **P6** (medium) — `getChangedKeys` full enumeration + deep compare on every emission
