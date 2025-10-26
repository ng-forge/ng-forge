import { ToggleField } from '@ng-forge/dynamic-form';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import { ThemePalette } from '@angular/material/core';

/**
 * Material Design toggle field interface
 * Extends the base ToggleField with Material-specific properties
 */
export interface MatToggleField extends ToggleField {
  /** Material form field appearance */
  appearance?: MatFormFieldAppearance;
  /** Material color theme */
  color?: ThemePalette;
  /** Label position relative to toggle */
  labelPosition?: 'before' | 'after';
  /** Disable ripple effect */
  disableRipple?: boolean;
}
