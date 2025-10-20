import { FieldTypeDefinition } from '@ng-forge/dynamic-form';
import { MatInputFieldComponent } from '../fields/input/mat-input.component';
import { MatSelectFieldComponent } from '../fields/select/mat-select.component';
import { MatCheckboxFieldComponent } from '../fields/checkbox/mat-checkbox.component';
import { MatSubmitFieldComponent } from '../fields/submit/mat-submit.component';

/**
 * Material Design field type definitions
 */
export const MATERIAL_FIELD_TYPES: FieldTypeDefinition[] = [
  {
    name: 'input',
    component: MatInputFieldComponent,
    defaultProps: {
      type: 'text',
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
];
