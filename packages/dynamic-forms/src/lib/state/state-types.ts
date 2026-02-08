import { FieldDef } from '../definitions/base/field-def';
import { FieldTypeDefinition } from '../models/field-type';
import { FormConfig } from '../models/form-config';
import { RegisteredFieldTypes } from '../models/registry/field-registry';
import { FormMode } from '../models/types/form-mode';

// ─────────────────────────────────────────────────────────────────────────────
// Discriminant constants
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lifecycle state discriminants.
 * @internal
 */
export const LifecycleState = {
  Uninitialized: 'uninitialized',
  Initializing: 'initializing',
  Ready: 'ready',
  Transitioning: 'transitioning',
  Destroyed: 'destroyed',
} as const;

/** Indexed access type for {@link LifecycleState} values. */
export type LifecycleStateType = (typeof LifecycleState)[keyof typeof LifecycleState];

/**
 * Transition phase discriminants.
 * @internal
 */
export const Phase = {
  Teardown: 'teardown',
  Applying: 'applying',
  Restoring: 'restoring',
} as const;

/** Indexed access type for {@link Phase} values. */
export type PhaseType = (typeof Phase)[keyof typeof Phase];

/**
 * Action type discriminants.
 * @internal
 */
export const Action = {
  Initialize: 'initialize',
  ConfigChange: 'config-change',
  SetupComplete: 'setup-complete',
  ValueCaptured: 'value-captured',
  TeardownComplete: 'teardown-complete',
  ApplyComplete: 'apply-complete',
  RestoreComplete: 'restore-complete',
  Destroy: 'destroy',
} as const;

/** Indexed access type for {@link Action} values. */
export type ActionType = (typeof Action)[keyof typeof Action];

/**
 * Side effect type discriminants.
 * @internal
 */
export const Effect = {
  CaptureValue: 'capture-value',
  WaitFrameBoundary: 'wait-frame-boundary',
  CreateForm: 'create-form',
  RestoreValues: 'restore-values',
} as const;

/** Indexed access type for {@link Effect} values. */
export type EffectType = (typeof Effect)[keyof typeof Effect];

// ─────────────────────────────────────────────────────────────────────────────
// State types
// ─────────────────────────────────────────────────────────────────────────────

/** @internal */
export type FormLifecycleState<TFields extends RegisteredFieldTypes[] = RegisteredFieldTypes[]> =
  | FormLifecycleUninitialized
  | FormLifecycleInitializing<TFields>
  | FormLifecycleReady<TFields>
  | FormLifecycleTransitioning<TFields>
  | FormLifecycleDestroyed;

export interface FormLifecycleUninitialized {
  readonly type: (typeof LifecycleState)['Uninitialized'];
}

export interface FormLifecycleInitializing<TFields extends RegisteredFieldTypes[] = RegisteredFieldTypes[]> {
  readonly type: (typeof LifecycleState)['Initializing'];
  readonly config: FormConfig<TFields>;
}

export interface FormLifecycleReady<TFields extends RegisteredFieldTypes[] = RegisteredFieldTypes[]> {
  readonly type: (typeof LifecycleState)['Ready'];
  readonly config: FormConfig<TFields>;
  readonly formSetup: FormSetup;
}

export type TransitionPhase = PhaseType;

export interface FormLifecycleTransitioning<TFields extends RegisteredFieldTypes[] = RegisteredFieldTypes[]> {
  readonly type: (typeof LifecycleState)['Transitioning'];
  readonly phase: TransitionPhase;
  readonly currentConfig: FormConfig<TFields>;
  readonly pendingConfig: FormConfig<TFields>;
  readonly preservedValue?: Record<string, unknown>;
  /** FormSetup from the ready state that initiated this transition */
  readonly currentFormSetup: FormSetup;
  /** FormSetup computed for the pending config (set when apply-complete fires) */
  readonly pendingFormSetup?: FormSetup;
}

export interface FormLifecycleDestroyed {
  readonly type: (typeof LifecycleState)['Destroyed'];
}

/** @internal */
export interface FormSetup {
  /** Fields to render (flattened for non-paged, empty for paged). */
  readonly fields: FieldDef<unknown>[];
  /** All schema fields for validation (flattened from all pages/containers). */
  readonly schemaFields: FieldDef<unknown>[];
  readonly originalFields?: FieldDef<unknown>[];
  readonly defaultValues: Record<string, unknown>;
  readonly mode: FormMode;
  readonly registry: Map<string, FieldTypeDefinition>;
}

/**
 * Actions that can be dispatched to the state machine.
 *
 * @internal
 */
