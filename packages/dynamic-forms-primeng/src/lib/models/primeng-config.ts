/**
 * Configuration options for PrimeNG form fields.
 *
 * These settings can be applied at two levels:
 * - **Library-level**: Via `withPrimeNGFields({ ... })` - applies to all forms
 * - **Form-level**: Via `defaultProps` in form config - applies to a specific form
 *
 * The cascade hierarchy is: Library-level → Form-level → Field-level
 *
 * @example
 * ```typescript
 * // Library-level (in app config)
 * provideDynamicForms(withPrimeNGFields({ size: 'small', variant: 'filled' }))
 *
 * // Form-level (in form config)
 * const config: PrimeFormConfig = {
 *   defaultProps: { variant: 'outlined' },
 *   fields: [...]
 * };
 * ```
 */
export interface PrimeNGConfig {
  /**
   * Default size variant for form inputs
   * @default undefined
   */
  size?: 'small' | 'large';

  /**
   * Default visual variant for form inputs
   * @default 'outlined'
   */
  variant?: 'outlined' | 'filled';

  /**
   * Default severity for buttons
   * @default 'primary'
   */
  severity?: 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'help' | 'contrast';

  /**
   * Whether buttons should be text-only by default
   * @default false
   */
  text?: boolean;

  /**
   * Whether buttons should be outlined by default
   * @default false
   */
  outlined?: boolean;

  /**
   * Whether buttons should be raised by default
   * @default false
   */
  raised?: boolean;

  /**
   * Whether buttons should be rounded by default
   * @default false
   */
  rounded?: boolean;
}
