# Area 08 — Logic Applicator

## Key Files

- `packages/dynamic-forms/src/lib/core/logic/logic-applicator.ts`
- `packages/dynamic-forms/src/lib/core/logic/field-logic-resolver.ts`
- `packages/dynamic-forms/src/lib/core/logic/non-field-logic-resolver.ts`
- `packages/dynamic-forms/src/lib/core/logic/` (all 5 files)

## Scenarios to Check

- [ ] Logic applicator — how field visibility (hidden/shown), disabled, readonly are applied to form controls
- [ ] Field logic resolver — resolves logic for value fields; timing with derivation pipeline
- [ ] Non-field logic resolver — resolves logic for containers, buttons; what subset of logic applies?
- [ ] Logic condition precedence — if both expression and function conditions exist, which wins?
- [ ] Logic applied to container vs leaf field — does hiding a group hide all children? Recursion?
- [ ] Logic condition change during derivation cycle — stale reads?
- [ ] Logic on array items — scoped to item or global?
- [ ] `disableWhenPageInvalid` — lives in non-field-logic-resolver; is button-only

## Known Findings

- **B3 (extended)** — `disableWhenPageInvalid: true` is button-only; programmatic `navigateToNextPage()` bypasses it
