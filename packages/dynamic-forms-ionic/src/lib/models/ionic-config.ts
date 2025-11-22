/**
 * Configuration options for Ionic form fields.
 * These settings will be applied as defaults to all Ionic form fields
 * unless overridden by individual field props.
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
