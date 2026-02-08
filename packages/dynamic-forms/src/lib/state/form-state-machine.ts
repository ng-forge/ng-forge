import { DestroyRef, Injector, signal, Signal, untracked, WritableSignal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { catchError, concatMap, EMPTY, Observable, of, Subject } from 'rxjs';
import { FormConfig } from '../models/form-config';
import { Logger } from '../providers/features/logger/logger.interface';
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
  readonly createFormSetup: (config: FormConfig<TFields>) => FormSetup;
  /** Callback to capture current form value */
  readonly captureValue: () => Record<string, unknown>;
  /** Callback to restore form value */
  readonly restoreValue: (values: Record<string, unknown>, validKeys: Set<string>) => void;
  /** Predicate returning true when the field pipeline has already settled (all components cached) */
  readonly isFieldPipelineSettled?: () => boolean;
  /** Callback when form is created (for registration) */
  readonly onFormCreated?: (formSetup: FormSetup) => void;
  /** Logger instance for error reporting */
  readonly logger: Logger;
  /** Callback for logging/debugging state transitions */
  readonly onTransition?: (transition: StateTransition<TFields>) => void;
  /** Callback when an action fails and error recovery runs */
  readonly onError?: (error: unknown, action: FormStateAction<TFields>) => void;
}

