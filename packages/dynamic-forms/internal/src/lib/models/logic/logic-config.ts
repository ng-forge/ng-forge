import type { AsyncDerivationFunction } from '../../core/expressions/async-custom-function-types';
import type { CustomFunction } from '../../core/expressions/custom-function-types';
import { ConditionalExpression } from '../expressions/conditional-expression';
import { HttpRequestConfig } from '../http/http-request-config';

/** Special form-state conditions for button disabled logic. */
export type FormStateCondition =
  /** True when form.valid() === false */
  | 'formInvalid'
  /** True when form.submitting() === true */
  | 'formSubmitting'
  /** True when fields on the current page are invalid (for paged forms) */
  | 'pageInvalid';

/** Logic type for controlling field state (hidden, readonly, disabled, required). */
export type StateLogicType = 'hidden' | 'readonly' | 'disabled' | 'required';

/**
 * Base configuration for conditional field state logic.
 *
 * @internal
 */
interface BaseStateLogicConfig {
  /** Logic type identifier for field state. */
  type: StateLogicType;

  /** Condition that determines when this logic applies. */
  condition: ConditionalExpression | boolean | FormStateCondition;
}

/**
 * State logic that evaluates immediately on change (default).
 *
 * @internal
 */
interface ImmediateStateLogicConfig extends BaseStateLogicConfig {
  /**
   * Trigger for immediate evaluation.
   *
   * @default 'onChange'
   */
  trigger?: 'onChange';
  /** Not allowed for onChange trigger */
  debounceMs?: never;
}

/**
 * State logic that evaluates after a debounce period.
 *
 * @internal
 */
interface DebouncedStateLogicConfig extends BaseStateLogicConfig {
  /**
   * Trigger for debounced evaluation.
   * Evaluates after the value has stabilized for the debounce duration.
   */
  trigger: 'debounced';
  /**
   * Debounce duration in milliseconds.
   *
   * @default 500
   */
  debounceMs?: number;
}

/** Configuration for conditional field state logic. */
export type StateLogicConfig = ImmediateStateLogicConfig | DebouncedStateLogicConfig;

/** Trigger timing for when logic is evaluated. */
export type LogicTrigger = 'onChange' | 'debounced';

/**
 * Shared fields that appear on all derivation logic config variants.
 *
 * @internal
 */
interface SharedDerivationFields {
  /** Logic type identifier for value derivation. */
  type: 'derivation';

  /** Target property name for property derivation. */
  targetProperty?: string;

  /** Optional name for this derivation for debugging purposes. */
  debugName?: string;

  /** Condition that determines when this derivation applies. */
  condition?: ConditionalExpression | boolean;

  /**
   * When true, the derivation stops running after the user manually
   * edits the target field.
   */
  stopOnUserOverride?: boolean;

  /**
   * When true (and `stopOnUserOverride` is also true), clears the
   * user-override flag when any dependency of this derivation changes,
   * allowing the derivation to run again.
   */
  reEngageOnDependencyChange?: boolean;
}

/**
 * Trigger variants for derivation timing.
 *
 * @internal
 */
type ImmediateDerivationTrigger = { trigger?: 'onChange'; debounceMs?: never };
type DebouncedDerivationTrigger = { trigger: 'debounced'; debounceMs?: number };

// ============================================================================
// HTTP derivation mode (source: 'http' — required; dependsOn/responseExpression — required)
// ============================================================================

/**
 * Base for HTTP derivations. `source: 'http'` is required.
 * TypeScript enforces `dependsOn` and `responseExpression` at the type level.
 *
 * @internal
 */
interface HttpDerivationBase extends SharedDerivationFields {
  /** Identifies this derivation as HTTP-driven. */
  source: 'http';
  /** Forbidden on HTTP source */
  fn?: never;
  /** Forbidden on HTTP source */
  asyncFn?: never;
  /** HTTP request configuration for server-driven derivations. */
  http: HttpRequestConfig;
  /**
   * Explicit field dependencies. Required for HTTP derivations to prevent
   * wildcard triggering on every keystroke.
   */
  dependsOn: string[];
  /** Expression to extract the derived value from the HTTP response. */
  responseExpression: string;
  // Mutual exclusivity: other sources are not allowed
  value?: never;
  expression?: never;
  functionName?: never;
  asyncFunctionName?: never;
}

// ============================================================================
// Async function derivation mode (source: 'asyncFunction' — required; dependsOn — required)
// ============================================================================

/**
 * Shared fields for both branches of {@link AsyncFunctionDerivationBase}.
 *
 * @internal
 */
