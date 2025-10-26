import { InputField } from '@ng-forge/dynamic-form';
import { MatFormFieldAppearance } from '@angular/material/form-field';

/**
 * Material Design input field interface
 * Extends the base InputField with Material-specific properties
 */
export interface MatInputField extends InputField {
  /** Material form field appearance */
  appearance?: MatFormFieldAppearance;
}
