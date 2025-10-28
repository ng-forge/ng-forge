import type { FieldTypeDefinition } from '@ng-forge/dynamic-form';
import { MatField } from '../types/material-field-types.enum';
import { MatInputFieldComponent } from '../fields/input/mat-input.component';
import { MatSelectFieldComponent } from '../fields/select/mat-select.component';
import { MatCheckboxFieldComponent } from '../fields/checkbox/mat-checkbox.component';
import { MatSubmitFieldComponent } from '../fields/submit/mat-submit.component';
import { MatTextareaFieldComponent } from '../fields/textarea/mat-textarea.component';
import { MatRadioFieldComponent } from '../fields/radio/mat-radio.component';
import { MatMultiCheckboxFieldComponent } from '../fields/multi-checkbox/mat-multi-checkbox.component';
import { MatDatepickerFieldComponent } from '../fields/datepicker/mat-datepicker.component';
import { MatSliderFieldComponent } from '../fields/slider/mat-slider.component';
import { MatToggleFieldComponent } from '../fields/toggle/mat-toggle.component';

/**
 * Material Design field type definitions
 * Follows the FieldTypeDefinition interface for proper registry integration
 */
export const MATERIAL_FIELD_TYPES: FieldTypeDefinition[] = [
  {
    name: MatField.Input,
    component: MatInputFieldComponent,
    defaultProps: {
      type: 'text',
      appearance: 'outline',
    },
  },
  {
    name: MatField.Email,
    extends: MatField.Input,
    defaultProps: {
      type: 'email',
    },
    validators: ['email'],
  },
  {
    name: MatField.Password,
    extends: MatField.Input,
    defaultProps: {
      type: 'password',
      autocomplete: 'current-password',
    },
  },
  {
    name: MatField.Number,
    extends: MatField.Input,
    defaultProps: {
      type: 'number',
    },
  },
  {
    name: MatField.Tel,
    extends: MatField.Input,
    defaultProps: {
      type: 'tel',
    },
  },
  {
    name: MatField.Url,
    extends: MatField.Input,
    defaultProps: {
      type: 'url',
    },
  },
  {
    name: MatField.Select,
    component: MatSelectFieldComponent,
    defaultProps: {
      options: [],
      appearance: 'outline',
    },
  },
  {
    name: MatField.Checkbox,
    component: MatCheckboxFieldComponent,
    defaultProps: {
      color: 'primary',
      labelPosition: 'after',
    },
  },
  {
    name: MatField.Submit,
    component: MatSubmitFieldComponent,
    defaultProps: {
      color: 'primary',
    },
  },
  {
    name: MatField.Textarea,
    component: MatTextareaFieldComponent,
    defaultProps: {
      rows: 4,
      resize: 'vertical',
      appearance: 'outline',
    },
  },
  {
    name: MatField.Radio,
    component: MatRadioFieldComponent,
    defaultProps: {
      color: 'primary',
      labelPosition: 'after',
      appearance: 'outline',
      options: [],
    },
  },
  {
    name: MatField.MultiCheckbox,
    component: MatMultiCheckboxFieldComponent,
    defaultProps: {
      color: 'primary',
      labelPosition: 'after',
      appearance: 'fill',
      options: [],
    },
  },
  {
    name: MatField.Datepicker,
    component: MatDatepickerFieldComponent,
    defaultProps: {
      startView: 'month',
      touchUi: false,
      appearance: 'fill',
    },
  },
  {
    name: MatField.Slider,
    component: MatSliderFieldComponent,
    defaultProps: {
      minValue: 0,
      maxValue: 100,
      step: 1,
      thumbLabel: false,
      color: 'primary',
      appearance: 'fill',
    },
  },
  {
    name: MatField.Toggle,
    component: MatToggleFieldComponent,
    defaultProps: {
      labelPosition: 'after',
      color: 'primary',
      appearance: 'fill',
    },
  },
];
