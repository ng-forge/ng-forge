/**
 * Configuration for excluding field values from form submission output
 * based on their reactive state (hidden, disabled, readonly).
 *
 * Supports a 3-tier configuration hierarchy: Field > Form > Global.
 * The most specific level wins for each property.
 *
 * @public
 */
export interface ValueExclusionConfig {
  /**
   * Whether to exclude the value of hidden fields from submission output.
   *
   * When `true`, fields whose `hidden()` state is `true` will have their
   * values omitted from the submitted form value.
   *
   * @remarks
   * This does NOT affect HiddenField (`type: 'hidden'`) — those fields
   * store values without UI and their `hidden()` state is always `false`.
   */
  readonly excludeValueIfHidden?: boolean;

  /**
   * Whether to exclude the value of disabled fields from submission output.
   *
   * When `true`, fields whose `disabled()` state is `true` will have their
   * values omitted from the submitted form value.
   */
  readonly excludeValueIfDisabled?: boolean;

  /**
   * Whether to exclude the value of readonly fields from submission output.
   *
   * When `true`, fields whose `readonly()` state is `true` will have their
   * values omitted from the submitted form value.
   */
  readonly excludeValueIfReadonly?: boolean;
}

/**
 * Fully resolved exclusion config with all properties required.
 * Produced by the 3-tier resolution: `field ?? form ?? global`.
 *
 * @public
 */
export type ResolvedValueExclusionConfig = Required<ValueExclusionConfig>;
