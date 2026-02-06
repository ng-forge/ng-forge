import { FieldDef } from '../definitions/base/field-def';
import { FieldTypeDefinition } from '../models/field-type';
import { FormConfig } from '../models/form-config';
import { RegisteredFieldTypes } from '../models/registry/field-registry';
import { FormMode } from '../models/types/form-mode';

/**
 * Form lifecycle states representing the complete state machine for config transitions.
 *
 * State flow:
 * 1. `uninitialized` → Initial state before any config is provided
 * 2. `initializing` → First config received, setting up form
 * 3. `ready` → Form is fully initialized and rendering
 * 4. `transitioning` → Config change detected, managing teardown and apply phases
 * 5. `destroyed` → Component destroyed, cleanup complete
 *
 * The transitioning state has three phases:
 * - `teardown` - Hide old components (shouldRender = false)
 * - `applying` - Create new form with new config
 * - `restoring` - Restore preserved values to new form
 *
 * @internal
 */
export type FormLifecycleState<TFields extends RegisteredFieldTypes[] = RegisteredFieldTypes[]> =
  | FormLifecycleUninitialized
  | FormLifecycleInitializing<TFields>
  | FormLifecycleReady<TFields>
  | FormLifecycleTransitioning<TFields>
  | FormLifecycleDestroyed;

/**
 * Initial state before any config is provided.
 */
export interface FormLifecycleUninitialized {
  readonly type: 'uninitialized';
}

/**
 * First config received, setting up form.
 */
export interface FormLifecycleInitializing<TFields extends RegisteredFieldTypes[] = RegisteredFieldTypes[]> {
  readonly type: 'initializing';
  readonly config: FormConfig<TFields>;
}

/**
 * Form is fully initialized and rendering.
 */
export interface FormLifecycleReady<TFields extends RegisteredFieldTypes[] = RegisteredFieldTypes[]> {
  readonly type: 'ready';
  readonly config: FormConfig<TFields>;
  readonly formSetup: FormSetup<TFields>;
}

/**
 * Phases during config transition.
 */
export type TransitionPhase = 'teardown' | 'applying' | 'restoring';

/**
 * Config change detected, managing teardown and apply phases.
 */
export interface FormLifecycleTransitioning<TFields extends RegisteredFieldTypes[] = RegisteredFieldTypes[]> {
  readonly type: 'transitioning';
  readonly phase: TransitionPhase;
  readonly currentConfig: FormConfig<TFields>;
  readonly pendingConfig: FormConfig<TFields>;
  readonly preservedValue?: Record<string, unknown>;
  /** FormSetup from the ready state that initiated this transition */
  readonly currentFormSetup: FormSetup<TFields>;
  /** FormSetup computed for the pending config (set when apply-complete fires) */
  readonly pendingFormSetup?: FormSetup<TFields>;
}

/**
 * Component destroyed, cleanup complete.
 */
export interface FormLifecycleDestroyed {
  readonly type: 'destroyed';
}

/**
 * Computed form setup derived from active config.
 * Contains all precomputed values needed for form creation and rendering.
 *
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface FormSetup<TFields extends RegisteredFieldTypes[] = RegisteredFieldTypes[]> {
  /**
   * Fields to render (flattened for non-paged, empty for paged).
   * Paged forms use PageOrchestrator for rendering.
   */
  readonly fields: FieldDef<unknown>[];

  /**
   * All schema fields for validation (flattened from all pages/containers).
   */
  readonly schemaFields: FieldDef<unknown>[];

  /**
   * Original field definitions from config (before flattening).
   */
  readonly originalFields?: FieldDef<unknown>[];

  /**
   * Default values computed from field definitions.
   */
  readonly defaultValues: Record<string, unknown>;

  /**
   * Detected form mode (paged vs non-paged).
   */
  readonly mode: FormMode;

  /**
   * Reference to the field type registry.
   */
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
  | SetupCompleteAction<TFields>
  | TeardownCompleteAction
  | ApplyCompleteAction<TFields>
  | RestoreCompleteAction
  | DestroyAction;

