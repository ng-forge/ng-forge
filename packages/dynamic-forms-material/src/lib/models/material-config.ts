import { MatFormFieldAppearance, SubscriptSizing } from '@angular/material/form-field';

/**
 * Configuration options for Material Design form fields.
 * These settings will be applied as defaults to all Material form fields
 * unless overridden by individual field props.
 */
export interface MaterialConfig {
  /**
   * Default appearance for Material form fields
   * @default 'outline'
   */
  appearance?: MatFormFieldAppearance;

  /**
   * Default subscript sizing for Material form fields
   * @default 'dynamic'
   */
  subscriptSizing?: SubscriptSizing;

  /**
   * Whether to disable ripple effects by default
   * @default false
   */
  disableRipple?: boolean;
}
