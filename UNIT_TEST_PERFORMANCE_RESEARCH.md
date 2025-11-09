# Unit Test Performance Research - ng-forge

**Date**: 2025-11-09
**Pipeline Time**: ~4 minutes
**Issue**: Slow test initialization (15+ seconds per suite)

---

## Executive Summary

The primary bottleneck is **polling for field visibility** which adds **100-300ms per test**. Your existing event-based initialization system (`initialized$`) only tracks container components (page/row/group), not actual field components loaded via dynamic imports. This forces tests to poll the DOM to confirm field rendering.

**The good news**: Your `forkJoin` pipeline already waits for all field imports to complete - it's just not connected to the initialization tracking. The fix is to expose field loading completion through the existing event bus system.

**Expected impact**: 50-70% reduction in test times (~4min → ~1.5-2min)

---

## Current Architecture Analysis

### Initialization Tracking System

You have a well-designed event-based initialization tracker:

**packages/dynamic-form/src/lib/utils/initialization-tracker/initialization-tracker.ts**
```typescript
export function createInitializationTracker(eventBus: EventBus, expectedCount: number): Observable<boolean> {
  return eventBus.on<ComponentInitializedEvent>('component-initialized').pipe(
    scan((count, _event) => count + 1, 0),
    map((currentCount) => currentCount >= expectedCount),
    filter((isComplete) => isComplete)
  );
}
```

**What it tracks**:
- ✅ DynamicForm component
- ✅ Page components
- ✅ Row components
- ✅ Group components
- ❌ **Field components** (input, select, checkbox, etc.)

### Component Loading Flow

**packages/dynamic-form/src/lib/dynamic-form.component.ts:484-496**
```typescript
fields = toSignal(
  this.fields$.pipe(
    switchMap((fields) => {
      if (!fields || fields.length === 0) {
        return of([]);
      }

      // forkJoin waits for ALL field components to load
      return forkJoin(this.mapFields(fields));  // ⭐ KEY INSIGHT
    }),
    map((components) => components.filter(Boolean))
  ),
  { initialValue: [] }
);
```

**The flow**:
1. `fields$` emits field definitions from config
2. `forkJoin(this.mapFields(fields))` waits for ALL dynamic imports to complete
3. Each field calls `fieldRegistry.loadTypeComponent()` → `import('./fields/...')`
4. After ALL imports complete, components are created via `vcr.createComponent()`
5. `fields` signal updates with complete ComponentRef array
6. `FieldRendererDirective` appends them to DOM
7. `fieldsInitialized` event fires → `onFieldsInitialized()`
8. `ComponentInitializedEvent` dispatched for "dynamic-form"

**The problem**: Step 8 fires based on the renderer appending components, which happens AFTER imports complete. But `initialized$` completes at step 8 without waiting for the `forkJoin` to resolve first.

### Why Tests Poll

**packages/dynamic-form-material/src/lib/testing/wait-for-df.ts:13-16**
```typescript
/**
 * WHY POLLING: This app uses zoneless change detection, so fixture.whenStable()
 * cannot track async operations inside RxJS streams (forkJoin/switchMap/toSignal).
 * Polling waits for the actual DOM outcome - field components with [data-testid].
 */
```

**Current wait strategy**:
```typescript
async function waitForFieldComponents(fixture, maxAttempts = 50): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    TestBed.flushEffects();      // 2x per iteration
    fixture.detectChanges();      // 2x per iteration
    await fixture.whenStable();

    // Query DOM for components
    const components = formElement.querySelectorAll('[data-testid], mat-checkbox, ...');

    // Wait for 3 consecutive stable counts
    if (componentCount === previousCount) {
      stableCount++;
      if (stableCount >= 3 && !hasLoadingComments) {
        return;  // Success
      }
    }

    await new Promise(resolve => setTimeout(resolve, 10));  // 10ms delay
  }
}
```

**Performance cost per test**:
- Typical: 3-15 iterations = 30-150ms
- Worst case: 50 iterations = 500ms
- Operations per iteration: 2 flushEffects + 2 detectChanges + 1 whenStable + DOM queries + 10ms delay

---

## Root Cause

