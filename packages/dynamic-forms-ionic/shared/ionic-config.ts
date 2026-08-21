/** Configuration options for Ionic form fields. */
export interface IonicConfig {
  /** Default fill style for form inputs. */
  fill?: 'solid' | 'outline';

  /** Default shape for form controls. */
  shape?: 'round';

  /** Default label placement for form inputs. */
  labelPlacement?: 'start' | 'end' | 'fixed' | 'stacked' | 'floating';

  /** Default color theme for form controls. */
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'light' | 'medium' | 'dark';

  /** Default size for buttons. */
  size?: 'small' | 'default' | 'large';

  /** Default expand behavior for buttons. */
  expand?: 'full' | 'block';

  /** Default fill style for buttons, overriding the general fill. */
  buttonFill?: 'clear' | 'outline' | 'solid' | 'default';

  /** Whether buttons should use strong text by default. */
  strong?: boolean;
}
