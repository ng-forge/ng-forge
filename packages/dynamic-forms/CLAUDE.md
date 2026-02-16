# @ng-forge/dynamic-forms — Core Library

## State Management Architecture

### FormStateManager (`state/form-state-manager.ts`)

Central state service — owns all form lifecycle state, field resolution, and event coordination.

Key signals: `activeConfig`, `formSetup`, `entity` (bidirectional form value), `form` (Angular Signal Form), `resolvedFields` (ready-to-render), `formValue`, `valid`, `dirty`, `errors`, `submitting`.

### FormStateMachine (`state/form-state-machine.ts`)

Lifecycle state machine with RxJS-based sequential action processing (`concatMap`).

```
uninitialized → initializing → ready ⇄ transitioning (teardown → applying → restoring)
```

Side effects are scheduled via `SideEffectScheduler`:

- **Blocking** — `CaptureValue`, `CreateForm`
- **Frame-boundary** — `WaitFrameBoundary` (teardown)
- **After-render** — `RestoreValues`

### Field Resolution Pipeline (`utils/resolve-field/resolve-field.ts`)

- `resolveField()` — async (RxJS Observable), loads component dynamically
- `resolveFieldSync()` — sync fast path using cached components
- `reconcileFields()` — preserves object identity for signal stability (same key + component + injector = unchanged)
- `createFieldResolutionPipe()` — container component utility (used by page/group/row)

### Provider Architecture (`providers/dynamic-form-di.ts`)

`provideDynamicFormDI()` creates all component-level providers. Fixes circular dependency: `DERIVATION_ORCHESTRATOR` depends on `FormStateManager`, not `DynamicForm`.

## File Structure

### Field Components (per UI adapter library)

```
packages/dynamic-forms-{library}/src/lib/fields/{field-name}/
├── {prefix}-{field-name}.component.ts       # Component
├── {prefix}-{field-name}.component.spec.ts  # Unit tests
├── {prefix}-{field-name}.type.ts            # Type definitions
├── {prefix}-{field-name}.type-test.ts       # Type-safe compile tests
└── index.ts                                 # Barrel export
```

| Library   | Prefix  | Example                    |
| --------- | ------- | -------------------------- |
| Material  | `Mat`   | `mat-input.component.ts`   |
| Bootstrap | `Bs`    | `bs-input.component.ts`    |
| PrimeNG   | `Prime` | `prime-input.component.ts` |
| Ionic     | `Ionic` | `ionic-input.component.ts` |

### Field Registration (per UI adapter)

Fields are wired via `FieldTypeDefinition[]` in each adapter's config:

1. Define `loadComponent` (dynamic import), `mapper`, `propsToMeta` in the field types array
2. Expose via provider function (e.g., `withMaterialFields()`)
3. Module augmentation extends `DynamicFormFieldRegistry` for type-safe autocomplete

### Available Field Types

**Value fields:** input, textarea, select, checkbox, radio, multi-checkbox, datepicker, toggle, slider

**Control fields:** button, submit, next, previous, addArrayItem, prependArrayItem, insertArrayItem, removeArrayItem, popArrayItem, shiftArrayItem

**Container fields:** array, group, page, row

**Display fields:** hidden, text

## Critical Gotchas

### Reactive cycle trap

Cannot call `mapFieldToInputs` inside a `computed` that IS `resolvedFields`. Mappers eagerly read `context.form` → `isFieldPipelineSettled` → `resolvedFields` → CYCLE. The `derivedFromDeferred` async pipeline avoids this via `toObservable`/`toSignal`.

### Teardown timing

Teardown MUST use `requestAnimationFrame` (frame-boundary), NOT `afterNextRender`. The `derivedFromDeferred` pipeline needs CD + microtask + CD (~2 renders) to settle. `afterNextRender` fires after 1 render — too fast. `requestAnimationFrame` (~16ms) gives the pipeline time to process.

### `_formCache` must be class-level

If `cachedForm` is a local var inside `fieldSignalContext` computed, it resets when the computed re-evaluates (e.g., when `defaultValues` changes during transitions), breaking the "hold until settled" pattern.

### `registerValidatorsFromConfig` bootstrap timing

Must run during bootstrap — called in the state machine's `createFormSetup` callback AND in the `formSetup` computed's uninitialized path (before `initialize` dispatches). Cannot be moved to constructor with `untracked(() => this.deps.config())` because `input.required()` signals throw when read before template binding.

### `COMPONENT_CACHE` token

In `inject-field-registry.ts` — caches loaded components for near-instant async re-resolution. SSR-safe because it's DI-scoped, not module-scoped.

### Container component utilities

- `RowField.fields` returns `readonly RowAllowedChildren[]` — needs cast to `FieldDef<unknown>[]` for `createFieldResolutionPipe`
- `DynamicFormLogger` is `InjectionToken<Logger>` — use `Logger` type for factory params
- `DERIVATION_LOG_CONFIG` is `InjectionToken<DerivationLogConfig>` — use `DerivationLogConfig` type

### `FormLifecycleTransitioning` state

Carries `currentFormSetup` + `pendingFormSetup` for single-source-of-truth state. `createTransitioningState()` signature: `(phase, currentConfig, pendingConfig, currentFormSetup, preservedValue?, pendingFormSetup?)`.

### Firefox E2E flakiness

Pre-existing flakiness across array-fields, row-fields, group-fields, multi-page, expression-logic, and comprehensive suites. Don't spend time debugging Firefox-only failures unless specifically asked.
