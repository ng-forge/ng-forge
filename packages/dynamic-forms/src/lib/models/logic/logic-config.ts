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
   *   type: 'derivation',
   *   debugName: 'Calculate line total',
   *   targetField: '$.lineTotal',
   *   expression: 'formValue.quantity * formValue.unitPrice'
   * }
   * ```
   */
  debugName?: string;

  /**
   * The field whose value will be modified.
   *
   * Can be:
   * - Absolute path: 'fieldName' or 'nested.field.path'
   * - Relative path for arrays: '$.siblingField' (same index as source)
   *
   * @example
   * ```typescript
   * targetField: 'phonePrefix'           // Absolute path
   * targetField: 'address.country'       // Nested path
   * targetField: '$.lineTotal'           // Relative path (array sibling)
   * ```
   */
  targetField: string;

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
   * Static value to set on the target field.
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
   *   type: 'derivation',
   *   targetField: 'currency',
   *   functionName: 'getCurrencyForCountry',
   *   dependsOn: ['country']
   * }
   *
   * // Override automatic detection for complex expressions
   * {
   *   type: 'derivation',
   *   targetField: 'total',
   *   expression: 'calculateTotal(formValue)',
   *   dependsOn: ['quantity', 'unitPrice', 'discount']
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
 * When the condition is met, the target field's value is set
 * using a static value, expression, or custom function.
 *
 * @example
 * ```typescript
 * // Set phone prefix based on country selection
 * {
 *   type: 'derivation',
 *   targetField: 'phonePrefix',
 *   value: '+1',
 *   condition: {
 *     type: 'fieldValue',
 *     fieldPath: 'country',
 *     operator: 'equals',
 *     value: 'USA'
 *   }
 * }
 *
 * // Compute total from quantity and price
 * {
 *   type: 'derivation',
 *   targetField: 'total',
 *   expression: 'formValue.quantity * formValue.unitPrice'
 * }
 *
 * // Use custom function for complex logic
 * {
 *   type: 'derivation',
 *   targetField: 'currency',
 *   functionName: 'getCurrencyForCountry'
 * }
 *
 * // Self-transform with debounced trigger
 * // (applies after user stops typing)
 * {
 *   type: 'derivation',
 *   targetField: 'email',
 *   expression: 'formValue.email.toLowerCase()',
 *   trigger: 'debounced',
 *   debounceMs: 500
 * }
 *
 * // Relative path for array items
 * {
 *   type: 'derivation',
 *   targetField: '$.lineTotal',  // Same array index as source field
 *   expression: 'formValue.quantity * formValue.unitPrice'
 * }
 * ```
 *
 * @public
 */
export type DerivationLogicConfig = OnChangeDerivationLogicConfig | DebouncedDerivationLogicConfig;

/**
 * Union type for all logic configurations.
 *
 * - `StateLogicConfig`: For field state changes (hidden, readonly, disabled, required)
 * - `DerivationLogicConfig`: For value derivation
 *
 * @public
 */
export type LogicConfig = StateLogicConfig | DerivationLogicConfig;

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
