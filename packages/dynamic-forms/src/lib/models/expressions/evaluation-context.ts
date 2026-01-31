import type { Logger } from '../../providers/features/logger/logger.interface';

export interface EvaluationContext<TValue = unknown> {
  /** Current field value */
  fieldValue: TValue;

  /**
   * Form value for the current evaluation scope.
   *
   * For regular (non-array) derivations, this contains the complete form value.
   * For array item derivations, this is scoped to the current array item.
   * Use `rootFormValue` to access the complete form when inside an array context.
   */
  formValue: Record<string, unknown>;

  /** Field path for relative references */
  fieldPath: string;

  /** Custom evaluation functions */
  customFunctions?: Record<string, (context: EvaluationContext) => unknown>;

  /** Logger for diagnostic output */
  logger: Logger;

  /**
   * Root form value when inside an array context.
   *
   * This provides access to values outside the current array item.
   * When a derivation targets an array item field (e.g., `items.$.lineTotal`),
   * `formValue` is scoped to the current array item, while `rootFormValue`
   * provides access to the entire form value including fields outside the array.
   *
   * @example
   * ```typescript
   * // In an array item derivation (on the lineTotal field inside lineItems array):
   * {
   *   key: 'lineTotal',
   *   type: 'input',
   *   // formValue = current array item { quantity: 2, unitPrice: 50 }
   *   // rootFormValue = entire form { globalDiscount: 0.1, lineItems: [...] }
   *   derivation: 'formValue.quantity * formValue.unitPrice * (1 - rootFormValue.globalDiscount)'
   * }
   * ```
   *
   * For non-array derivations, `rootFormValue` is not set and `formValue`
   * contains the entire form value.
   */
  rootFormValue?: Record<string, unknown>;

  /**
   * Current array index when inside an array derivation.
   */
  arrayIndex?: number;

  /**
   * Path to the array field when inside an array derivation.
   */
  arrayPath?: string;

  /**
   * External data signals resolved to their current values.
   *
   * This allows forms to reference data from outside the form context
   * in conditional logic, derivations, and other expressions.
   *
   * @example
   * ```typescript
   * // In form config:
   * externalData: {
   *   userRole: computed(() => this.userService.currentRole()),
   *   permissions: computed(() => this.authService.permissions()),
   * }
   *
   * // In JavaScript expression:
   * condition: {
   *   type: 'javascript',
   *   expression: "externalData.userRole === 'admin'"
   * }
   * ```
   */
  externalData?: Record<string, unknown>;

  /** Allow additional properties for flexible expression evaluation */
  [key: string]: unknown;
}
