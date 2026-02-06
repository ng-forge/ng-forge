/**
 * State management module for dynamic forms.
 *
 * This module provides:
 * - `FormStateManager`: Service that owns all form state
 * - `FormStateMachine`: RxJS-based state machine for lifecycle management
 * - `SideEffectScheduler`: Controlled timing for side effects
 * - State types and type guards
 *
 * @packageDocumentation
 */

// Core service
export { FormStateManager, FormStateManagerDeps } from './form-state-manager';

// State machine
export { FormStateMachine, FormStateMachineConfig, createFormStateMachine } from './form-state-machine';

// Side effect scheduler
export { SideEffectScheduler, SideEffectOptions, createSideEffectScheduler } from './side-effect-scheduler';

// State types
export {
  // Discriminant constants
  LifecycleState,
  Phase,
  Action,
  Effect,

  // Discriminant value types
  LifecycleStateType,
  PhaseType,
  ActionType,
  EffectType,

  // Lifecycle states
  FormLifecycleState,
  FormLifecycleUninitialized,
  FormLifecycleInitializing,
  FormLifecycleReady,
  FormLifecycleTransitioning,
  FormLifecycleDestroyed,
  TransitionPhase,

  // Form setup
  FormSetup,

  // Actions
  FormStateAction,
  InitializeAction,
  ConfigChangeAction,
  SetupCompleteAction,
  ValueCapturedAction,
  TeardownCompleteAction,
  ApplyCompleteAction,
  RestoreCompleteAction,
  DestroyAction,

  // Transitions
  StateTransition,
  TransitionResult,
  SideEffect,

  // Field loading errors
  FieldLoadingError,

  // Type guards
  isReadyState,
  isTransitioningState,

  // Factories
  createUninitializedState,
  createInitializingState,
  createReadyState,
  createTransitioningState,
  createDestroyedState,
} from './state-types';
