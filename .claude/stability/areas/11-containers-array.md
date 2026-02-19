# Area 11 — Containers: Array

## Key Files

- `packages/dynamic-forms/src/lib/fields/array/array-field.component.ts`
- `packages/dynamic-forms/src/lib/utils/array-field/` (8 files — reconciliation, template matching)
- `packages/dynamic-forms/src/lib/events/constants/append-array-item.event.ts`
- `packages/dynamic-forms/src/lib/events/constants/prepend-array-item.event.ts`
- `packages/dynamic-forms/src/lib/events/constants/insert-array-item.event.ts`
- `packages/dynamic-forms/src/lib/events/constants/remove-array-item.event.ts`
- `packages/dynamic-forms/src/lib/events/constants/pop-array-item.event.ts`
- `packages/dynamic-forms/src/lib/events/constants/shift-array-item.event.ts`

## Scenarios to Check

- [ ] `addItem` / `appendItem` — does it check `maxLength`? What happens at/beyond limit?
- [ ] `removeItem` — async validator cancellation for removed item's fields
- [ ] `insertItem` at index — bounds check, negative index, index > length
- [ ] `prependItem` / `shiftItem` / `popItem` — edge cases with empty array
- [ ] `minLength` / `maxLength` validation — error message routing, `valid()` signal
- [ ] Nested arrays — `totalComponentsCount` tracking, initialization timing
- [ ] Array item differential updates pattern — reconciliation correctness
- [ ] Array item template matching — correct template selection for different item types
- [ ] Array field value filtering — all-or-nothing (hidden fields within items not filtered)
- [ ] Array item removal during active derivation — race conditions
- [ ] Array item field context — scoped injector lifecycle, cleanup on removal
- [ ] `stopOnUserOverride` + `reEngageOnDependencyChange` inside arrays — permanently blocked
- [ ] Array with zero items — rendering, validation state, form value shape

## Known Findings

- **B5/B17** (high) — `reEngageOnDependencyChange` never fires for intra-array-item dependencies
- **B6** (high) — No explicit async validator cancellation when array item removed
- **B27** (medium) — Appending beyond `maxLength` silently allowed; no UI indicator
- **B37** (medium) — `totalComponentsCount` undercounts nested array components → premature `(initialized)`
- Notable: Array field value filtering is all-or-nothing (intentional per tests)
