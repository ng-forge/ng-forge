import { ConditionalExpression } from '../expressions/conditional-expression';

/**
 * Special form-state conditions for button disabled logic.
 *
 * These conditions evaluate form or page-level state rather than field values,
 * and are primarily used for controlling button disabled states.
 *
 * @example
 * ```typescript
 * // Disable submit button when form is invalid or submitting
 * {
 *   key: 'submit',
 *   type: 'submit',
 *   label: 'Submit',
 *   logic: [
 *     { type: 'disabled', condition: 'formInvalid' },
 *     { type: 'disabled', condition: 'formSubmitting' },
 *   ]
 * }
 *
 * // Disable next button when current page is invalid
 * nextButton({
 *   key: 'next',
 *   label: 'Next',
 *   logic: [
 *     { type: 'disabled', condition: 'pageInvalid' },
 *   ]
 * })
 * ```
 *
 * @public
 */
export type FormStateCondition =
  /** True when form.valid() === false */
  | 'formInvalid'
  /** True when form.submitting() === true */
  | 'formSubmitting'
  /** True when fields on the current page are invalid (for paged forms) */
  | 'pageInvalid';

/**
 * Logic type for controlling field state (hidden, readonly, disabled, required).
 *
 * @public
 */
export type StateLogicType = 'hidden' | 'readonly' | 'disabled' | 'required';

/**
 * Base configuration for conditional field state logic.
 *
 * @internal
 */
interface BaseStateLogicConfig {
  /**
   * Logic type identifier for field state.
   *
   * - `hidden`: Hide the field from view (still participates in form state)
   * - `readonly`: Make the field read-only
   * - `disabled`: Disable user interaction
   * - `required`: Make the field required
   */
  type: StateLogicType;

  /**
   * Condition that determines when this logic applies.
   *
   * Can be:
   * - `boolean`: Static value (always applies or never applies)
   * - `ConditionalExpression`: Expression evaluated against field/form values
   * - `FormStateCondition`: Special form/page state check (for buttons)
   *
   * @example
   * ```typescript
   * // Static condition
   * condition: true
   *
   * // Field value condition
   * condition: {
   *   type: 'fieldValue',
   *   fieldPath: 'status',
   *   operator: 'equals',
   *   value: 'locked'
   * }
   *
   * // Form state condition (for buttons)
   * condition: 'formSubmitting'
   * ```
   */
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
   * @default 500
   */
  debounceMs?: number;
}

/**
 * Configuration for conditional field state logic.
 *
 * Defines how field behavior changes based on conditions.
 * Supports hiding, disabling, making readonly, or requiring fields
 * based on form state or field values.
 *
 * @example
 * ```typescript
 * // Hide email field when contact method is not email
 * {
 *   type: 'hidden',
 *   condition: {
 *     type: 'fieldValue',
 *     fieldPath: 'contactMethod',
 *     operator: 'notEquals',
 *     value: 'email'
 *   }
 * }
 *
 * // Disable button when form is submitting
 * {
 *   type: 'disabled',
 *   condition: 'formSubmitting'
 * }
 *
 * // Debounced visibility (avoids flicker during rapid typing)
 * {
 *   type: 'hidden',
 *   trigger: 'debounced',
 *   debounceMs: 300,
 *   condition: {
 *     type: 'fieldValue',
 *     fieldPath: 'search',
 *     operator: 'isEmpty'
 *   }
 * }
 * ```
 *
 * @public
 */
export type StateLogicConfig = ImmediateStateLogicConfig | DebouncedStateLogicConfig;

/**
 * Trigger timing for when logic is evaluated.
 *
 * - `onChange`: Evaluate immediately when any dependency changes (default)
 * - `debounced`: Evaluate after the value has stabilized for a duration
 *
 * Use `debounced` for self-transforms (lowercase, trim) or to avoid
 * UI flicker during rapid typing.
 *
 * @public
 */
export type LogicTrigger = 'onChange' | 'debounced';

/**
 * @deprecated Use `LogicTrigger` instead. Will be removed in a future version.
 * @public
 */
export type DerivationTrigger = LogicTrigger;

/**
 * Base configuration for value derivation logic.
 *
 * All derivations target the field they are defined on (self-targeting).
 * This simplifies configuration by removing the need for `targetField` -
 * derivation logic is placed on the field that should receive the computed value.
 *
 * @internal
 */
interface BaseDerivationLogicConfig {
  /**
   * Logic type identifier for value derivation.
   */
  type: 'derivation';

