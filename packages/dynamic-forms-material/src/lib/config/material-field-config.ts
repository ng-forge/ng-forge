import { FieldTypeDefinition } from '@ng-forge/dynamic-forms';
import { checkboxFieldMapper, datepickerFieldMapper, optionsFieldMapper, valueFieldMapper } from '@ng-forge/dynamic-forms/integration';
import { MatField } from '../types/types';
import { buttonFieldMapper } from '../fields/button/mat-button.mapper';
import {
  addArrayItemButtonFieldMapper,
  nextButtonFieldMapper,
  previousButtonFieldMapper,
  removeArrayItemButtonFieldMapper,
  submitButtonFieldMapper,
} from '../fields/button/mat-specific-button.mapper';

/**
 * Material Design field type definitions
 * Follows the FieldTypeDefinition interface for proper registry integration
 */
export const MATERIAL_FIELD_TYPES: FieldTypeDefinition[] = [
  {
    name: MatField.Input,
    loadComponent: () => import('../fields/input/mat-input.component'),
    mapper: valueFieldMapper,
  },
  {
    name: MatField.Select,
    loadComponent: () => import('../fields/select/mat-select.component'),
    mapper: optionsFieldMapper,
  },
  {
    name: MatField.Checkbox,
    loadComponent: () => import('../fields/checkbox/mat-checkbox.component'),
    mapper: checkboxFieldMapper,
  },
  {
    name: MatField.Button,
    loadComponent: () => import('../fields/button/mat-button.component'),
    mapper: buttonFieldMapper,
    valueHandling: 'exclude',
  },
  {
    name: MatField.Submit,
    loadComponent: () => import('../fields/button/mat-button.component'),
    mapper: submitButtonFieldMapper,
    valueHandling: 'exclude',
  },
  {
    name: MatField.Next,
    loadComponent: () => import('../fields/button/mat-button.component'),
    mapper: nextButtonFieldMapper,
    valueHandling: 'exclude',
  },
  {
    name: MatField.Previous,
    loadComponent: () => import('../fields/button/mat-button.component'),
    mapper: previousButtonFieldMapper,
    valueHandling: 'exclude',
  },
  {
    name: MatField.AddArrayItem,
    loadComponent: () => import('../fields/button/mat-button.component'),
    mapper: addArrayItemButtonFieldMapper,
    valueHandling: 'exclude',
  },
  {
    name: MatField.RemoveArrayItem,
    loadComponent: () => import('../fields/button/mat-button.component'),
    mapper: removeArrayItemButtonFieldMapper,
    valueHandling: 'exclude',
  },
  {
    name: MatField.Textarea,
    loadComponent: () => import('../fields/textarea/mat-textarea.component'),
    mapper: valueFieldMapper,
  },
  {
    name: MatField.Radio,
    loadComponent: () => import('../fields/radio/mat-radio.component'),
    mapper: optionsFieldMapper,
  },
  {
    name: MatField.MultiCheckbox,
    loadComponent: () => import('../fields/multi-checkbox/mat-multi-checkbox.component'),
    mapper: optionsFieldMapper,
  },
  {
    name: MatField.Datepicker,
    loadComponent: () => import('../fields/datepicker/mat-datepicker.component'),
    mapper: datepickerFieldMapper,
  },
  {
    name: MatField.Slider,
    loadComponent: () => import('../fields/slider/mat-slider.component'),
    mapper: valueFieldMapper,
  },
  {
    name: MatField.Toggle,
    loadComponent: () => import('../fields/toggle/mat-toggle.component'),
    mapper: checkboxFieldMapper,
  },
];
