# Area 09 — Validation

## Key Files

- `packages/dynamic-forms/src/lib/core/validation/validator-factory.ts`
- `packages/dynamic-forms/src/lib/core/validation/` (all 5 files)
- `packages/dynamic-forms/src/lib/core/cross-field/cross-field-collector.ts`
- `packages/dynamic-forms/src/lib/core/cross-field/` (all 5 files)
- `packages/dynamic-forms/src/lib/utils/form-validation/`

## Scenarios to Check

- [ ] Cross-field validators timing — fire before or after derivation pass completes?
- [ ] Cross-field validators inside array items — explicitly do NOT recurse; documented?
- [ ] Async validators — cancellation on field value change, on field removal
- [ ] Async validators that never resolve — no timeout, form hangs permanently
- [ ] Async HTTP validators — cancellation, race conditions, `provideHttpClient` requirement
- [ ] Validator ordering — async vs sync execution order guarantees
- [ ] Built-in validators — edge cases: null, undefined, empty string, 0, NaN
- [ ] Validators on disabled fields — Angular Signal Forms does NOT suppress them
- [ ] `registerValidatorsFromConfig` — must run during bootstrap; verify timing
- [ ] Validator factory — how validators are created from config; error handling for invalid config
- [ ] Form validation utils — helper functions correctness

## Known Findings

- **B39** (high) — Cross-field validators read pre-derivation stale values; no ordering guarantee
- **B6** (high) — No explicit async validator cancellation when array item is removed
- **B9** (medium) — Async validators that never resolve hang the form permanently; no timeout
