/** Configuration options for Bootstrap form fields. */
export interface BootstrapConfig {
  /** Default size for form controls. */
  size?: 'sm' | 'lg';
  /** Whether to use floating labels by default for inputs. */
  floatingLabel?: boolean;
  /** Default variant for buttons. */
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'link';
  /** Whether buttons should be outlined by default. */
  outline?: boolean;
  /** Whether buttons should be block-level by default. */
  block?: boolean;
}
