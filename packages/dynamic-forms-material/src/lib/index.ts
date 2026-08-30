// Field components
export {
  MatCheckboxFieldComponent,
  MatDatepickerFieldComponent,
  MatInputFieldComponent,
  MatMultiCheckboxFieldComponent,
  MatRadioFieldComponent,
  MatSelectFieldComponent,
  MatSliderFieldComponent,
  MatButtonFieldComponent,
  MatTextareaFieldComponent,
  MatToggleFieldComponent,
} from './fields';
export type {
  MatCheckboxProps,
  MatCheckboxField,
  MatDatepickerProps,
  MatDatepickerField,
  MatInputProps,
  MatInputField,
  MatMultiCheckboxProps,
  MatMultiCheckboxField,
  MatRadioProps,
  MatRadioField,
  MatSelectProps,
  MatSelectField,
  MatSliderProps,
  MatSliderField,
  MatButtonProps,
  MatButtonField,
  MatSubmitButtonField,
  MatNextButtonField,
  MatPreviousButtonField,
  MatAddArrayItemButtonField,
  MatPrependArrayItemButtonField,
  MatInsertArrayItemButtonField,
  MatRemoveArrayItemButtonField,
  MatPopArrayItemButtonField,
  MatShiftArrayItemButtonField,
  MatTextareaProps,
  MatTextareaField,
  MatToggleProps,
  MatToggleField,
} from './fields';

// Configuration
export { MATERIAL_FIELD_TYPES } from './config/material-field-config';
export { MATERIAL_CONFIG, MAT_INPUT_TYPE_OVERRIDE, type MaterialConfig } from '@ng-forge/dynamic-forms-material/shared';

// Types and constants
export { MatField, type MatFieldType } from './types/types';
export type { MatFormProps, MatFormConfig } from './types/form-config';

// IMPORTANT: side-effect imports — these augment global type registries
// (DynamicFormFieldRegistry, DynamicFormAddonRegistry) so `type: 'input'`,
// `type: 'mat-icon'`, and similar resolve at the call site. Without these,
// consumer typechecks fall back to the empty base registries.
import './types/registry-augmentation';

// Providers
export { withMaterialFields, withMaterialAddons } from './providers/material-providers';

// Addon types
export { MatIconAddonComponent } from './addons/mat-icon-addon.component';
export { MatButtonAddonComponent } from './addons/mat-button-addon.component';
export type { MatIconAddon, MatButtonAddon, MatAddon } from '@ng-forge/dynamic-forms-material/shared';
export type { MatInputAddon, MatAddonExtensions } from './fields/input/mat-input.type';
