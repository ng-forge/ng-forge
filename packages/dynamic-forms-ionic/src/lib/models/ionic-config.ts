/**
 * Configuration options for Ionic form fields.
 *
 * These settings can be applied at two levels:
 * - **Library-level**: Via `withIonicFields({ ... })` - applies to all forms
 * - **Form-level**: Via `defaultProps` in form config - applies to a specific form
 *
 * The cascade hierarchy is: Library-level → Form-level → Field-level
 *
 * @example
 * ```typescript
 * // Library-level (in app config)
 * provideDynamicForms(withIonicFields({ fill: 'outline', labelPlacement: 'floating' }))
 *
 * // Form-level (in form config)
 * const config: IonicFormConfig = {
 *   defaultProps: { color: 'tertiary' },
 *   fields: [...]
 * };
 * ```
 */
export interface IonicConfig {
  /**
   * Default fill style for form inputs
   * @default 'solid'
   */
  fill?: 'solid' | 'outline';

  /**
   * Default shape for form controls
   * @default undefined
   */
  shape?: 'round';

  /**
   * Default label placement for form inputs
   * @default 'start'
   */
  labelPlacement?: 'start' | 'end' | 'fixed' | 'stacked' | 'floating';

  /**
   * Default color theme for form controls
   * @default 'primary'
   */
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'light' | 'medium' | 'dark';

  /**
   * Default size for buttons
   * @default 'default'
   */
  size?: 'small' | 'default' | 'large';

  /**
   * Default expand behavior for buttons
   * @default undefined
   */
  expand?: 'full' | 'block';

  /**
   * Default fill style for buttons (overrides general fill if set)
   * @default 'solid'
   */
  buttonFill?: 'clear' | 'outline' | 'solid' | 'default';

  /**
   * Whether buttons should be strong (bold) by default
   * @default false
   */
  strong?: boolean;
}
