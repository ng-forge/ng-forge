import { DestroyRef, Injector, signal, Signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { concatMap, Observable, of, Subject } from 'rxjs';
import { FormConfig } from '../models/form-config';
import { RegisteredFieldTypes } from '../models/registry/field-registry';
import {
  Action,
  createDestroyedState,
  createInitializingState,
  createReadyState,
  createTransitioningState,
  createUninitializedState,
  Effect,
  FormLifecycleState,
  FormSetup,
  FormStateAction,
  isReadyState,
  isTransitioningState,
  LifecycleState,
  Phase,
  SideEffect,
  StateTransition,
  TransitionResult,
} from './state-types';
import { assertNever } from '../utils/object-utils';
import { SideEffectScheduler } from './side-effect-scheduler';

/**
 * Configuration for the form state machine.
 *
 * @internal
 */
export interface FormStateMachineConfig<TFields extends RegisteredFieldTypes[] = RegisteredFieldTypes[]> {
  /** Injector for Angular service access */
  readonly injector: Injector;
  /** DestroyRef for cleanup */
  readonly destroyRef: DestroyRef;
  /** Side effect scheduler for controlled timing */
  readonly scheduler: SideEffectScheduler;
  /** Callback to create form setup from config */
  readonly createFormSetup: (config: FormConfig<TFields>) => FormSetup<TFields>;
  /** Callback to capture current form value */
  readonly captureValue: () => Record<string, unknown>;
  /** Callback to restore form value */
  readonly restoreValue: (values: Record<string, unknown>, validKeys: Set<string>) => void;
  /** Callback when form is created (for registration) */
  readonly onFormCreated?: (formSetup: FormSetup<TFields>) => void;
  /** Callback for logging/debugging state transitions */
  readonly onTransition?: (transition: StateTransition<TFields>) => void;
}

/**
 * RxJS-based state machine for form lifecycle management.
 *
 * Uses `concatMap` to ensure sequential action processing, guaranteeing:
 * - Teardown completes before new config is applied
 * - No race conditions during rapid config changes
 * - Deterministic state transitions
 *
 * State transitions follow a strict flow:
 * ```
 * uninitialized → initializing → ready
 *                                  ↓ (config change)
 *                            transitioning (teardown → applying → restoring)
 *                                  ↓
 *                                ready
 * ```
 *
 * @example
 * ```typescript
 * const machine = createFormStateMachine({
 *   injector,
 *   destroyRef,
 *   scheduler,
 *   createFormSetup: (config) => computeFormSetup(config),
 *   captureValue: () => formValue(),
 *   restoreValue: (values, validKeys) => restoreFormValues(values, validKeys),
 * });
 *
 * // Subscribe to state changes
 * machine.state$.subscribe(state => console.log('State:', state.type));
 *
 * // Dispatch actions
 * machine.dispatch({ type: Action.Initialize, config: formConfig });
 * machine.dispatch({ type: Action.ConfigChange, config: newConfig });
 * ```
 *
 * @internal
 */
export class FormStateMachine<TFields extends RegisteredFieldTypes[] = RegisteredFieldTypes[]> {
  private readonly config: FormStateMachineConfig<TFields>;
  private readonly actions$ = new Subject<FormStateAction<TFields>>();
  private readonly _state: WritableSignal<FormLifecycleState<TFields>>;

  /** Signal of current state - use this for deriving computed signals */
  readonly state: Signal<FormLifecycleState<TFields>>;

  /** Observable of current state - for RxJS interop */
  readonly state$: Observable<FormLifecycleState<TFields>>;

  /** Current state value (synchronous read) */
  get currentState(): FormLifecycleState<TFields> {
    return this._state();
  }

  constructor(config: FormStateMachineConfig<TFields>) {
    this.config = config;
    this._state = signal(createUninitializedState());
    this.state = this._state.asReadonly();
    this.state$ = toObservable(this._state, { injector: config.injector });

    this.setupActionProcessing();
  }

  /**
   * Dispatches an action to the state machine.
   *
   * Actions are processed sequentially via `concatMap`, ensuring
   * that long-running transitions (like teardown → apply → restore)
   * complete before the next action is processed.
   *
   * @param action - Action to dispatch
   */
  dispatch(action: FormStateAction<TFields>): void {
    this.actions$.next(action);
  }

  /**
   * Sets up sequential action processing.
   *
   * `concatMap` is critical here - it queues actions and processes them
   * one at a time, waiting for each Observable to complete before
   * processing the next. This prevents race conditions during config
   * transitions.
   */
  private setupActionProcessing(): void {
    this.actions$
      .pipe(
        concatMap((action) => this.processAction(action)),
        takeUntilDestroyed(this.config.destroyRef),
      )
      .subscribe();
  }

  /**
   * Processes a single action, returning an Observable that completes
   * when all side effects are finished.
   *
   * This is the core of the state machine - it:
   * 1. Computes the next state based on current state + action
   * 2. Updates state immediately
   * 3. Executes side effects with appropriate timing
   * 4. Dispatches follow-up actions as needed
   */
  private processAction(action: FormStateAction<TFields>): Observable<void> {
    const currentState = this._state();
    const result = this.computeTransition(currentState, action);

    // Record transition for debugging
    this.config.onTransition?.({
      from: currentState,
      to: result.state,
      action,
      timestamp: Date.now(),
    });

    // Update state immediately (synchronous)
    this._state.set(result.state);

    // Execute side effects (may be async)
    return this.executeSideEffects(result.sideEffects);
  }

  /**
   * Computes the next state and required side effects for an action.
   *
   * This is a pure function - given current state and action, it returns
   * the new state and side effects without modifying anything.
   */
  private computeTransition(state: FormLifecycleState<TFields>, action: FormStateAction<TFields>): TransitionResult<TFields> {
    switch (action.type) {
      case Action.Initialize:
        return this.handleInitialize(state, action.config);

      case Action.ConfigChange:
        return this.handleConfigChange(state, action.config);

      case Action.SetupComplete:
        return this.handleSetupComplete(state, action.formSetup as FormSetup<TFields>);

      case Action.TeardownComplete:
        return this.handleTeardownComplete(state);

      case Action.ApplyComplete:
        return this.handleApplyComplete(state, action.formSetup as FormSetup<TFields>);

      case Action.RestoreComplete:
        return this.handleRestoreComplete(state);

      case Action.Destroy:
        return this.handleDestroy();

      default:
        return assertNever(action);
    }
  }

  private handleInitialize(state: FormLifecycleState<TFields>, config: FormConfig<TFields>): TransitionResult<TFields> {
    // Can only initialize from uninitialized state
    if (state.type !== LifecycleState.Uninitialized) {
      return { state, sideEffects: [] };
    }

    return {
      state: createInitializingState(config),
      sideEffects: [{ type: Effect.CreateForm }],
    };
  }

  private handleConfigChange(state: FormLifecycleState<TFields>, config: FormConfig<TFields>): TransitionResult<TFields> {
    // Handle based on current state
    if (state.type === LifecycleState.Uninitialized) {
      // Treat as initialize
      return {
        state: createInitializingState(config),
        sideEffects: [{ type: Effect.CreateForm }],
      };
    }

    if (isReadyState(state)) {
      // Start transition from ready state - capture formSetup from ready state
      return {
        state: createTransitioningState(Phase.Teardown, state.config, config, state.formSetup),
        sideEffects: [{ type: Effect.CaptureValue }, { type: Effect.WaitFrameBoundary }],
      };
    }

    if (isTransitioningState(state)) {
      // Already transitioning - update pending config (latest wins), preserve formSetups
      return {
        state: createTransitioningState(
          state.phase,
          state.currentConfig,
          config,
          state.currentFormSetup,
          state.preservedValue,
          state.pendingFormSetup,
        ),
        sideEffects: [],
      };
    }

    // Other states (destroyed, initializing) - ignore
    return { state, sideEffects: [] };
  }

  private handleSetupComplete(state: FormLifecycleState<TFields>, formSetup: FormSetup<TFields>): TransitionResult<TFields> {
    // Setup complete during initialization
    if (state.type === LifecycleState.Initializing) {
      return {
        state: createReadyState(state.config, formSetup),
        sideEffects: [],
      };
    }

    return { state, sideEffects: [] };
  }

  private handleTeardownComplete(state: FormLifecycleState<TFields>): TransitionResult<TFields> {
    if (!isTransitioningState(state) || state.phase !== Phase.Teardown) {
      return { state, sideEffects: [] };
    }

    // Move to applying phase - carry currentFormSetup through
    return {
      state: createTransitioningState(
        Phase.Applying,
        state.currentConfig,
        state.pendingConfig,
        state.currentFormSetup,
        state.preservedValue,
      ),
      sideEffects: [{ type: Effect.CreateForm }],
    };
  }

  private handleApplyComplete(state: FormLifecycleState<TFields>, formSetup: FormSetup<TFields>): TransitionResult<TFields> {
    if (!isTransitioningState(state) || state.phase !== Phase.Applying) {
      return { state, sideEffects: [] };
    }

    // Check if we have values to restore
    if (state.preservedValue && Object.keys(state.preservedValue).length > 0) {
      // Move to restoring phase - store new formSetup as pendingFormSetup
      return {
        state: createTransitioningState(
          Phase.Restoring,
          state.currentConfig,
          state.pendingConfig,
          state.currentFormSetup,
          state.preservedValue,
          formSetup,
        ),
        sideEffects: [{ type: Effect.RestoreValues, values: state.preservedValue }],
      };
    }

    // No values to restore - go directly to ready
    return {
      state: createReadyState(state.pendingConfig, formSetup),
      sideEffects: [{ type: Effect.ClearPreservedValue }],
    };
  }

  private handleRestoreComplete(state: FormLifecycleState<TFields>): TransitionResult<TFields> {
    if (!isTransitioningState(state) || state.phase !== Phase.Restoring) {
      return { state, sideEffects: [] };
    }

    // Use pendingFormSetup computed during apply phase instead of recomputing
    const formSetup = state.pendingFormSetup ?? this.config.createFormSetup(state.pendingConfig);

    return {
      state: createReadyState(state.pendingConfig, formSetup),
      sideEffects: [{ type: Effect.ClearPreservedValue }],
    };
  }

  private handleDestroy(): TransitionResult<TFields> {
    return {
      state: createDestroyedState(),
      sideEffects: [{ type: Effect.Cleanup }],
    };
  }

  /**
   * Executes side effects in sequence using the scheduler.
   *
   * Returns an Observable that completes when all effects are done.
   * This is what makes `concatMap` work - each action's effects must
   * complete before the next action processes.
   */
  private executeSideEffects(effects: SideEffect[]): Observable<void> {
    if (effects.length === 0) {
      return of(undefined);
    }

    // Execute effects sequentially using reduce + concatMap
    return effects.reduce(
      (chain$, effect) => chain$.pipe(concatMap(() => this.executeSideEffect(effect))),
      of(undefined) as Observable<void>,
    );
  }

  private executeSideEffect(effect: SideEffect): Observable<void> {
    const { scheduler } = this.config;

    switch (effect.type) {
      case Effect.CaptureValue: {
        return scheduler.executeBlocking(() => {
          const value = this.config.captureValue();
          // Read current state (not the stale closure) to handle rapid config changes
          const state = this._state();
          if (isTransitioningState(state)) {
            this._state.set(
              createTransitioningState(
                state.phase,
                state.currentConfig,
                state.pendingConfig,
                state.currentFormSetup,
                value,
                state.pendingFormSetup,
              ),
            );
          }
        });
      }

      case Effect.WaitFrameBoundary: {
        return scheduler.executeAtFrameBoundary(() => {
          // Frame boundary reached - dispatch teardown complete
          this.dispatch({ type: Action.TeardownComplete });
        });
      }

      case Effect.CreateForm: {
        return scheduler.executeBlocking(() => {
          const state = this._state();

          let config: FormConfig<TFields> | undefined;
          if (state.type === LifecycleState.Initializing) {
            config = state.config;
          } else if (isTransitioningState(state) && state.phase === Phase.Applying) {
            config = state.pendingConfig;
          }

          if (!config) return;

          const formSetup = this.config.createFormSetup(config);
          this.config.onFormCreated?.(formSetup);

          if (state.type === LifecycleState.Initializing) {
            this.dispatch({ type: Action.SetupComplete, formSetup });
          } else if (isTransitioningState(state) && state.phase === Phase.Applying) {
            this.dispatch({ type: Action.ApplyComplete, formSetup });
          }
        });
      }

      case Effect.RestoreValues: {
        return scheduler.executeAfterRender(() => {
          const state = this._state();
          if (!isTransitioningState(state) || state.phase !== Phase.Restoring) return;

          // Use pendingFormSetup from state instead of recomputing
          const formSetup = state.pendingFormSetup ?? this.config.createFormSetup(state.pendingConfig);
          const validKeys = new Set(formSetup.schemaFields.map((f) => f.key).filter((key): key is string => key !== undefined));

          this.config.restoreValue(effect.values, validKeys);
          this.dispatch({ type: Action.RestoreComplete });
        });
      }

      case Effect.ClearPreservedValue: {
        // No-op - preserved value is automatically cleared on state transition
        return of(undefined);
      }

      case Effect.Cleanup: {
        // Cleanup is handled by DestroyRef
        return of(undefined);
      }

      default:
        return assertNever(effect);
    }
  }
}

/**
 * Creates a form state machine.
 *
 * @param config - Configuration for the state machine
 * @returns Configured FormStateMachine instance
 *
 * @internal
 */
export function createFormStateMachine<TFields extends RegisteredFieldTypes[]>(
  config: FormStateMachineConfig<TFields>,
): FormStateMachine<TFields> {
  return new FormStateMachine(config);
}
