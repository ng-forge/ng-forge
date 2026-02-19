# Area 05 — Derivations

## Key Files

- `packages/dynamic-forms/src/lib/core/derivation/derivation-orchestrator.ts`
- `packages/dynamic-forms/src/lib/core/derivation/derivation-sorter.ts`
- `packages/dynamic-forms/src/lib/core/derivation/derivation-applicator.ts`
- `packages/dynamic-forms/src/lib/core/derivation/http-derivation-stream.ts`
- `packages/dynamic-forms/src/lib/core/derivation/async-derivation-stream.ts`
- `packages/dynamic-forms/src/lib/core/derivation/cycle-detector.ts`
- `packages/dynamic-forms/src/lib/core/derivation/field-state-extractor.ts`
- `packages/dynamic-forms/src/lib/utils/derived-from-deferred/derived-from-deferred.ts`
- `packages/dynamic-forms/src/lib/core/derivation/` (all files)

## Scenarios to Check

- [ ] Derivation topological sort — diamond dependency graphs, correct ordering
- [ ] Array relative path double-indexing — `items.$.lineTotal` indexed as both full and bare key
- [ ] `appliedDerivations` set — is it cleared between while loop iterations?
- [ ] HTTP derivation cancellation on rapid signal changes — debounce/switchMap behavior
- [ ] HTTP derivation race on config hot-swap — in-flight request landing on new config
- [ ] `teardownHttpStreams()` — does it cancel requests or just unsubscribe?
- [ ] Async derivation race conditions — two in-flight streams, which wins?
- [ ] Async derivation compute returning non-iterable value — `from()` TypeError
- [ ] `reEngageOnDependencyChange` with intra-array-item dependencies
- [ ] `externalData` signal changes — derivations use `untracked()`, no reactive dependency
- [ ] `derivedFromDeferred` teardown timing — destroy before first emission
- [ ] Derivation cycle detection — max iteration truncation, warning quality
- [ ] Cross-system cycle (derivation ↔ logic condition) — no detection mechanism
- [ ] `exhaustMap` for onChange — can it drop form changes during active derivation?
- [ ] `stopOnUserOverride` + `reEngageOnDependencyChange` inside arrays — permanently blocked?
- [ ] Derivation on a hidden field — does it still execute?
- [ ] Derivation on a disabled field — does it still write?

## Known Findings

- **B1** (high) — Derivation sorter double-indexing + `appliedDerivations` not cleared between iterations
- **B4** (critical) — HTTP derivation race on config hot-swap — silent data overwrite
- **B5/B17** (high) — `reEngageOnDependencyChange` never fires for intra-array-item dependencies
- **B11** (high) — `externalData` signal changes do not trigger derivation re-evaluation
- **B20** (medium) — Async derivation compute returning plain non-iterable throws uncaught TypeError
- **B21** (medium) — Cross-system cycle (derivation ↔ logic condition) has no detection
- **B36** (low) — Stale `explicitEffect` dependency in group field
