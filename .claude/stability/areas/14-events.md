# Area 14 — Events & Event Bus

## Key Files

- `packages/dynamic-forms/src/lib/events/event.bus.ts`
- `packages/dynamic-forms/src/lib/events/constants/` (27 event type files)
- `packages/dynamic-forms/src/lib/events/interfaces/`
- `packages/dynamic-forms/src/lib/events/utils/`

## Scenarios to Check

- [ ] `EventBus.dispatch()` — exception isolation; synchronous throw in subscriber crashes component
- [ ] `pipeline$` Subject — subscriber exception kills the observable for all listeners
- [ ] `FORM_SUBMIT` event with validation failure — event fired or swallowed?
- [ ] Array events on destroyed component — event bus leak after teardown?
- [ ] Event ordering — are events guaranteed to fire in a specific order?
- [ ] `withEventFormValue` — attaches raw (unfiltered) form value; hidden/disabled values included
- [ ] Event bus lifecycle — creation, teardown, cleanup
- [ ] Custom event handlers — registration, execution context, error handling
- [ ] Event bus isolation between form instances
- [ ] All 27 event constants — verify each has correct metadata, typing

## Known Findings

- **B16** (high) — Event handler exceptions propagate uncaught; synchronous throw crashes component
- **B25** (high) — Subscriber exception in `(events)` output crashes entire event pipeline; no recovery
- Notable: `withEventFormValue` attaches raw unfiltered form value (undocumented)
