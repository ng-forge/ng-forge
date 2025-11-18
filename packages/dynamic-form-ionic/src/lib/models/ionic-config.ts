/**
 * Global configuration for Ionic fields.
 *
 * This configuration can be provided at the application, route, or component level
 * to set default values for all Ionic fields. Field-level props will override
 * these global defaults.
 *
 * @example
 * ```typescript
 * // Application-level setup
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideDynamicForm(...withIonicFields()),
 *     ...withIonicConfig({ fill: 'outline', shape: 'round' })
 *   ]
 * });
 * ```
 *
 * @public
 */
export interface IonicConfig {
  /**
   * Default fill style for input and select fields.
   *
   * - `solid`: Filled background
   * - `outline`: Outline border
   *
   * @default 'solid'
   */
  fill?: 'solid' | 'outline';

  /**
   * Default shape for input, select, and button fields.
   *
   * - `round`: Rounded corners
   *
   * @default undefined (uses Ionic default)
   */
  shape?: 'round';

  /**
   * Default label placement for input and select fields.
   *
   * - `start`: Label at the start (left in LTR)
   * - `end`: Label at the end (right in LTR)
   * - `fixed`: Fixed width label
   * - `stacked`: Label above the input
   * - `floating`: Label floats when focused or filled
   *
   * @default 'floating'
   */
  labelPlacement?: 'start' | 'end' | 'fixed' | 'stacked' | 'floating';

  /**
   * Enable clear button for input fields.
   *
   * @default false
   */
  inputClearInput?: boolean;

  /**
   * Enable character counter for input fields.
   *
   * Requires `maxlength` to be set on the field.
   *
   * @default false
   */
  inputCounter?: boolean;

  /**
   * Default fill style for buttons.
   *
   * - `clear`: No background or border
   * - `outline`: Outline border
   * - `solid`: Filled background
   * - `default`: Default button style
   *
   * @default 'solid'
   */
  buttonFill?: 'clear' | 'outline' | 'solid' | 'default';

  /**
   * Default size for buttons.
   *
   * - `small`: Small/compact size
   * - `default`: Default size
   * - `large`: Large size
   *
   * @default 'default'
   */
  buttonSize?: 'small' | 'default' | 'large';

  /**
   * Default button expand behavior.
   *
   * - `full`: Full width with no border radius
   * - `block`: Full width with border radius
   *
   * @default undefined
   */
  buttonExpand?: 'full' | 'block';

  /**
   * Enable bold text for buttons.
   *
   * @default false
   */
  buttonStrong?: boolean;

  /**
   * Default interface for select fields.
   *
   * - `action-sheet`: Action sheet overlay (mobile)
   * - `popover`: Popover overlay
   * - `alert`: Alert dialog
   *
   * @default 'alert'
   */
  selectInterface?: 'action-sheet' | 'popover' | 'alert';
}