interface AsyncFunctionDerivationShared extends SharedDerivationFields {
  /** Identifies this derivation as async-function-driven. */
  source: 'asyncFunction';
  /** Forbidden on asyncFunction source */
  fn?: never;
  /**
   * Explicit field dependencies. Required for async derivations to prevent
   * wildcard triggering on every form change.
   */
  dependsOn: string[];
  // Mutual exclusivity: other sources are not allowed
  value?: never;
  expression?: never;
  functionName?: never;
  http?: never;
  responseExpression?: never;
}

/**
 * Base for async function derivations. `source: 'asyncFunction'` is required.
 * TypeScript enforces `dependsOn` at the type level, and `asyncFunctionName` /
 * `asyncFn` are mutually exclusive (XOR).
 *
 * @internal
 */
type AsyncFunctionDerivationBase =
  | (AsyncFunctionDerivationShared & {
      /** Name of a registered async derivation function. */
      asyncFunctionName: string;
      /** Inline form is forbidden when `asyncFunctionName` is set */
      asyncFn?: never;
    })
  | (AsyncFunctionDerivationShared & {
      /** Inline async derivation function. Mutually exclusive with `asyncFunctionName`. */
      asyncFn: AsyncDerivationFunction;
      /** Registered form is forbidden when `asyncFn` is set */
      asyncFunctionName?: never;
    });

// ============================================================================
// Sync derivation modes
// ============================================================================

/**
 * Base for expression derivations.
 *
 * @internal
 */
interface ExpressionDerivationBase extends SharedDerivationFields {
  source?: never;
  /** Forbidden on expression mode */
  fn?: never;
  /** Forbidden on expression mode */
  asyncFn?: never;
  /** JavaScript expression to evaluate for the derived value. */
  expression: string;
  /** Explicit field dependencies for expressions. */
  dependsOn?: string[];
  // Mutual exclusivity: other mode payload fields are not allowed
  value?: never;
  functionName?: never;
  http?: never;
  asyncFunctionName?: never;
  responseExpression?: never;
}

/**
 * Base for value derivations.
 *
 * @internal
 */
interface ValueDerivationBase extends SharedDerivationFields {
  source?: never;
  /** Forbidden on value mode */
  fn?: never;
  /** Forbidden on value mode */
  asyncFn?: never;
  /** Static value to set on this field. */
  value: unknown;
  /** Explicit field dependencies for value derivations. */
  dependsOn?: string[];
  // Mutual exclusivity: other mode payload fields are not allowed
  expression?: never;
  functionName?: never;
  http?: never;
  asyncFunctionName?: never;
  responseExpression?: never;
}

/**
 * Shared fields for both branches of {@link FunctionDerivationBase}.
 *
 * @internal
 */
interface FunctionDerivationShared extends SharedDerivationFields {
  source?: never;
  /** Forbidden on function-derivation mode */
  asyncFn?: never;
  /** Explicit field dependencies for function derivations. */
  dependsOn?: string[];
  // Mutual exclusivity: other mode payload fields are not allowed
  value?: never;
  expression?: never;
  http?: never;
  asyncFunctionName?: never;
  responseExpression?: never;
}

/**
 * Base for custom sync function derivations. `functionName` and `fn` are
 * mutually exclusive (XOR).
 *
 * @internal
 */
type FunctionDerivationBase =
  | (FunctionDerivationShared & {
      /** Name of a registered custom derivation function. */
      functionName: string;
      /** Inline form is forbidden when `functionName` is set */
      fn?: never;
    })
  | (FunctionDerivationShared & {
      /** Inline custom derivation function. Mutually exclusive with `functionName`. */
      fn: CustomFunction;
      /** Registered form is forbidden when `fn` is set */
      functionName?: never;
    });

/**
 * HTTP derivation that evaluates immediately on change (default).
 *
 * @internal
 */
type OnChangeHttpDerivationLogicConfig = HttpDerivationBase & ImmediateDerivationTrigger;

/**
 * HTTP derivation that evaluates after a debounce period.
 *
 * @internal
 */
type DebouncedHttpDerivationLogicConfig = HttpDerivationBase & DebouncedDerivationTrigger;

/**
 * Async function derivation that evaluates immediately on change (default).
 *
 * @internal
 */
type OnChangeAsyncFunctionDerivationLogicConfig = AsyncFunctionDerivationBase & ImmediateDerivationTrigger;

/**
 * Async function derivation that evaluates after a debounce period.
 *
 * @internal
 */
