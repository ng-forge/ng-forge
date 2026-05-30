/** Represents the state information of a single form field. */
export interface FieldStateInfo {
  readonly touched: boolean;
  readonly dirty: boolean;
  /** Convenience property: equivalent to `!dirty` */
  readonly pristine: boolean;
  readonly valid: boolean;
  readonly invalid: boolean;
  readonly pending: boolean;
  /** Whether the field is currently hidden. */
  readonly hidden: boolean;
  /** Whether the field is currently readonly. */
  readonly readonly: boolean;
  /** Whether the field is currently disabled. */
  readonly disabled: boolean;
}

/** Map of field keys to their state information. */
export type FormFieldStateMap = Record<string, FieldStateInfo | undefined>;

/** Field state context for the current field being evaluated. */
export type FieldStateContext = FieldStateInfo;