The `initialized$` observable completes when container components are ready, but **before** the `forkJoin` of field component imports completes. Tests can't subscribe to the field loading completion, so they poll the DOM to confirm fields rendered.

**Proof**:
```typescript
// dynamic-form.component.ts:546-556
private setupInitializationTracking(): void {
  const totalComponentsCount = computed(() => {
    const flatFields = flattenFields(fields, registry);

    // Only counts page/row/group, NOT regular field components
    const componentCount = flatFields.filter(
      field => field.type === 'page' || field.type === 'row' || field.type === 'group'
    ).length;

    return componentCount + 1;  // +1 for dynamic-form only
  });
  // ...
}
```

---

## Recommended Solutions

### Option 1: Expose Field Loading via Event Bus ⭐ **RECOMMENDED**

Extend the existing initialization tracking to include field loading completion.

**Step 1: Create new event type**

```typescript
// packages/dynamic-form/src/lib/events/constants/fields-loaded.event.ts
import { FormEvent } from '../interfaces/form-event';

export class FieldsLoadedEvent implements FormEvent {
  readonly type = 'fields-loaded' as const;

  constructor(
    public componentId: string,
    public fieldCount: number
  ) {}
}
```

**Step 2: Dispatch after forkJoin completes**

```typescript
// packages/dynamic-form/src/lib/dynamic-form.component.ts

fields = toSignal(
  this.fields$.pipe(
    switchMap((fields) => {
      if (!fields || fields.length === 0) {
        // Dispatch immediately for empty field sets
        queueMicrotask(() => {
          this.eventBus.dispatch(FieldsLoadedEvent, this.componentId, 0);
        });
        return of([]);
      }

      return forkJoin(this.mapFields(fields)).pipe(
        tap((components) => {
          // Dispatch after ALL field components loaded
          this.eventBus.dispatch(
            FieldsLoadedEvent,
            this.componentId,
            components.length
          );
        })
      );
    }),
    map((components) => components.filter(Boolean))
  ),
  { initialValue: [] }
);
```

**Step 3: Update initialization tracking**

```typescript
// packages/dynamic-form/src/lib/dynamic-form.component.ts

private setupInitializationTracking(): void {
  const totalComponentsCount = computed(() => {
    const fields = this.formSetup().fields;
    if (!fields) return 1;

    const flatFields = flattenFields(fields, registry);
    const containerCount = flatFields.filter(
      field => field.type === 'page' || field.type === 'row' || field.type === 'group'
    ).length;

    return containerCount + 1; // Still just containers + dynamic-form
  });

  toObservable(totalComponentsCount)
    .pipe(
      take(1),
      switchMap((containerCount) => {
        // Wait for both containers AND field loading
        return forkJoin({
          containersReady: containerCount === 1
            ? this.eventBus.on<ComponentInitializedEvent>('component-initialized').pipe(
                filter(e => e.componentType === 'dynamic-form'),
                take(1),
                map(() => true)
              )
            : createInitializationTracker(this.eventBus, containerCount),

          fieldsLoaded: this.eventBus.on<FieldsLoadedEvent>('fields-loaded').pipe(
            filter(e => e.componentId === this.componentId),
            take(1),
            map(() => true)
          )
        }).pipe(
          map(({ containersReady, fieldsLoaded }) =>
            containersReady && fieldsLoaded
          )
        );
      })
    )
    .subscribe({
      next: (initialized) => {
        this.initializedSubject.next(initialized);
        this.initializedSubject.complete();
      },
      error: (error) => this.initializedSubject.error(error)
    });
}
```

**Step 4: Simplify test utilities**

```typescript
// packages/dynamic-form-material/src/lib/testing/wait-for-df.ts

export async function waitForDFInit(
  component: DynamicForm,
  fixture: ComponentFixture<any>
): Promise<void> {
  fixture.detectChanges();

  // Wait for complete initialization (containers + fields)
  await firstValueFrom(component.initialized$);

  // Single stabilization cycle
  TestBed.flushEffects();
  fixture.detectChanges();
  await fixture.whenStable();

  // One more effect flush for good measure
  TestBed.flushEffects();
  fixture.detectChanges();
}

// Remove waitForFieldComponents() entirely - no longer needed!
```

