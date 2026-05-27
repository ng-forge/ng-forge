import { FloatLabelType, MatFormFieldAppearance, SubscriptSizing } from '@angular/material/form-field';
import { ThemePalette } from '@angular/material/core';

/** Configuration options for Material Design form fields. */
export interface MaterialConfig {
  /**
   * Default appearance for Material form fields
   *
   * @default 'outline'
   */
  appearance?: MatFormFieldAppearance;

  /**
   * Default subscript sizing for Material form fields
   *
   * @default 'dynamic'
   */
  subscriptSizing?: SubscriptSizing;

  /**
   * Whether to disable ripple effects by default
   *
   * @default false
   */
  disableRipple?: boolean;

  /**
   * Default color theme for form controls (checkboxes, radios, sliders, toggles)
   *
   * @default 'primary'
   */
  color?: ThemePalette;

  /**
   * Default label position for checkboxes and radios
   *
   * @default 'after'
   */
  labelPosition?: 'before' | 'after';

  /**
   * Default float label behavior for form fields
   *
   * @default 'auto'
   */
  floatLabel?: FloatLabelType;

  /**
   * Whether to hide the required marker by default
   *
   * @default false
   */
  hideRequiredMarker?: boolean;
}