  /**
   * Optional name for this derivation for debugging purposes.
   *
   * When provided, this name appears in derivation debug logs,
   * making it easier to identify specific derivations in complex forms.
   *
   * @example
   * ```typescript
   * {
   *   key: 'lineTotal',
   *   type: 'input',
   *   logic: [{
   *     type: 'derivation',
   *     debugName: 'Calculate line total',
   *     expression: 'formValue.quantity * formValue.unitPrice'
   *   }]
   * }
   * ```
   */
  debugName?: string;

  /**
   * Condition that determines when this derivation applies.
   *
   * Can be:
   * - `boolean`: Static value (always applies or never applies)
   * - `ConditionalExpression`: Expression evaluated against field/form values
   *
   * Defaults to `true` (always apply).
   *
   * Note: FormStateCondition is not supported for derivations.
   *
   * @example
   * ```typescript
   * // Always compute (default)
   * condition: true
   *
   * // Conditional derivation
   * condition: {
   *   type: 'fieldValue',
   *   fieldPath: 'country',
   *   operator: 'equals',
   *   value: 'USA'
   * }
   * ```
   */
  condition?: ConditionalExpression | boolean;

  /**
   * Static value to set on this field.
   *
   * Use when the derived value is a constant.
   * Mutually exclusive with `expression` and `functionName`.
   *
   * @example
   * ```typescript
   * value: '+1'           // String
   * value: 100            // Number
   * value: true           // Boolean
   * value: { code: 'US' } // Object
   * ```
   */
  value?: unknown;

  /**
   * JavaScript expression to evaluate for the derived value.
   *
   * Has access to `formValue` object containing all form values.
   * For array fields, `formValue` is scoped to the current array item.
   * Uses the same secure AST-based parser as other expressions.
   * Mutually exclusive with `value` and `functionName`.
   *
   * @example
   * ```typescript
   * expression: 'formValue.quantity * formValue.unitPrice'
   * expression: 'formValue.firstName + " " + formValue.lastName'
   * expression: 'formValue.price * (1 - formValue.discount / 100)'
   * ```
   */
  expression?: string;

  /**
   * Name of a registered custom derivation function.
   *
   * The function receives the evaluation context and returns the derived value.
   * Register functions in `customFnConfig.derivations`.
   * Mutually exclusive with `value` and `expression`.
   *
   * @example
   * ```typescript
   * functionName: 'getCurrencyForCountry'
   * functionName: 'calculateTax'
   * functionName: 'formatPhoneNumber'
   * ```
   */
  functionName?: string;

  /**
   * Explicit field dependencies for derivations.
   *
   * When using `functionName`, you can optionally specify which fields
   * the function depends on. This enables more efficient re-evaluation
   * by only triggering when specific dependencies change.
   *
   * If not provided with `functionName`, defaults to all fields ('*').
   * For `expression`, dependencies are automatically extracted from the expression.
   * For `value`, no dependencies are needed (static value).
   *
   * @example
   * ```typescript
   * // Only re-evaluate when country changes
   * {
   *   key: 'currency',
   *   logic: [{
   *     type: 'derivation',
   *     functionName: 'getCurrencyForCountry',
   *     dependsOn: ['country']
   *   }]
   * }
   *
   * // Override automatic detection for complex expressions
   * {
   *   key: 'total',
   *   logic: [{
   *     type: 'derivation',
   *     expression: 'calculateTotal(formValue)',
   *     dependsOn: ['quantity', 'unitPrice', 'discount']
   *   }]
   * }
   * ```
   */
  dependsOn?: string[];
}

/**
 * Derivation logic that evaluates immediately on change (default).
 *
 * @internal
 */
interface OnChangeDerivationLogicConfig extends BaseDerivationLogicConfig {
  /**
   * Trigger for immediate evaluation.
   * @default 'onChange'
   */
  trigger?: 'onChange';
  /** Not allowed for onChange trigger */
  debounceMs?: never;
}

/**
 * Derivation logic that evaluates after a debounce period.
 *
 * Use this for self-transforms (lowercase, trim, format) to avoid
 * interrupting the user while they're actively typing.
 *
 * @internal
 */
interface DebouncedDerivationLogicConfig extends BaseDerivationLogicConfig {
  /**
   * Trigger for debounced evaluation.
   * Evaluates after the value has stabilized for the debounce duration.
   */
  trigger: 'debounced';
  /**
   * Debounce duration in milliseconds.
   * @default 500
   */
  debounceMs?: number;
}

