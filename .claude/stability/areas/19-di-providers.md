# Area 19 — DI & Providers

## Key Files

- `packages/dynamic-forms/src/lib/providers/dynamic-form-di.ts`
- `packages/dynamic-forms/src/lib/providers/` (all 9 files)
- `packages/dynamic-forms/src/lib/providers/features/` (3 files)

## Scenarios to Check

- [ ] `provideDynamicForm()` missing entirely — error quality, timing of error
- [ ] Two `provideDynamicForm()` on same page — isolation or conflict?
- [ ] Feature token ordering — does `withFeature()` registration order matter?
- [ ] `provideDynamicFormDI()` — creates all component-level providers; verify completeness
- [ ] Built-in fields registration — `withBuiltInFields()` correctness
- [ ] Logger feature — `withLogger()` configuration
- [ ] Value exclusion feature — `withValueExclusion()` configuration
- [ ] Event emission feature — configuration correctness
- [ ] Circular dependency fix — `DERIVATION_ORCHESTRATOR` depends on FormStateManager, not DynamicForm
- [ ] Provider scoping — all services component-scoped, nothing leaks to root

## Known Findings

- Confirmed clean: Concurrent forms are fully isolated via `provideDynamicFormDI()`
