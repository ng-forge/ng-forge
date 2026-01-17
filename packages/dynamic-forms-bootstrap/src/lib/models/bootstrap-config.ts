/**
 * Configuration options for Bootstrap form fields.
 *
 * These settings can be applied at two levels:
 * - **Library-level**: Via `withBootstrapFields({ ... })` - applies to all forms
 * - **Form-level**: Via `defaultProps` in form config - applies to a specific form
 *
 * The cascade hierarchy is: Library-level → Form-level → Field-level
 *
 * @example
 * ```typescript
 * // Library-level (in app config)
 * provideDynamicForms(withBootstrapFields({ size: 'sm', floatingLabel: true }))
 *
 * // Form-level (in form config)
 * const config: BsFormConfig = {
 *   defaultProps: { size: 'lg' },
 *   fields: [...]
 * };
 * ```
 */
export interface BootstrapConfig {
  /**
   * Default size for form controls
   * @default undefined
   */
  size?: 'sm' | 'lg';

  /**
   * Whether to use floating labels by default for inputs
   * @default false
   */
  floatingLabel?: boolean;

  /**
   * Default variant for buttons
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'link';

  /**
   * Whether buttons should be outlined by default
   * @default false
   */
  outline?: boolean;

  /**
   * Whether buttons should be block-level by default
   * @default false
   */
  block?: boolean;
}
