import { SelectField } from '@ng-forge/dynamic-form';
import { MatFormFieldAppearance } from '@angular/material/form-field';

/**
 * Material Design select field interface
 * Extends the base SelectField with Material-specific properties
 */
export interface MatSelectField<T = any> extends SelectField<T> {
  /** Material form field appearance */
  appearance?: MatFormFieldAppearance;
  /** Multiple selection */
  multiple?: boolean;
  /** Select panel max height */
  panelMaxHeight?: string;
}
