# Area 26 — UI Adapter: PrimeNG

## Key Files

- `packages/dynamic-forms-primeng/src/lib/fields/` (11 field types)
- `packages/dynamic-forms-primeng/src/lib/fields/datepicker/datepicker-control.component.ts` (unique wrapper)
- `packages/dynamic-forms-primeng/src/lib/fields/select/select-control.component.ts` (unique wrapper)
- `packages/dynamic-forms-primeng/src/lib/fields/textarea/textarea-control.component.ts` (unique wrapper)
- `packages/dynamic-forms-primeng/src/lib/fields/radio/radio-group.component.ts`
- `packages/dynamic-forms-primeng/src/lib/config/primeng-field-config.ts`
- `packages/dynamic-forms-primeng/src/lib/models/`
- `packages/dynamic-forms-primeng/src/lib/providers/primeng-providers.ts`
- `packages/dynamic-forms-primeng/src/lib/types/`
- `packages/dynamic-forms-primeng/src/lib/utils/create-aria-described-by.ts`

## Scenarios to Check

### Per-Field Checks (repeat for each of 11 field types)

- [ ] Component rendering — correct PrimeNG component used
- [ ] Input mapping — all config props correctly mapped
- [ ] Readonly state — correctly applied
- [ ] Disabled state — correctly applied
- [ ] Error display — PrimeNG message component, timing
- [ ] ARIA attributes — correct usage with PrimeNG components

### PrimeNG-Specific

- [ ] Control wrapper components — datepicker, select, textarea have separate `-control.component.ts`; why? What do they wrap?
- [ ] Control wrapper value binding — correct two-way binding through wrapper
- [ ] Radio group component — grouping, accessibility
- [ ] PrimeNG theme integration — respects theme tokens?
- [ ] Select with options — PrimeNG Dropdown, option rendering, filtering
- [ ] Datepicker — PrimeNG Calendar, locale, date format
- [ ] Multi-checkbox — PrimeNG checkbox group rendering

## Known Findings

- None specific to PrimeNG adapter yet.