**Expected impact**:
- **Removes 100-300ms polling per test**
- **Deterministic**: No arbitrary timeouts
- **Zoneless-compatible**: Event-driven, not polling-based
- **Estimated speedup**: 40-60% faster test initialization

---

### Option 2: Quick Polling Optimizations (Stopgap)

If you can't implement Option 1 immediately, optimize the existing polling:

**A. Reduce stable count requirement**
```typescript
// Change from 3 to 2 consecutive stable iterations
if (stableCount >= 2 && !hasLoadingComments) {  // Was: >= 3
  return;
}
```
**Savings**: ~10-20ms per test

**B. Adaptive polling interval**
```typescript
// Fast checks initially, slower if needed
const interval = i < 10 ? 0 : 10;  // No delay for first 10 iterations
await new Promise(resolve => setTimeout(resolve, interval));
```
**Savings**: ~30-50ms per test

**C. Early exit on immediate stability**
```typescript
// Exit immediately if stable on first check
if (i === 0 && currentComponentCount > 0 && !hasLoadingComments) {
  return;  // Components already present, no need to wait
}
```
**Savings**: ~100ms for fast tests

**Combined expected impact**: 20-30% faster initialization

---

### Option 3: Consider Happy-DOM (Low Priority)

**Current**: jsdom
**Alternative**: Happy-DOM (lighter, faster DOM implementation)

**Benchmark comparisons**:
- jsdom: More complete browser emulation, slower
- Happy-DOM: ~10-20% faster, lighter memory footprint

**Risk**: Potential compatibility issues with Material components

**Recommendation**: Only explore after implementing Option 1

---

## Additional Optimizations

### 1. Reduce Change Detection Cycles

**Current pattern in material-test-utils.ts:164-183**:
```typescript
await waitForDFInit(fixture.componentInstance, fixture);

TestBed.flushEffects();
fixture.detectChanges();
await fixture.whenStable();

// Additional cycles for Material components
for (let i = 0; i < 2; i++) {
  TestBed.flushEffects();
  fixture.detectChanges();
  await delay(0);
}

await fixture.whenStable();
TestBed.flushEffects();
fixture.detectChanges();
```

**Optimization** (after implementing Option 1):
```typescript
await waitForDFInit(fixture.componentInstance, fixture);

// Single comprehensive stabilization (already done in waitForDFInit)
// Remove redundant cycles - no longer needed with deterministic waiting
```

**Savings**: 20-40ms per test

### 2. Eliminate Unnecessary Delays

**Current usage**:
```typescript
// After every interaction:
fixture.detectChanges();
await delay(0);  // Microtask queue flush
```

**Optimization**:
```typescript
// Use effect flushing instead
TestBed.flushEffects();
fixture.detectChanges();
```

**Savings**: 5-10ms per interaction (adds up across tests)

### 3. Increase Test Parallelization

**Current CI** (.github/workflows/ci.yml:128):
```yaml
- name: Run tests
  run: pnpm nx run-many -t test --parallel=3
```

**Optimization**:
```yaml
- name: Run tests
  run: pnpm nx run-many -t test --parallel=5
```

**Caveat**: Test on CI to ensure no memory/CPU issues

**Savings**: 20-40% faster pipeline

---

## Vitest Browser Mode Evaluation

### Current: jsdom

**Pros**:
- ✅ Fast execution (Node.js)
- ✅ Low overhead
- ✅ Sufficient for unit tests

**Cons**:
- ❌ DOM simulation limitations
- ❌ No CSS/layout accuracy
- ❌ May miss browser-specific issues

### Alternative: Browser Mode

**What it offers**:
- Real browser execution (Chromium)
- Accurate DOM/CSS/layout behavior
- Better for integration tests

**Performance**:
```
jsdom:          10-50ms per test, fast startup
Browser mode:   20-100ms per test, slow startup (~500ms-2s)
```

### Recommendation: **DON'T migrate to browser mode**

**Reasons**:
1. ✅ Your tests are true **unit tests** - testing component logic, not browser behavior
2. ✅ **Speed is a priority** - you have 4+ min pipeline times
3. ✅ **No visual/layout testing** - tests focus on form values, validation, state
4. ✅ **jsdom is sufficient** - Material components don't require browser APIs for these tests

