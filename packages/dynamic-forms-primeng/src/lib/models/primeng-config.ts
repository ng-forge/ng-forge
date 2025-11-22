/**
 * Configuration options for PrimeNG form fields.
 * These settings will be applied as defaults to all PrimeNG form fields
 * unless overridden by individual field props.
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
