# Area 27 — UI Adapter: Ionic

## Key Files

- `packages/dynamic-forms-ionic/src/lib/fields/` (11 field types)
- `packages/dynamic-forms-ionic/src/lib/fields/toggle/toggle-control.component.ts` (unique wrapper)
- `packages/dynamic-forms-ionic/src/lib/config/ionic-field-config.ts`
- `packages/dynamic-forms-ionic/src/lib/models/`
- `packages/dynamic-forms-ionic/src/lib/providers/ionic-providers.ts`
- `packages/dynamic-forms-ionic/src/lib/types/field-types.ts` (extra file, unique to Ionic)
- `packages/dynamic-forms-ionic/src/lib/types/`
- `packages/dynamic-forms-ionic/src/lib/utils/create-aria-described-by.ts`

## Scenarios to Check

### Per-Field Checks (repeat for each of 11 field types)

- [ ] Component rendering — correct Ionic component used
- [ ] Input mapping — all config props correctly mapped
- [ ] Readonly state — correctly applied (Ionic quirks?)
- [ ] Disabled state — correctly applied
- [ ] Error display — Ionic error messaging, timing
- [ ] ARIA attributes — correct usage with Ionic components

### Ionic-Specific

- [ ] Toggle control wrapper — why separate wrapper? `ion-toggle` readonly gap?
- [ ] Toggle readonly → disabled merge — visually indistinguishable; is this documented?
- [ ] `field-types.ts` — extra file not present in other adapters; what's in it?
- [ ] Ionic form layout — `ion-item`, `ion-label` wrapping conventions
- [ ] Ionic Select — `ion-select` with `ion-select-option`, interface differences
- [ ] Ionic Datepicker — `ion-datetime` vs external picker
- [ ] Mobile-specific interactions — touch targets, swipe, long press

## Known Findings

- Ionic toggle/readonly — adapter limitation. `ion-toggle` has no native `readonly` attribute; the adapter merges readonly into disabled. A readonly toggle is visually indistinguishable from a disabled one.
