/**
 * Represents the state information of a single form field.
 *
 * Used in evaluation contexts to allow expressions and conditions
 * to reference field state (e.g., `fieldState.touched`, `formFieldState.email.dirty`).
 *
 * @public
 */
export interface FieldStateInfo {
  readonly touched: boolean;
  readonly dirty: boolean;
  /** Convenience property: equivalent to `!dirty` */
  readonly pristine: boolean;
  readonly valid: boolean;
  readonly invalid: boolean;
  readonly pending: boolean;
  readonly hidden: boolean;
  readonly readonly: boolean;
  readonly disabled: boolean;
}

/**
 * Map of field keys to their state information.
 *
 * Used as `formFieldState` in evaluation contexts to access
 * state of any field in the form by key.
 *
 * @public
 */
export type FormFieldStateMap = Record<string, FieldStateInfo | undefined>;

/**
 * Field state context for the current field being evaluated.
 *
 * Used as `fieldState` in evaluation contexts.
 *
 * @public
 */
export type FieldStateContext = FieldStateInfo;
