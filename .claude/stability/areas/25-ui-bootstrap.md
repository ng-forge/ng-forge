# Area 25 — UI Adapter: Bootstrap

## Key Files

- `packages/dynamic-forms-bootstrap/src/lib/fields/` (11 field types)
- `packages/dynamic-forms-bootstrap/src/lib/directives/input-constraints.directive.ts` (unique to Bootstrap)
- `packages/dynamic-forms-bootstrap/src/lib/config/bootstrap-field-config.ts`
- `packages/dynamic-forms-bootstrap/src/lib/models/`
- `packages/dynamic-forms-bootstrap/src/lib/providers/bootstrap-providers.ts`
- `packages/dynamic-forms-bootstrap/src/lib/types/`
- `packages/dynamic-forms-bootstrap/src/lib/utils/create-aria-described-by.ts`
- `packages/dynamic-forms-bootstrap/src/lib/styles/_form-field.scss`

## Scenarios to Check

### Per-Field Checks (repeat for each of 11 field types)

- [ ] Component rendering — correct Bootstrap classes used
- [ ] Input mapping — all config props correctly mapped to component inputs
- [ ] Readonly state — correctly applied
- [ ] Disabled state — correctly applied
- [ ] Error display — `.invalid-feedback` shown at correct time
- [ ] Label/placeholder — correctly bound
- [ ] ARIA attributes — `aria-describedby`, `aria-required`, `aria-invalid`

### Bootstrap-Specific

- [ ] `InputConstraintsDirective` — what does it do? Unique to Bootstrap; verify correctness
- [ ] Radio group component — `bs-radio-group.component.ts` — grouping, accessibility
- [ ] Bootstrap grid integration — row field classes, responsive breakpoints
- [ ] Form control sizing — `form-control-sm`, `form-control-lg`
- [ ] Floating labels — if supported
- [ ] Validation states — `is-valid`, `is-invalid` classes, timing
- [ ] Button styles — Bootstrap button variants

## Known Findings

- None specific to Bootstrap adapter yet.
