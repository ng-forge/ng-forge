/**
 * Configuration for when validation runs based on a field's reactive state.
 *
 * Currently controls whether hidden fields are validated. Resolved through a
 * tree-aware hierarchy: per-field overrides inherit down to descendants, with
 * per-form `FormOptions` and global `withValidationExecutionDefaults()` providing
 * the root inherited value.
 *
 * @public
 */
export interface ValidationExecutionConfig {
  /**
   * Whether validators run while a field is hidden (statically, via `hidden`
   * logic, or because any ancestor is hidden).
   *
   * When `false`, all validators on a hidden field are skipped — the field is
   * effectively inert until shown. State logic (hidden/disabled/readonly) and
   * value derivations continue to apply.
   */
  readonly validateWhenHidden?: boolean;
}

/**
 * Fully resolved validation execution config — every property defined.
 *
 * @public
 */
export type ResolvedValidationExecutionConfig = Required<ValidationExecutionConfig>;
