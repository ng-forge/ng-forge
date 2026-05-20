import { FieldTypeDefinition } from '@ng-forge/dynamic-forms';
import {
  addArrayItemButtonMapper,
  checkboxFieldMapper,
  datepickerFieldMapper,
  insertArrayItemButtonMapper,
  optionsFieldMapper,
  popArrayItemButtonMapper,
  prependArrayItemButtonMapper,
  removeArrayItemButtonMapper,
  shiftArrayItemButtonMapper,
  valueFieldMapper,
} from '@ng-forge/dynamic-forms/integration';
import { MatField } from '../types/types';
import { buttonFieldMapper } from '../fields/button/mat-button.mapper';
import { nextButtonFieldMapper, previousButtonFieldMapper, submitButtonFieldMapper } from '../fields/button/mat-specific-button.mapper';

/**
 * Base for value-bearing field types — waits for the mapper to emit the `field`
 * input before instantiating the component (matches NgForgeField's
 * `input.required<FieldTree<T>>()` contract).
 */
const VALUE_FIELD_TYPES_BASE = {
  renderReadyWhen: ['field'],
} as const;

/**
 * Base for action/button field types that don't bind to a form value.
 * Renders immediately, opted out of form-value collection.
 */
const BUTTON_FIELD_TYPES_BASE = {
  renderReadyWhen: [],
  valueHandling: 'exclude',
} as const;

/**
 * Material Design field type definitions
 * Follows the FieldTypeDefinition interface for proper registry integration
 */
export const MATERIAL_FIELD_TYPES: FieldTypeDefinition[] = [
  {
    name: MatField.Input,
    loadComponent: () => import('../fields/input/mat-input.component'),
    mapper: valueFieldMapper,
    propsToMeta: ['type'],
    scope: ['text-input', 'numeric'],
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: MatField.Select,
    loadComponent: () => import('../fields/select/mat-select.component'),
    mapper: optionsFieldMapper,
    scope: 'single-select',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: MatField.Checkbox,
    loadComponent: () => import('../fields/checkbox/mat-checkbox.component'),
    mapper: checkboxFieldMapper,
    scope: 'boolean',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: MatField.Button,
    loadComponent: () => import('../fields/button/mat-button.component'),
    mapper: buttonFieldMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: MatField.Submit,
    loadComponent: () => import('../fields/button/mat-button.component'),
    mapper: submitButtonFieldMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: MatField.Next,
    loadComponent: () => import('../fields/button/mat-button.component'),
    mapper: nextButtonFieldMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: MatField.Previous,
    loadComponent: () => import('../fields/button/mat-button.component'),
    mapper: previousButtonFieldMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: MatField.AddArrayItem,
    loadComponent: () => import('../fields/button/mat-button.component'),
    mapper: addArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: MatField.PrependArrayItem,
    loadComponent: () => import('../fields/button/mat-button.component'),
    mapper: prependArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: MatField.InsertArrayItem,
    loadComponent: () => import('../fields/button/mat-button.component'),
    mapper: insertArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: MatField.RemoveArrayItem,
    loadComponent: () => import('../fields/button/mat-button.component'),
    mapper: removeArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: MatField.PopArrayItem,
    loadComponent: () => import('../fields/button/mat-button.component'),
    mapper: popArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: MatField.ShiftArrayItem,
    loadComponent: () => import('../fields/button/mat-button.component'),
    mapper: shiftArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: MatField.Textarea,
    loadComponent: () => import('../fields/textarea/mat-textarea.component'),
    mapper: valueFieldMapper,
    propsToMeta: ['rows', 'cols'],
    scope: 'text-input',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: MatField.Radio,
    loadComponent: () => import('../fields/radio/mat-radio.component'),
    mapper: optionsFieldMapper,
    scope: 'single-select',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: MatField.MultiCheckbox,
    loadComponent: () => import('../fields/multi-checkbox/mat-multi-checkbox.component'),
    mapper: optionsFieldMapper,
    scope: 'multi-select',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: MatField.Datepicker,
    loadComponent: () => import('../fields/datepicker/mat-datepicker.component'),
    mapper: datepickerFieldMapper,
    scope: 'date',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: MatField.Slider,
    loadComponent: () => import('../fields/slider/mat-slider.component'),
    mapper: valueFieldMapper,
    scope: 'numeric',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: MatField.Toggle,
    loadComponent: () => import('../fields/toggle/mat-toggle.component'),
    mapper: checkboxFieldMapper,
    scope: 'boolean',
    ...VALUE_FIELD_TYPES_BASE,
  },
];
