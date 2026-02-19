# Area 24 — UI Adapter: Material

## Key Files

- `packages/dynamic-forms-material/src/lib/fields/` (11 field types: button, checkbox, datepicker, input, multi-checkbox, radio, select, slider, textarea, toggle)
- `packages/dynamic-forms-material/src/lib/config/material-field-config.ts`
- `packages/dynamic-forms-material/src/lib/models/`
- `packages/dynamic-forms-material/src/lib/providers/material-providers.ts`
- `packages/dynamic-forms-material/src/lib/types/`
- `packages/dynamic-forms-material/src/lib/utils/create-aria-described-by.ts`
- `packages/dynamic-forms-material/src/lib/styles/_form-field.scss`

## Scenarios to Check

### Per-Field Checks (repeat for each of 11 field types)

- [ ] Component rendering — correct Material component used
- [ ] `propsToMeta` — correct metadata mapping from config
- [ ] Input mapping — all config props correctly mapped to component inputs
- [ ] Readonly state — correctly applied (visual + interaction blocked)
- [ ] Disabled state — correctly applied via Material's disabled input
- [ ] Error display — `mat-error` shown at correct time, correct message
- [ ] Label/placeholder — correctly bound
- [ ] Required indicator — asterisk shown when required
- [ ] ARIA attributes — `aria-describedby`, `aria-required`, `aria-invalid`

### Material-Specific

- [ ] `MatFormField` wrapping — consistent across all value fields
- [ ] Datepicker — Material datepicker integration, locale, format
- [ ] Select — option rendering, optgroup support, multiple selection
- [ ] Multi-checkbox — layout, label positioning
- [ ] Slider — min/max/step props, thumb label
- [ ] Toggle — slide toggle, label position
- [ ] Button variants — all button types (submit, next, previous, array actions)
- [ ] Theming — respects Material theme tokens
- [ ] Form field appearance — `fill` vs `outline`, configurable?

## Known Findings

- Adapter field type collision logs a warning and last-registered wins (intentional)
