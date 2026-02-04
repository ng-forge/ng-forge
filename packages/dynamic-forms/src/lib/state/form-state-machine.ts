import { DestroyRef, Injector } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, concatMap, Observable, of, Subject } from 'rxjs';
import { RegisteredFieldTypes } from '../models/registry/field-registry';
import {
  createDestroyedState,
  createInitializingState,
  createReadyState,
  createTransitioningState,
  createUninitializedState,
  FormLifecycleState,
  FormSetup,
  FormStateAction,
  isReadyState,
  isTransitioningState,
  SideEffect,
  StateTransition,
  TransitionResult,
} from './state-types';
import { SideEffectScheduler } from './side-effect-scheduler';

/**
 * Configuration for the form state machine.
 *
 * @internal
 */
export interface FormStateMachineConfig {
  /** Injector for Angular service access */
  readonly injector: Injector;
  /** DestroyRef for cleanup */
  readonly destroyRef: DestroyRef;
  /** Side effect scheduler for controlled timing */
  readonly scheduler: SideEffectScheduler;
  /** Callback to create form setup from config */
  readonly createFormSetup: () => FormSetup;
  /** Callback to capture current form value */
  readonly captureValue: () => Record<string, unknown>;
  /** Callback to restore form value */
  readonly restoreValue: (values: Record<string, unknown>) => void;
  /** Callback when state changes */
  readonly onStateChange?: (state: FormLifecycleState) => void;
  /** Callback for logging/debugging state transitions */
  readonly onTransition?: (transition: StateTransition) => void;
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
 * const machine = new FormStateMachine({
 *   injector,
 *   destroyRef,
 *   scheduler,
 *   createFormSetup: () => this.computeFormSetup(this.config()),
 *   captureValue: () => this.formValue(),
 *   restoreValue: (values) => this.value.update(v => ({ ...v, ...values })),
 * });
 *
 * // Subscribe to state changes
 * machine.state$.subscribe(state => console.log('State:', state.type));
 *
 * // Dispatch actions
 * machine.dispatch({ type: 'initialize', config: formConfig });
 * machine.dispatch({ type: 'config-change', config: newConfig });
 * ```
 *
 * @internal
 */
export class FormStateMachine<TFields extends RegisteredFieldTypes[] = RegisteredFieldTypes[]> {
  private readonly config: FormStateMachineConfig;
  private readonly actions$ = new Subject<FormStateAction<TFields>>();
  private readonly _state$ = new BehaviorSubject<FormLifecycleState<TFields>>(createUninitializedState());
  private readonly _transitions$ = new Subject<StateTransition<TFields>>();

  /** Observable of current state */
  readonly state$: Observable<FormLifecycleState<TFields>> = this._state$.asObservable();

  /** Observable of state transitions (for debugging) */
  readonly transitions$: Observable<StateTransition<TFields>> = this._transitions$.asObservable();

  /** Current state value */
  get currentState(): FormLifecycleState<TFields> {
    return this._state$.value;
  }

  constructor(config: FormStateMachineConfig) {
    this.config = config;
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
   * 2. Determines required side effects
   * 3. Executes side effects with appropriate timing
   * 4. Updates state after each phase
   */
  private processAction(action: FormStateAction<TFields>): Observable<void> {
    const currentState = this._state$.value;
    const result = this.computeTransition(currentState, action);

    // Record transition for debugging
    const transition: StateTransition<TFields> = {
      from: currentState,
      to: result.state,
      action,
      timestamp: Date.now(),
    };
    this._transitions$.next(transition);
    this.config.onTransition?.(transition);

    // Update state
    this._state$.next(result.state);
    this.config.onStateChange?.(result.state);

    // Execute side effects
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
      case 'initialize':
        return this.handleInitialize(state, action.config);

      case 'config-change':
        return this.handleConfigChange(state, action.config);

      case 'setup-complete':
        return this.handleSetupComplete(state, action.formSetup as FormSetup<TFields>);

      case 'teardown-complete':
        return this.handleTeardownComplete(state);

      case 'apply-complete':
        return this.handleApplyComplete(state, action.formSetup as FormSetup<TFields>);

      case 'restore-complete':
        return this.handleRestoreComplete(state);

      case 'destroy':
        return this.handleDestroy();

      case 'value-update':
        // Value updates don't change lifecycle state
        return { state, sideEffects: [] };

      default:
        // Unknown action - no state change
        return { state, sideEffects: [] };
    }
  }

  private handleInitialize(
    state: FormLifecycleState<TFields>,
    config: FormStateAction<TFields>['type'] extends 'initialize' ? FormStateAction<TFields>['config'] : never,
  ): TransitionResult<TFields> {
    // Can only initialize from uninitialized state
    if (state.type !== 'uninitialized') {
      return { state, sideEffects: [] };
    }

    return {
      state: createInitializingState(config),
      sideEffects: [{ type: 'create-form' }],
    };
  }

  private handleConfigChange(
    state: FormLifecycleState<TFields>,
    config: FormStateAction<TFields>['type'] extends 'config-change' ? FormStateAction<TFields>['config'] : never,
  ): TransitionResult<TFields> {
    // Handle based on current state
    if (state.type === 'uninitialized') {
      // Treat as initialize
      return {
        state: createInitializingState(config),
        sideEffects: [{ type: 'create-form' }],
      };
    }

    if (isReadyState(state)) {
      // Start transition from ready state
      return {
        state: createTransitioningState('teardown', state.config, config),
        sideEffects: [{ type: 'capture-value' }, { type: 'wait-frame-boundary' }],
      };
    }

    if (isTransitioningState(state)) {
      // Already transitioning - update pending config (latest wins)
      return {
        state: createTransitioningState(state.phase, state.currentConfig, config, state.preservedValue),
        sideEffects: [],
      };
    }

    // Other states (destroyed, initializing) - ignore
    return { state, sideEffects: [] };
  }

  private handleSetupComplete(state: FormLifecycleState<TFields>, formSetup: FormSetup<TFields>): TransitionResult<TFields> {
    // Setup complete during initialization
    if (state.type === 'initializing') {
      return {
        state: createReadyState(state.config, formSetup),
        sideEffects: [],
      };
    }

    return { state, sideEffects: [] };
  }

  private handleTeardownComplete(state: FormLifecycleState<TFields>): TransitionResult<TFields> {
    if (!isTransitioningState(state) || state.phase !== 'teardown') {
      return { state, sideEffects: [] };
    }

    // Move to applying phase
    return {
      state: createTransitioningState('applying', state.currentConfig, state.pendingConfig, state.preservedValue),
      sideEffects: [{ type: 'create-form' }],
    };
  }

  private handleApplyComplete(state: FormLifecycleState<TFields>, formSetup: FormSetup<TFields>): TransitionResult<TFields> {
    if (!isTransitioningState(state) || state.phase !== 'applying') {
      return { state, sideEffects: [] };
    }

    // Check if we have values to restore
    if (state.preservedValue && Object.keys(state.preservedValue).length > 0) {
      // Move to restoring phase
      return {
        state: createTransitioningState('restoring', state.currentConfig, state.pendingConfig, state.preservedValue),
        sideEffects: [{ type: 'restore-values', values: state.preservedValue }],
      };
    }

    // No values to restore - go directly to ready
    return {
      state: createReadyState(state.pendingConfig, formSetup),
      sideEffects: [{ type: 'clear-preserved-value' }],
    };
  }

  private handleRestoreComplete(state: FormLifecycleState<TFields>): TransitionResult<TFields> {
    if (!isTransitioningState(state) || state.phase !== 'restoring') {
      return { state, sideEffects: [] };
    }

    // Transition complete - move to ready with new config
    // We need the formSetup here - compute it from pending config
    const formSetup = this.config.createFormSetup();

    return {
      state: createReadyState(state.pendingConfig, formSetup as FormSetup<TFields>),
      sideEffects: [{ type: 'clear-preserved-value' }],
    };
  }

  private handleDestroy(): TransitionResult<TFields> {
    return {
      state: createDestroyedState(),
      sideEffects: [{ type: 'cleanup' }],
    };
  }

  /**
   * Executes side effects in sequence.
   *
   * Returns an Observable that completes when all effects are done.
   * This is what makes `concatMap` work - each action's effects must
   * complete before the next action processes.
   */
  private executeSideEffects(effects: SideEffect[]): Observable<void> {
    if (effects.length === 0) {
      return of(undefined);
    }

    // Execute effects sequentially
    return effects.reduce((chain$, effect) => chain$.pipe(concatMap(() => this.executeSideEffect(effect))), of(undefined));
  }

  private executeSideEffect(effect: SideEffect): Observable<void> {
    switch (effect.type) {
      case 'capture-value': {
        return this.config.scheduler.executeBlocking(() => {
          const value = this.config.captureValue();
          // Store preserved value in state
          const state = this._state$.value;
          if (isTransitioningState(state)) {
            this._state$.next(createTransitioningState(state.phase, state.currentConfig, state.pendingConfig, value));
          }
        });
      }

      case 'wait-frame-boundary': {
        return this.config.scheduler.executeAtFrameBoundary(() => {
          // Frame boundary reached - dispatch teardown complete
          this.dispatch({ type: 'teardown-complete' });
        });
      }

      case 'create-form': {
        return this.config.scheduler.executeBlocking(() => {
          const formSetup = this.config.createFormSetup();
          const state = this._state$.value;

          if (state.type === 'initializing') {
            this.dispatch({ type: 'setup-complete', formSetup: formSetup as FormSetup<TFields> });
          } else if (isTransitioningState(state) && state.phase === 'applying') {
            this.dispatch({ type: 'apply-complete', formSetup: formSetup as FormSetup<TFields> });
          }
        });
      }

      case 'restore-values': {
        return this.config.scheduler.executeAfterRender(() => {
          this.config.restoreValue(effect.values);
          this.dispatch({ type: 'restore-complete' });
        });
      }

      case 'clear-preserved-value': {
        return this.config.scheduler.executeBlocking(() => {
          // No-op - preserved value is automatically cleared on state transition
        });
      }

      case 'cleanup': {
        return this.config.scheduler.executeBlocking(() => {
          // Cleanup is handled by DestroyRef
        });
      }

      default:
        return of(undefined);
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
export function createFormStateMachine<TFields extends RegisteredFieldTypes[]>(config: FormStateMachineConfig): FormStateMachine<TFields> {
  return new FormStateMachine(config);
}