export type FormStateAction<TFields extends RegisteredFieldTypes[] = RegisteredFieldTypes[]> =
  | InitializeAction<TFields>
  | ConfigChangeAction<TFields>
  | SetupCompleteAction
  | ValueCapturedAction
  | TeardownCompleteAction
  | ApplyCompleteAction
  | RestoreCompleteAction
  | DestroyAction;

export interface InitializeAction<TFields extends RegisteredFieldTypes[] = RegisteredFieldTypes[]> {
  readonly type: (typeof Action)['Initialize'];
  readonly config: FormConfig<TFields>;
}

export interface ConfigChangeAction<TFields extends RegisteredFieldTypes[] = RegisteredFieldTypes[]> {
  readonly type: (typeof Action)['ConfigChange'];
  readonly config: FormConfig<TFields>;
}

export interface SetupCompleteAction {
  readonly type: (typeof Action)['SetupComplete'];
  readonly formSetup: FormSetup;
}

export interface ValueCapturedAction {
  readonly type: (typeof Action)['ValueCaptured'];
  readonly value: Record<string, unknown>;
}

export interface TeardownCompleteAction {
  readonly type: (typeof Action)['TeardownComplete'];
}

export interface ApplyCompleteAction {
  readonly type: (typeof Action)['ApplyComplete'];
  readonly formSetup: FormSetup;
}

export interface RestoreCompleteAction {
  readonly type: (typeof Action)['RestoreComplete'];
}

export interface DestroyAction {
  readonly type: (typeof Action)['Destroy'];
}

/**
 * State transition record for debugging and testing.
 *
 * @internal
 */
export interface StateTransition<TFields extends RegisteredFieldTypes[] = RegisteredFieldTypes[]> {
  readonly from: FormLifecycleState<TFields>;
  readonly to: FormLifecycleState<TFields>;
  readonly action: FormStateAction<TFields>;
  readonly timestamp: number;
}

/**
 * Result of a state transition.
 *
 * @internal
 */
export interface TransitionResult<TFields extends RegisteredFieldTypes[] = RegisteredFieldTypes[]> {
  readonly state: FormLifecycleState<TFields>;
  readonly sideEffects: SideEffect[];
}

/**
 * Side effects to execute after state transition.
 *
 * @internal
 */
export type SideEffect =
  | { readonly type: (typeof Effect)['CaptureValue'] }
  | { readonly type: (typeof Effect)['WaitFrameBoundary'] }
  | { readonly type: (typeof Effect)['CreateForm'] }
  | { readonly type: (typeof Effect)['RestoreValues']; readonly values: Record<string, unknown> };

/**
 * Error from async field component loading.
 *
 * @public
 */
export interface FieldLoadingError {
  readonly fieldType: string;
  readonly fieldKey: string;
  readonly error: Error;
}

/** @internal */
export function isReadyState<TFields extends RegisteredFieldTypes[]>(
  state: FormLifecycleState<TFields>,
): state is FormLifecycleReady<TFields> {
  return state.type === LifecycleState.Ready;
}

/** @internal */
export function isTransitioningState<TFields extends RegisteredFieldTypes[]>(
  state: FormLifecycleState<TFields>,
): state is FormLifecycleTransitioning<TFields> {
  return state.type === LifecycleState.Transitioning;
}

/** @internal */
export function createUninitializedState(): FormLifecycleUninitialized {
  return { type: LifecycleState.Uninitialized };
}

/** @internal */
export function createInitializingState<TFields extends RegisteredFieldTypes[]>(
  config: FormConfig<TFields>,
): FormLifecycleInitializing<TFields> {
  return { type: LifecycleState.Initializing, config };
}

/** @internal */
export function createReadyState<TFields extends RegisteredFieldTypes[]>(
  config: FormConfig<TFields>,
  formSetup: FormSetup,
): FormLifecycleReady<TFields> {
  return { type: LifecycleState.Ready, config, formSetup };
}

/** @internal */
export function createTransitioningState<TFields extends RegisteredFieldTypes[]>(
  phase: TransitionPhase,
  currentConfig: FormConfig<TFields>,
  pendingConfig: FormConfig<TFields>,
  currentFormSetup: FormSetup,
  preservedValue?: Record<string, unknown>,
  pendingFormSetup?: FormSetup,
): FormLifecycleTransitioning<TFields> {
  return { type: LifecycleState.Transitioning, phase, currentConfig, pendingConfig, currentFormSetup, preservedValue, pendingFormSetup };
}

/** @internal */
export function createDestroyedState(): FormLifecycleDestroyed {
  return { type: LifecycleState.Destroyed };
}