/**
 * RxJS-based state machine for form lifecycle management.
 * Uses `concatMap` for sequential action processing.
 *
 * Flow: uninitialized → initializing → ready ⇄ transitioning (teardown → applying → restoring)
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

  /** Dispatches an action. Processed sequentially via `concatMap`. */
  dispatch(action: FormStateAction<TFields>): void {
    this.actions$.next(action);
  }

  /** Sets up sequential action processing via `concatMap`. */
  private setupActionProcessing(): void {
    this.actions$
      .pipe(
        concatMap((action) =>
          this.processAction(action).pipe(
            catchError((error) => {
              this.config.logger.error(`Action '${action.type}' failed:`, error);
              this.recoverFromError(error, action);
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(this.config.destroyRef),
      )
      .subscribe();
  }

  /**
   * Processes a single action: computes next state (pure), updates `_state`,
   * then executes side effects. Effects may dispatch follow-up actions that
   * are queued via `concatMap` and go through the same transition pipeline.
   */
  private processAction(action: FormStateAction<TFields>): Observable<void> {
    const currentState = this._state();
    const result = this.computeTransition(currentState, action);

    this.config.onTransition?.({
      from: currentState,
      to: result.state,
      action,
      timestamp: Date.now(),
    });

    this._state.set(result.state);
    return this.executeSideEffects(result.sideEffects);
  }

  /**
   * Recovers from a failed action by reverting to the last stable state.
   * Initializing → Uninitialized, Transitioning → Ready (using current setup).
   */
  private recoverFromError(error: unknown, action: FormStateAction<TFields>): void {
    const state = this._state();

    if (state.type === LifecycleState.Initializing) {
      this._state.set(createUninitializedState());
    } else if (isTransitioningState(state)) {
      this._state.set(createReadyState(state.currentConfig, state.currentFormSetup));
    }

    this.config.onError?.(error, action);
  }

  /** Pure transition: current state + action → next state + side effects. */
  private computeTransition(state: FormLifecycleState<TFields>, action: FormStateAction<TFields>): TransitionResult<TFields> {
    switch (action.type) {
      case Action.Initialize:
        return this.handleInitialize(state, action.config);

      case Action.ConfigChange:
        return this.handleConfigChange(state, action.config);

      case Action.SetupComplete:
        return this.handleSetupComplete(state, action.formSetup as FormSetup);

      case Action.ValueCaptured:
        return this.handleValueCaptured(state, action.value);

      case Action.TeardownComplete:
        return this.handleTeardownComplete(state);

      case Action.ApplyComplete:
        return this.handleApplyComplete(state, action.formSetup as FormSetup);

      case Action.RestoreComplete:
        return this.handleRestoreComplete(state);

      case Action.Destroy:
        return this.handleDestroy();

      default:
        return assertNever(action);
    }
  }

  private handleInitialize(state: FormLifecycleState<TFields>, config: FormConfig<TFields>): TransitionResult<TFields> {
    if (state.type !== LifecycleState.Uninitialized) {
      return { state, sideEffects: [] };
    }

    return {
      state: createInitializingState(config),
      sideEffects: [{ type: Effect.CreateForm }],
    };
  }

  private handleConfigChange(state: FormLifecycleState<TFields>, config: FormConfig<TFields>): TransitionResult<TFields> {
    if (state.type === LifecycleState.Uninitialized) {
      return {
        state: createInitializingState(config),
        sideEffects: [{ type: Effect.CreateForm }],
      };
    }

    if (state.type === LifecycleState.Initializing) {
      return {
        state: createInitializingState(config),
        sideEffects: [{ type: Effect.CreateForm }],
      };
    }

    if (isReadyState(state)) {
      return {
        state: createTransitioningState(Phase.Teardown, state.config, config, state.formSetup),
        sideEffects: [{ type: Effect.CaptureValue }, { type: Effect.WaitFrameBoundary }],
      };
    }

    if (isTransitioningState(state)) {
      // Already transitioning — update pending config (latest wins)
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

    return { state, sideEffects: [] };
  }

  private handleSetupComplete(state: FormLifecycleState<TFields>, formSetup: FormSetup): TransitionResult<TFields> {
    if (state.type === LifecycleState.Initializing) {
      return {
        state: createReadyState(state.config, formSetup),
        sideEffects: [],
      };
    }

    return { state, sideEffects: [] };
  }

  private handleValueCaptured(state: FormLifecycleState<TFields>, value: Record<string, unknown>): TransitionResult<TFields> {
    if (!isTransitioningState(state)) {
      return { state, sideEffects: [] };
    }

    return {
      state: createTransitioningState(
        state.phase,
        state.currentConfig,
        state.pendingConfig,
        state.currentFormSetup,
        value,
        state.pendingFormSetup,
      ),
      sideEffects: [],
    };
  }

  private handleTeardownComplete(state: FormLifecycleState<TFields>): TransitionResult<TFields> {
    if (!isTransitioningState(state) || state.phase !== Phase.Teardown) {
      return { state, sideEffects: [] };
    }

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

  private handleApplyComplete(state: FormLifecycleState<TFields>, formSetup: FormSetup): TransitionResult<TFields> {
    if (!isTransitioningState(state) || state.phase !== Phase.Applying) {
      return { state, sideEffects: [] };
    }

    if (state.preservedValue && Object.keys(state.preservedValue).length > 0) {
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

    return {
      state: createReadyState(state.pendingConfig, formSetup),
      sideEffects: [],
    };
  }

  private handleRestoreComplete(state: FormLifecycleState<TFields>): TransitionResult<TFields> {
    if (!isTransitioningState(state) || state.phase !== Phase.Restoring) {
      return { state, sideEffects: [] };
    }

    if (!state.pendingFormSetup) {
      this.config.logger.warn(
        'handleRestoreComplete: pendingFormSetup was not set — falling back to recomputing. ' +
          'This indicates a bug in the transition flow.',
      );
    }
    const formSetup = state.pendingFormSetup ?? this.config.createFormSetup(state.pendingConfig);

    return {
      state: createReadyState(state.pendingConfig, formSetup),
      sideEffects: [],
    };
  }

  private handleDestroy(): TransitionResult<TFields> {
    return {
      state: createDestroyedState(),
      sideEffects: [],
    };
  }

  /**
   * Executes side effects in sequence. Effects may call `this.dispatch()` internally,
   * queuing follow-up actions into the same `concatMap` pipeline.
   */
  private executeSideEffects(effects: SideEffect[]): Observable<void> {
    if (effects.length === 0) {
      return of(undefined);
    }

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
          this.dispatch({ type: Action.ValueCaptured, value });
        });
      }

      case Effect.WaitFrameBoundary: {
        return scheduler.executeAtFrameBoundary(
          () => {
            this.dispatch({ type: Action.TeardownComplete });
          },
          { skipIf: this.config.isFieldPipelineSettled },
        );
      }

      case Effect.CreateForm: {
        return scheduler.executeBlocking(() => {
          const state = untracked(() => this._state());

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
          const state = untracked(() => this._state());
          if (!isTransitioningState(state) || state.phase !== Phase.Restoring) return;

          if (!state.pendingFormSetup) {
            this.config.logger.warn('RestoreValues effect: pendingFormSetup was not set — falling back to recomputing.');
          }
          const formSetup = state.pendingFormSetup ?? this.config.createFormSetup(state.pendingConfig);
          const validKeys = new Set(formSetup.schemaFields.map((f) => f.key).filter((key): key is string => key !== undefined));

          this.config.restoreValue(effect.values, validKeys);
          this.dispatch({ type: Action.RestoreComplete });
        });
      }

      default:
        return assertNever(effect);
    }
  }
}

/** @internal */
export function createFormStateMachine<TFields extends RegisteredFieldTypes[]>(
  config: FormStateMachineConfig<TFields>,
): FormStateMachine<TFields> {
  return new FormStateMachine(config);
}