type DebouncedAsyncFunctionDerivationLogicConfig = AsyncFunctionDerivationBase & DebouncedDerivationTrigger;

/**
 * Expression derivation that evaluates immediately on change (default).
 *
 * @internal
 */
type OnChangeExpressionDerivationLogicConfig = ExpressionDerivationBase & ImmediateDerivationTrigger;

/**
 * Expression derivation that evaluates after a debounce period.
 *
 * @internal
 */
type DebouncedExpressionDerivationLogicConfig = ExpressionDerivationBase & DebouncedDerivationTrigger;

/**
 * Value derivation that evaluates immediately on change (default).
 *
 * @internal
 */
type OnChangeValueDerivationLogicConfig = ValueDerivationBase & ImmediateDerivationTrigger;

/**
 * Value derivation that evaluates after a debounce period.
 *
 * @internal
 */
type DebouncedValueDerivationLogicConfig = ValueDerivationBase & DebouncedDerivationTrigger;

/**
 * Function derivation that evaluates immediately on change (default).
 *
 * @internal
 */
type OnChangeFunctionDerivationLogicConfig = FunctionDerivationBase & ImmediateDerivationTrigger;

/**
 * Function derivation that evaluates after a debounce period.
 *
 * @internal
 */
type DebouncedFunctionDerivationLogicConfig = FunctionDerivationBase & DebouncedDerivationTrigger;

/** Configuration for value derivation logic. */
export type DerivationLogicConfig =
  | OnChangeHttpDerivationLogicConfig
  | DebouncedHttpDerivationLogicConfig
  | OnChangeAsyncFunctionDerivationLogicConfig
  | DebouncedAsyncFunctionDerivationLogicConfig
  | OnChangeExpressionDerivationLogicConfig
  | DebouncedExpressionDerivationLogicConfig
  | OnChangeValueDerivationLogicConfig
  | DebouncedValueDerivationLogicConfig
  | OnChangeFunctionDerivationLogicConfig
  | DebouncedFunctionDerivationLogicConfig;

/** Union type for all logic configurations. */
export type LogicConfig = StateLogicConfig | DerivationLogicConfig;

/** Log level for derivation debug output. */
export type DerivationLogLevel = 'none' | 'summary' | 'verbose';

/** Configuration for derivation debug logging. */
export interface DerivationLogConfig {
  /** Log level for derivation debugging. Defaults to 'none'. */
  level: DerivationLogLevel;
}

/**
 * Creates the default derivation log configuration.
 *
 * @returns Default DerivationLogConfig
 */
export function createDefaultDerivationLogConfig(): DerivationLogConfig {
  return {
    level: 'none',
  };
}

/**
 * Checks if logging should occur at the specified level.
 *
 * @param config - Current log configuration
 * @param minLevel - Minimum level required for logging
 * @returns True if logging should occur
 */
export function shouldLog(config: DerivationLogConfig, minLevel: 'summary' | 'verbose'): boolean {
  if (config.level === 'none') return false;
  if (minLevel === 'summary') return config.level === 'summary' || config.level === 'verbose';
  return config.level === 'verbose';
}

/**
 * Type guard to check if a condition is a FormStateCondition.
 *
 * @param condition - The condition to check
 * @returns true if the condition is a FormStateCondition
 */
export function isFormStateCondition(
  condition: StateLogicConfig['condition'] | DerivationLogicConfig['condition'],
): condition is FormStateCondition {
  return typeof condition === 'string' && ['formInvalid', 'formSubmitting', 'pageInvalid'].includes(condition);
}

/**
 * Type guard to check if a logic config is a StateLogicConfig.
 *
 * @param config - The logic config to check
 * @returns true if the config is for field state logic
 */
export function isStateLogicConfig(config: LogicConfig): config is StateLogicConfig {
  return config.type === 'hidden' || config.type === 'readonly' || config.type === 'disabled' || config.type === 'required';
}

/**
 * Type guard to check if a logic config is a DerivationLogicConfig.
 *
 * @param config - The logic config to check
 * @returns true if the config is for value derivation
 */
export function isDerivationLogicConfig(config: LogicConfig): config is DerivationLogicConfig {
  return config.type === 'derivation';
}

/**
 * Type guard to check if a derivation config targets a property rather than the field value.
 *
 * @param config - The derivation logic config to check
 * @returns true if the config has a targetProperty (property derivation)
 */
export function hasTargetProperty(config: DerivationLogicConfig): config is DerivationLogicConfig & { targetProperty: string } {
  return 'targetProperty' in config && typeof config.targetProperty === 'string' && config.targetProperty.length > 0;
}
