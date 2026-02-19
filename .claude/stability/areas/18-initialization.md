# Area 18 — Initialization Tracking

## Key Files

- `packages/dynamic-forms/src/lib/utils/initialization-tracker/`
- `packages/dynamic-forms/src/lib/utils/emit-initialization/`
- `packages/dynamic-forms/src/lib/dynamic-form.component.ts` (initialized$ output, afterNextRender)

## Scenarios to Check

- [ ] `totalComponentsCount` — does it count recursively? Nested arrays? Nested groups?
- [ ] `ComponentInitializedEvent` — timing relative to derivation pipeline
- [ ] `(initialized)` output — does it wait for derivations to process first cycle?
- [ ] `emitComponentInitialized` — error handling when container throws before init
- [ ] `filter(isComplete)` — no `timeout()` operator; hangs forever if a component never initializes
- [ ] `afterNextRender` injection of DerivationOrchestrator — timing relative to initialized$
- [ ] Initialization with lazy-loaded field components — async resolution timing
- [ ] Initialization with zero fields — does it emit immediately?
- [ ] Initialization with all-hidden fields — does count match visible fields?
- [ ] Form value at `(initialized)` time — are derived values populated?

## Known Findings

- **B33** (medium) — `(initialized)` emits before derivation pipeline processes first cycle
- **B35** (high) — Initialization hang on container component throw; error silently swallowed, no timeout
- **B37** (medium) — `totalComponentsCount` undercounts nested array components → premature initialized
