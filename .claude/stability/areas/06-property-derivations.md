# Area 06 — Property Derivations

## Key Files

- `packages/dynamic-forms/src/lib/core/property-derivation/apply-property-overrides.ts`
- `packages/dynamic-forms/src/lib/core/property-derivation/` (all 15 files)

## Scenarios to Check

- [ ] Property derivation `disabled: true` vs logic condition `disabled` — independent systems, no merge/precedence
- [ ] Property derivation `readonly` — does it apply at component input AND form control level?
- [ ] Property derivation `hidden` — does it interact with condition-based visibility?
- [ ] Property derivation `label`, `placeholder`, `options` — correct mapping to component inputs?
- [ ] Property derivation on array item fields — scoped correctly to item context?
- [ ] Property derivation timing — runs after or before value derivations?
- [ ] Property derivation with undefined/null return — clears the property or no-op?
- [ ] Property derivation collection — how overrides are gathered across config
- [ ] Property derivation orchestration — scheduling, batching, signal updates

## Known Findings

- **B26** (high) — Property derivation `disabled: true` applies only to component input layer, not Angular Signal Form control. Validators still run, value stays in form output, keyboard nav may reach it.
