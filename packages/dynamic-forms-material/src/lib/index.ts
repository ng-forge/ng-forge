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
  MatCheckboxComponent,
  MatDatepickerProps,
  MatDatepickerField,
  MatDatepickerComponent,
  MatInputProps,
  MatInputField,
  MatInputComponent,
  MatMultiCheckboxProps,
  MatMultiCheckboxField,
  MatMultiCheckboxComponent,
  MatRadioProps,
  MatRadioField,
  MatRadioComponent,
  MatSelectProps,
  MatSelectField,
  MatSelectComponent,
  MatSliderProps,
  MatSliderField,
  MatSliderComponent,
  MatButtonProps,
  MatButtonField,
  MatSubmitButtonField,
  MatNextButtonField,
  MatPreviousButtonField,
  AddArrayItemButtonField,
  PrependArrayItemButtonField,
  InsertArrayItemButtonField,
  RemoveArrayItemButtonField,
  PopArrayItemButtonField,
  ShiftArrayItemButtonField,
  MatTextareaProps,
  MatTextareaField,
  MatTextareaComponent,
  MatToggleProps,
  MatToggleField,
  MatToggleComponent,
} from './fields';

// Configuration
export { MATERIAL_FIELD_TYPES } from './config/material-field-config';
export { MATERIAL_CONFIG } from './models';
export type { MaterialConfig } from './models';

// Types and constants
export { MatField, type MatFieldType } from './types/types';
export type { MatFormProps, MatFormConfig } from './types/form-config';

// IMPORTANT: side-effect imports — these augment global type registries
// (DynamicFormFieldRegistry, DynamicFormAddonRegistry) so `type: 'input'`,
// `kind: 'mat-icon'`, and similar resolve at the call site. Without these,
// consumer typechecks fall back to the empty base registries.
import './types/registry-augmentation';
import './types/addons';

// Providers
export { withMaterialFields, withMaterialAddons } from './providers/material-providers';

// Addon kinds
export { MatIconAddonComponent } from './addons/mat-icon-addon.component';
export { MatButtonAddonComponent } from './addons/mat-button-addon.component';
export type { MatIconAddon, MatButtonAddon, MatAddon } from './types/addons';
export type { MatInputAddon, MatAddonExtensions } from './fields/input/mat-input.type';
export { MAT_INPUT_TYPE_OVERRIDE } from './tokens/input-type-override.token';
