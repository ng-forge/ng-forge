import { MatFormFieldAppearance, SubscriptSizing } from '@angular/material/form-field';
import { ThemePalette } from '@angular/material/core';

/**
 * Configuration options for Material Design form fields.
 *
 * These settings can be applied at two levels:
 * - **Library-level**: Via `withMaterialFields({ ... })` - applies to all forms
 * - **Form-level**: Via `defaultProps` in form config - applies to a specific form
 *
 * The cascade hierarchy is: Library-level → Form-level → Field-level
 *
 * @example
 * ```typescript
 * // Library-level (in app config)
 * provideDynamicForms(withMaterialFields({ appearance: 'outline' }))
 *
 * // Form-level (in form config)
 * const config: MatFormConfig = {
 *   defaultProps: { appearance: 'fill' },
 *   fields: [...]
 * };
 * ```
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

  /**
   * Default color theme for form controls (checkboxes, radios, sliders, toggles)
   * @default 'primary'
   */
  color?: ThemePalette;

  /**
   * Default label position for checkboxes and radios
   * @default 'after'
   */
  labelPosition?: 'before' | 'after';
}
