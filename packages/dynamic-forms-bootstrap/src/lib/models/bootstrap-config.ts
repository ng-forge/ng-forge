/** Configuration options for Bootstrap form fields. */
export interface BootstrapConfig {
  /**
   * Default size for form controls
   *
   * @default undefined
   */
  size?: 'sm' | 'lg';

  /**
   * Whether to use floating labels by default for inputs
   *
   * @default false
   */
  floatingLabel?: boolean;

  /**
   * Default variant for buttons
   *
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'link';

  /**
   * Whether buttons should be outlined by default
   *
   * @default false
   */
  outline?: boolean;

  /**
   * Whether buttons should be block-level by default
   *
   * @default false
   */
  block?: boolean;
}
