# Area 01 — State & Lifecycle

## Key Files

- `packages/dynamic-forms/src/lib/state/form-state-manager.ts`
- `packages/dynamic-forms/src/lib/state/form-state-machine.ts`
- `packages/dynamic-forms/src/lib/state/side-effect-scheduler.ts`
- `packages/dynamic-forms/src/lib/utils/submission-handler/submission-handler.ts`
- `packages/dynamic-forms/src/lib/state/` (all files)

## Scenarios to Check

- [ ] State machine transitions: uninitialized → initializing → ready → transitioning → ready — verify all transitions are valid, no illegal jumps
- [ ] Concurrent submit: what happens if `submit()` is called while `submitting()` is already true?
- [ ] Error during submit: does the form recover to `ready` state? Is `submitting` cleared?
- [ ] `reset()` — does it clear value, dirty, touched, pending, errors? Does it re-run validators?
- [ ] `clear()` — how does it differ from reset? Does it clear to empty or to defaults?
- [ ] `clear()` and `reset()` dirty flag behavior with Angular Signal Forms
- [ ] `stopOnUserOverride` + `reset()` deadlock scenario
- [ ] Dirty/touched propagation — does the parent form accurately reflect children?
- [ ] `submission.action` vs `(submitted)` output — different safety contracts?
- [ ] `submission.action` Promise rejection handling
- [ ] Config hot-swap during active submission — state machine accepts ConfigChange in any state
- [ ] Double-submit with Promise actions — switchMap cancels Observable wrapper but not the Promise
- [ ] SideEffectScheduler timing: blocking vs frame-boundary vs after-render — correct usage in each context?
- [ ] `formValue` computed chain — entity linkedSignal equality check, deep compare cost

## Known Findings

- **B7** (high) — `submission.action` bypasses pending-validator guard; unhandled Promise rejection
- **B10** (high) — `reset()` doesn't clear Angular dirty flag; `stopOnUserOverride` remains engaged; deadlock with derived fields
- **B28** (high) — `excludeValueIfDisabled: false` is a broken no-op (Angular already prunes disabled values)
- **B29** (high) — Config hot-swap during active submission has no guard
- **B30** (medium) — Double-submit: switchMap cancels Observable wrapper, not the Promise itself