/**
 * Configuration for value derivation logic.
 *
 * Enables programmatic value derivation based on conditions.
 * Derivations are self-targeting: the logic is placed on the field
 * that should receive the computed value.
 *
 * @example
 * ```typescript
 * // Set phone prefix based on country selection
 * {
 *   key: 'phonePrefix',
 *   logic: [{
 *     type: 'derivation',
 *     value: '+1',
 *     condition: {
 *       type: 'fieldValue',
 *       fieldPath: 'country',
 *       operator: 'equals',
 *       value: 'USA'
 *     }
 *   }]
 * }
 *
 * // Compute total from quantity and price
 * {
 *   key: 'total',
 *   derivation: 'formValue.quantity * formValue.unitPrice'
 * }
 *
 * // Use custom function for complex logic
 * {
 *   key: 'currency',
 *   logic: [{
 *     type: 'derivation',
 *     functionName: 'getCurrencyForCountry'
 *   }]
 * }
 *
 * // Self-transform with debounced trigger
 * // (applies after user stops typing)
 * {
 *   key: 'email',
 *   logic: [{
 *     type: 'derivation',
 *     expression: 'formValue.email.toLowerCase()',
 *     trigger: 'debounced',
 *     debounceMs: 500
 *   }]
 * }
 *
 * // Array item derivation (formValue is scoped to current item)
 * {
 *   key: 'lineTotal',  // Inside array field
 *   derivation: 'formValue.quantity * formValue.unitPrice'
 * }
 * ```
 *
 * @public
 */
export type DerivationLogicConfig = OnChangeDerivationLogicConfig | DebouncedDerivationLogicConfig;

/**
 * Base configuration for property derivation logic.
 *
 * Property derivations compute values for field properties (like `minDate`, `options`,
 * `label`, `placeholder`) based on form values and external data. Unlike value derivations
 * which set the field's value, property derivations update component input properties.
 *
 * All property derivations are self-targeting: the logic is placed on the field whose
 * property should be derived.
 *
 * @internal
 */
interface BasePropertyDerivationLogicConfig {
  /**
   * Logic type identifier for property derivation.
   */
  type: 'propertyDerivation';

  /**
   * The target property to set on the field component.
   *
   * **Depth limit (max 2 levels):** Only simple and single-dot-nested paths are
   * supported. Paths with 2+ dots (e.g., `'a.b.c'`) will throw a `DynamicFormError`
   * at runtime. This is an architectural constraint of the override merging strategy.
   *
   * Supported formats:
   * - Simple: `'minDate'`, `'options'`, `'label'`, `'placeholder'`
   * - Nested (1 dot): `'props.appearance'`, `'meta.autocomplete'`
   *
   * **Note:** There is no compile-time validation that the property name matches
   * an actual input on the field component. Typos will silently write to the
   * override store with no visible effect. A dev-mode warning is emitted when
   * the override key doesn't match any existing input property.
   *
   * @example
   * ```typescript
   * targetProperty: 'minDate'           // ✅ Simple property
   * targetProperty: 'options'           // ✅ Simple property
   * targetProperty: 'props.appearance'  // ✅ Single-nested property
   * targetProperty: 'a.b.c'            // ❌ Throws DynamicFormError (too deep)
   * ```
   */
  targetProperty: string;

  /**
   * Optional name for this derivation for debugging purposes.
   *
   * When provided, this name appears in property derivation debug logs.
   */
  debugName?: string;

  /**
   * Condition that determines when this property derivation applies.
   *
   * Defaults to `true` (always apply).
   *
   * Note: FormStateCondition is not supported for property derivations.
   */
  condition?: ConditionalExpression | boolean;

  /**
   * Static value to set on the target property.
   *
   * Mutually exclusive with `expression` and `functionName`.
   */
  value?: unknown;

  /**
   * JavaScript expression to evaluate for the derived property value.
   *
   * Has access to `formValue` object containing all form values.
   * For array fields, `formValue` is scoped to the current array item.
   *
   * Mutually exclusive with `value` and `functionName`.
   *
   * @example
   * ```typescript
   * expression: 'formValue.startDate'
   * expression: 'formValue.quantity > 10 ? "bulk" : "standard"'
   * ```
   */
  expression?: string;

  /**
   * Name of a registered custom property derivation function.
   *
   * Register functions in `customFnConfig.propertyDerivations`.
   * Mutually exclusive with `value` and `expression`.
   */
  functionName?: string;

  /**
   * Explicit field dependencies for property derivations.
   *
   * When using `functionName`, you can optionally specify which fields
   * the function depends on. If not provided with `functionName`, defaults
   * to all fields ('*').
   * For `expression`, dependencies are automatically extracted.
   * For `value`, no dependencies are needed (static value).
   */
  dependsOn?: string[];
}

