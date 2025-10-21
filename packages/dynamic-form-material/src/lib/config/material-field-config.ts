import { FieldTypeDefinition } from '@ng-forge/dynamic-form';
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
 */
export const MATERIAL_FIELD_TYPES: FieldTypeDefinition[] = [
  {
    name: 'input',
    component: MatInputFieldComponent,
    defaultProps: {
      type: 'text',
      appearance: 'outline',
    },
  },
  {
    name: 'email',
    extends: 'input',
    defaultProps: {
      type: 'email',
    },
    validators: ['email'],
  },
  {
    name: 'password',
    extends: 'input',
    defaultProps: {
      type: 'password',
      autocomplete: 'current-password',
    },
  },
  {
    name: 'number',
    extends: 'input',
    defaultProps: {
      type: 'number',
    },
  },
  {
    name: 'tel',
    extends: 'input',
    defaultProps: {
      type: 'tel',
    },
  },
  {
    name: 'url',
    extends: 'input',
    defaultProps: {
      type: 'url',
    },
  },
  {
    name: 'select',
    component: MatSelectFieldComponent,
    defaultProps: {
      options: [],
      appearance: 'outline',
    },
  },
  {
    name: 'checkbox',
    component: MatCheckboxFieldComponent,
    defaultProps: {
      color: 'primary',
      labelPosition: 'after',
    },
  },
  {
    name: 'submit',
    component: MatSubmitFieldComponent,
    defaultProps: {
      color: 'primary',
    },
  },
  {
    name: 'textarea',
    component: MatTextareaFieldComponent,
    defaultProps: {
      rows: 4,
      resize: 'vertical',
      appearance: 'outline',
    },
  },
  {
    name: 'radio',
    component: MatRadioFieldComponent,
    defaultProps: {
      color: 'primary',
      labelPosition: 'after',
      appearance: 'outline',
      options: [],
    },
  },
  {
    name: 'multi-checkbox',
    component: MatMultiCheckboxFieldComponent,
    defaultProps: {
      color: 'primary',
      labelPosition: 'after',
      appearance: 'fill',
      options: [],
    },
  },
  {
    name: 'datepicker',
    component: MatDatepickerFieldComponent,
    defaultProps: {
      startView: 'month',
      touchUi: false,
      appearance: 'fill',
    },
  },
  {
    name: 'slider',
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
    name: 'toggle',
    component: MatToggleFieldComponent,
    defaultProps: {
      labelPosition: 'after',
      color: 'primary',
      appearance: 'fill',
    },
  },
];
