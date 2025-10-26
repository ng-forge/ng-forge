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
    name: MatField.INPUT,
    component: MatInputFieldComponent,
    defaultProps: {
      type: 'text',
      appearance: 'outline',
    },
  },
  {
    name: MatField.EMAIL,
    extends: MatField.INPUT,
    defaultProps: {
      type: 'email',
    },
    validators: ['email'],
  },
  {
    name: MatField.PASSWORD,
    extends: MatField.INPUT,
    defaultProps: {
      type: 'password',
      autocomplete: 'current-password',
    },
  },
  {
    name: MatField.NUMBER,
    extends: MatField.INPUT,
    defaultProps: {
      type: 'number',
    },
  },
  {
    name: MatField.TEL,
    extends: MatField.INPUT,
    defaultProps: {
      type: 'tel',
    },
  },
  {
    name: MatField.URL,
    extends: MatField.INPUT,
    defaultProps: {
      type: 'url',
    },
  },
  {
    name: MatField.SELECT,
    component: MatSelectFieldComponent,
    defaultProps: {
      options: [],
      appearance: 'outline',
    },
  },
  {
    name: MatField.CHECKBOX,
    component: MatCheckboxFieldComponent,
    defaultProps: {
      color: 'primary',
      labelPosition: 'after',
    },
  },
  {
    name: MatField.SUBMIT,
    component: MatSubmitFieldComponent,
    defaultProps: {
      color: 'primary',
    },
  },
  {
    name: MatField.TEXTAREA,
    component: MatTextareaFieldComponent,
    defaultProps: {
      rows: 4,
      resize: 'vertical',
      appearance: 'outline',
    },
  },
  {
    name: MatField.RADIO,
    component: MatRadioFieldComponent,
    defaultProps: {
      color: 'primary',
      labelPosition: 'after',
      appearance: 'outline',
      options: [],
    },
  },
  {
    name: MatField.MULTI_CHECKBOX,
    component: MatMultiCheckboxFieldComponent,
    defaultProps: {
      color: 'primary',
      labelPosition: 'after',
      appearance: 'fill',
      options: [],
    },
  },
  {
    name: MatField.DATEPICKER,
    component: MatDatepickerFieldComponent,
    defaultProps: {
      startView: 'month',
      touchUi: false,
      appearance: 'fill',
    },
  },
  {
    name: MatField.SLIDER,
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
    name: MatField.TOGGLE,
    component: MatToggleFieldComponent,
    defaultProps: {
      labelPosition: 'after',
      color: 'primary',
      appearance: 'fill',
    },
  },
];