/**
 * Initialize with first config.
 */
export interface InitializeAction<TFields extends RegisteredFieldTypes[] = RegisteredFieldTypes[]> {
  readonly type: 'initialize';
  readonly config: FormConfig<TFields>;
}

/**
 * Config input changed.
 */
export interface ConfigChangeAction<TFields extends RegisteredFieldTypes[] = RegisteredFieldTypes[]> {
  readonly type: 'config-change';
  readonly config: FormConfig<TFields>;
}

/**
 * Form setup computation complete.
 */
export interface SetupCompleteAction<TFields extends RegisteredFieldTypes[] = RegisteredFieldTypes[]> {
  readonly type: 'setup-complete';
  readonly formSetup: FormSetup<TFields>;
}

/**
 * Teardown phase complete (old components destroyed).
 */
export interface TeardownCompleteAction {
  readonly type: 'teardown-complete';
}

/**
 * Apply phase complete (new form created).
 */
export interface ApplyCompleteAction<TFields extends RegisteredFieldTypes[] = RegisteredFieldTypes[]> {
  readonly type: 'apply-complete';
  readonly formSetup: FormSetup<TFields>;
}

/**
 * Restore phase complete (values restored).
 */
export interface RestoreCompleteAction {
  readonly type: 'restore-complete';
}

/**
 * Component being destroyed.
 */
export interface DestroyAction {
  readonly type: 'destroy';
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
  | { readonly type: 'capture-value' }
  | { readonly type: 'wait-frame-boundary' }
  | { readonly type: 'create-form' }
  | { readonly type: 'restore-values'; readonly values: Record<string, unknown> }
  | { readonly type: 'clear-preserved-value' }
  | { readonly type: 'cleanup' };

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

/**
 * Type guard for ready state.
 *
 * @internal
 */
export function isReadyState<TFields extends RegisteredFieldTypes[]>(
  state: FormLifecycleState<TFields>,
): state is FormLifecycleReady<TFields> {
  return state.type === 'ready';
}

/**
 * Type guard for transitioning state.
 *
 * @internal
 */
export function isTransitioningState<TFields extends RegisteredFieldTypes[]>(
  state: FormLifecycleState<TFields>,
): state is FormLifecycleTransitioning<TFields> {
  return state.type === 'transitioning';
}

/**
 * Creates the initial uninitialized state.
 *
 * @internal
 */
export function createUninitializedState(): FormLifecycleUninitialized {
  return { type: 'uninitialized' };
}

/**
 * Creates an initializing state.
 *
 * @internal
 */
export function createInitializingState<TFields extends RegisteredFieldTypes[]>(
  config: FormConfig<TFields>,
): FormLifecycleInitializing<TFields> {
  return { type: 'initializing', config };
}

/**
 * Creates a ready state.
 *
 * @internal
 */
export function createReadyState<TFields extends RegisteredFieldTypes[]>(
  config: FormConfig<TFields>,
  formSetup: FormSetup<TFields>,
): FormLifecycleReady<TFields> {
  return { type: 'ready', config, formSetup };
}

/**
 * Creates a transitioning state.
 *
 * @internal
 */
export function createTransitioningState<TFields extends RegisteredFieldTypes[]>(
  phase: TransitionPhase,
  currentConfig: FormConfig<TFields>,
  pendingConfig: FormConfig<TFields>,
  currentFormSetup: FormSetup<TFields>,
  preservedValue?: Record<string, unknown>,
  pendingFormSetup?: FormSetup<TFields>,
): FormLifecycleTransitioning<TFields> {
  return { type: 'transitioning', phase, currentConfig, pendingConfig, currentFormSetup, preservedValue, pendingFormSetup };
}

/**
 * Creates a destroyed state.
 *
 * @internal
 */
export function createDestroyedState(): FormLifecycleDestroyed {
  return { type: 'destroyed' };
}
