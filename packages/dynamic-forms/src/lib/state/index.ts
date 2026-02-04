/**
 * State management module for dynamic forms.
 *
 * This module provides:
 * - `FormStateManager`: Service that owns all form state
 * - `FormStateMachine`: RxJS-based state machine for lifecycle management
 * - `SideEffectScheduler`: Controlled timing for side effects
 * - State types and type guards
 * - Token providers for injection
 *
 * @packageDocumentation
 */

// Core service
export { FormStateManager, FormStateManagerDeps } from './form-state-manager';

// State machine
export { FormStateMachine, FormStateMachineConfig, createFormStateMachine } from './form-state-machine';

// Side effect scheduler
export {
  SideEffectScheduler,
  SideEffectTiming,
  SideEffectOptions,
  ScheduledEffect,
  createSideEffectScheduler,
} from './side-effect-scheduler';

// State types
export {
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
  ValueUpdateAction,
  TeardownCompleteAction,
  ApplyCompleteAction,
  RestoreCompleteAction,
  DestroyAction,

  // Transitions
  StateTransition,
  TransitionResult,
  SideEffect,

  // Form state
  FormState,
  FieldLoadingError,

  // Type guards
  isLifecycleState,
  isReadyState,
  isTransitioningState,

  // Factories
  createUninitializedState,
  createInitializingState,
  createReadyState,
  createTransitioningState,
  createDestroyedState,
} from './state-types';

// Token providers
export { createFormStateProviders, createFieldSignalContextProvider, createAllFormProviders } from './token-providers';
