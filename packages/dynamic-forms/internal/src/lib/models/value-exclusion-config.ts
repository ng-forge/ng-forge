/**
 * Configuration for excluding field values from form submission output
 * based on their reactive state (hidden, disabled, readonly).
 */
export interface ValueExclusionConfig {
  /**
   * Whether to exclude the value of hidden fields from submission output.
   *
   * @remarks
   * This does NOT affect HiddenField (`type: 'hidden'`) — those fields
   * store values without UI and their `hidden()` state is always `false`.
   */
  readonly excludeValueIfHidden?: boolean;

  /** Whether to exclude the value of disabled fields from submission output. */
  readonly excludeValueIfDisabled?: boolean;

  /** Whether to exclude the value of readonly fields from submission output. */
  readonly excludeValueIfReadonly?: boolean;
}

/**
 * Fully resolved exclusion config with all properties required.
 * Produced by the 3-tier resolution: `field ?? form ?? global`.
 */
export type ResolvedValueExclusionConfig = Required<ValueExclusionConfig>;