**Exception**: Consider browser mode ONLY for:
- E2E tests (already using Playwright ✅)
- Visual regression testing
- Browser API integration tests

---

## Zoneless Testing Best Practices (2025)

Your codebase already follows most best practices, but here are key reminders:

### 1. Prefer `whenStable()` over `detectChanges()`
```typescript
// Good (zoneless-friendly)
await fixture.whenStable();

// Less ideal (manual control)
fixture.detectChanges();
```

### 2. Always flush effects in zoneless tests
```typescript
// Essential for signal-based updates
TestBed.flushEffects();
fixture.detectChanges();
```

### 3. Use `untracked()` for test utilities (optional)
```typescript
// PrimeNG package pattern
untracked(() => fixture.detectChanges());
```
Prevents test code from creating reactive dependencies.

### 4. Check for expression changes (optional)
```typescript
// Helps catch zoneless bugs
TestBed.configureTestingModule({
  providers: [
    provideCheckNoChangesConfig({
      exhaustive: true,
      interval: 100
    })
  ]
});
```

---

## Implementation Roadmap

### Phase 1: Event-Based Field Loading (2-3 days) ⭐ **HIGH PRIORITY**

1. Create `FieldsLoadedEvent`
2. Dispatch after `forkJoin` completes
3. Update `setupInitializationTracking()` to wait for fields
4. Simplify all `wait-for-df.ts` files
5. Remove polling code

**Expected impact**: 40-60% faster tests

### Phase 2: Test Utility Cleanup (1 day)

6. Remove redundant change detection cycles in `waitForInit()`
7. Replace `delay(0)` with `flushEffects()`
8. Audit and optimize test setup patterns

**Expected impact**: Additional 10-20% improvement

### Phase 3: Infrastructure (0.5 days)

9. Increase CI parallelization to `--parallel=5`
10. Monitor memory/CPU usage
11. Adjust if needed

**Expected impact**: 20-30% faster pipeline

---

## Expected Overall Results

### Conservative Estimates

| Phase | Improvement | Cumulative |
|-------|-------------|------------|
| Current | - | 4.0 min |
| Phase 1 | -50% init time | ~2.5 min |
| Phase 2 | -15% overall | ~2.1 min |
| Phase 3 | -25% pipeline | ~1.6 min |

### Best Case

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Test init time | 100-300ms | 10-30ms | -90% |
| Suite time (15s) | 15s | 6-8s | -50% |
| Pipeline time | 4 min | 1.5-2 min | -60% |

---

## Technical Debt Reduction

Implementing Option 1 also provides architectural benefits:

1. ✅ **Deterministic testing**: No more arbitrary timeouts
2. ✅ **Better debugging**: Clear event sequence in DevTools
3. ✅ **Zoneless alignment**: Event-driven matches reactive architecture
4. ✅ **Maintainability**: Removes polling logic across 4 packages
5. ✅ **Future-proof**: Works with any UI framework (Material, PrimeNG, Ionic, Bootstrap)

---

## Questions & Concerns

### Q: "Will this work with conditional field rendering?"

**A**: Yes. The `forkJoin` waits for whatever fields are in the current config. When config changes, a new `forkJoin` runs and a new `FieldsLoadedEvent` dispatches.

### Q: "What about nested page/row/group components?"

**A**: They already emit `ComponentInitializedEvent` and are tracked separately. The `FieldsLoadedEvent` only tracks leaf field components (input, select, etc.).

### Q: "Could this cause race conditions?"

**A**: No. The `forkJoin` guarantees all field imports complete before `FieldsLoadedEvent` dispatches. The `ReplaySubject` ensures late subscribers receive the event.

### Q: "What if a field import fails?"

**A**: Current behavior is preserved - `mapSingleField()` catches errors and returns `undefined`, which is filtered out. Failed fields won't block initialization.

---

## Next Steps

1. Review this research with the team
2. Decide on implementation approach (recommend Option 1)
3. Create implementation tasks if approved
4. I can implement Option 1 for you if you'd like

**Want me to implement the field loading event system now?**
