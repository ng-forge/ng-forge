/** Configuration for when validation runs based on a field's reactive state. */
export interface ValidationExecutionConfig {
  /**
   * Whether validators run while a field is hidden (statically, via `hidden`
   * logic, or because any ancestor is hidden).
   */
  readonly validateWhenHidden?: boolean;
}

/** Fully resolved validation execution config — every property defined. */
export type ResolvedValidationExecutionConfig = Required<ValidationExecutionConfig>;