/**
 * Property derivation that evaluates immediately on change (default).
 *
 * @internal
 */
interface OnChangePropertyDerivationLogicConfig extends BasePropertyDerivationLogicConfig {
  /**
   * Trigger for immediate evaluation.
   * @default 'onChange'
   */
  trigger?: 'onChange';
  /** Not allowed for onChange trigger */
  debounceMs?: never;
}

/**
 * Property derivation that evaluates after a debounce period.
 *
 * @internal
 */
interface DebouncedPropertyDerivationLogicConfig extends BasePropertyDerivationLogicConfig {
  /**
   * Trigger for debounced evaluation.
   */
  trigger: 'debounced';
  /**
   * Debounce duration in milliseconds.
   * @default 500
   */
  debounceMs?: number;
}

/**
 * Configuration for property derivation logic.
 *
 * Enables reactive derivation of field properties (like `minDate`, `options`,
 * `label`, `placeholder`) based on form values and external data.
 *
 * Property derivations are self-targeting: the logic is placed on the field
 * whose property should be derived.
 *
 * @example
 * ```typescript
 * // Derive endDate's minDate from startDate value
 * {
 *   key: 'endDate',
 *   type: 'datepicker',
 *   logic: [{
 *     type: 'propertyDerivation',
 *     targetProperty: 'minDate',
 *     expression: 'formValue.startDate'
 *   }]
 * }
 *
 * // Derive options from another field's value
 * {
 *   key: 'city',
 *   type: 'select',
 *   logic: [{
 *     type: 'propertyDerivation',
 *     targetProperty: 'options',
 *     functionName: 'getCitiesForCountry',
 *     dependsOn: ['country']
 *   }]
 * }
 *
 * // Derive label conditionally
 * {
 *   key: 'phone',
 *   type: 'input',
 *   logic: [{
 *     type: 'propertyDerivation',
 *     targetProperty: 'label',
 *     value: 'Mobile Phone',
 *     condition: {
 *       type: 'fieldValue',
 *       fieldPath: 'contactType',
 *       operator: 'equals',
 *       value: 'mobile'
 *     }
 *   }]
 * }
 * ```
 *
 * @public
 */
export type PropertyDerivationLogicConfig = OnChangePropertyDerivationLogicConfig | DebouncedPropertyDerivationLogicConfig;

/**
 * Union type for all logic configurations.
 *
 * - `StateLogicConfig`: For field state changes (hidden, readonly, disabled, required)
 * - `DerivationLogicConfig`: For value derivation
 * - `PropertyDerivationLogicConfig`: For property derivation
 *
 * @public
 */
export type LogicConfig = StateLogicConfig | DerivationLogicConfig | PropertyDerivationLogicConfig;

/**
 * Log level for derivation debug output.
 *
 * - 'none': No debug logging
 * - 'summary': Log cycle completion with counts (default in dev mode)
 * - 'verbose': Log individual derivation evaluations with details
 *
 * @public
 */
export type DerivationLogLevel = 'none' | 'summary' | 'verbose';

/**
 * Configuration for derivation debug logging.
 *
 * @public
 */
export interface DerivationLogConfig {
  /** Log level for derivation debugging. Defaults to 'none'. */
  level: DerivationLogLevel;
}

/**
 * Creates the default derivation log configuration.
 *
 * Defaults to 'none' (silent). Users can enable logging via `withLoggerConfig`.
 *
 * @returns Default DerivationLogConfig
 *
 * @public
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
 *
 * @public
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
 *
 * @public
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
 *
 * @public
 */
export function isStateLogicConfig(config: LogicConfig): config is StateLogicConfig {
  return config.type === 'hidden' || config.type === 'readonly' || config.type === 'disabled' || config.type === 'required';
}

/**
 * Type guard to check if a logic config is a DerivationLogicConfig.
 *
 * @param config - The logic config to check
 * @returns true if the config is for value derivation
 *
 * @public
 */
export function isDerivationLogicConfig(config: LogicConfig): config is DerivationLogicConfig {
  return config.type === 'derivation';
}

/**
 * Type guard to check if a logic config is a PropertyDerivationLogicConfig.
 *
 * @param config - The logic config to check
 * @returns true if the config is for property derivation
 *
 * @public
 */
export function isPropertyDerivationLogicConfig(config: LogicConfig): config is PropertyDerivationLogicConfig {
  return config.type === 'propertyDerivation';
}
