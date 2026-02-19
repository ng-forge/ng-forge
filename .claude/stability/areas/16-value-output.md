# Area 16 — Value Output & Filtering

## Key Files

- `packages/dynamic-forms/src/lib/utils/value-filter/value-filter.ts`
- `packages/dynamic-forms/src/lib/utils/frozen-values/frozen-values.ts`
- `packages/dynamic-forms/src/lib/core/values/` (7 files)
- `packages/dynamic-forms/src/lib/state/form-state-manager.ts` (formValue, filteredFormValue, entity)

## Scenarios to Check

- [ ] `filterFormValue` — correct filtering for hidden, disabled, readonly fields
- [ ] `excludeValueIfHidden` — cascade into array items? (Known: does NOT cascade)
- [ ] `excludeValueIfDisabled: false` — broken no-op (Angular already prunes disabled values)
- [ ] `excludeValueIfReadonly` — works correctly (confirmed clean)
- [ ] `filteredFormValue` allocation — fresh object every keystroke, no reference preservation
- [ ] Frozen values — what is frozen, when, why? Mutation protection?
- [ ] Dynamic value factory — how initial/default values are created from config
- [ ] Type predicates in core/values — correctness for all field types
- [ ] Form value shape — nested groups as objects, arrays as arrays, flat fields as scalars
- [ ] `[(value)]` two-way binding — triggers derivations correctly (confirmed)
- [ ] Form value with undefined fields — missing vs explicitly undefined
- [ ] `entity` linkedSignal — bidirectional sync, isEqual guard

## Known Findings

- **B28** (high) — `excludeValueIfDisabled: false` is a broken no-op
- **P1** (medium) — `isEqual` deep-compares entire form value on every keystroke
- **P2** (medium) — `filterFormValue` allocates new result object every keystroke
- Confirmed clean: `excludeValueIfReadonly`, `[(value)]` two-way binding
