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
import { PrimeField } from '../types/types';
import { buttonFieldMapper } from '../fields/button/prime-button.mapper';
import { nextButtonFieldMapper, previousButtonFieldMapper, submitButtonFieldMapper } from '../fields/button/prime-specific-button.mapper';

const VALUE_FIELD_TYPES_BASE = {
  renderReadyWhen: ['field'],
} as const;

const BUTTON_FIELD_TYPES_BASE = {
  renderReadyWhen: [],
  valueHandling: 'exclude',
} as const;

/**
 * PrimeNG field type definitions
 * Follows the FieldTypeDefinition interface for proper registry integration
 */
export const PRIMENG_FIELD_TYPES: FieldTypeDefinition[] = [
  {
    name: PrimeField.Input,
    loadComponent: () => import('../fields/input/prime-input.component'),
    mapper: valueFieldMapper,
    propsToMeta: ['type'],
    scope: ['text-input', 'numeric'],
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: PrimeField.Select,
    loadComponent: () => import('../fields/select/prime-select.component'),
    mapper: optionsFieldMapper,
    scope: 'single-select',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: PrimeField.Checkbox,
    loadComponent: () => import('../fields/checkbox/prime-checkbox.component'),
    mapper: checkboxFieldMapper,
    scope: 'boolean',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: PrimeField.Button,
    loadComponent: () => import('../fields/button/prime-button.component'),
    mapper: buttonFieldMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: PrimeField.Submit,
    loadComponent: () => import('../fields/button/prime-button.component'),
    mapper: submitButtonFieldMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: PrimeField.Next,
    loadComponent: () => import('../fields/button/prime-button.component'),
    mapper: nextButtonFieldMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: PrimeField.Previous,
    loadComponent: () => import('../fields/button/prime-button.component'),
    mapper: previousButtonFieldMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: PrimeField.AddArrayItem,
    loadComponent: () => import('../fields/button/prime-button.component'),
    mapper: addArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: PrimeField.PrependArrayItem,
    loadComponent: () => import('../fields/button/prime-button.component'),
    mapper: prependArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: PrimeField.InsertArrayItem,
    loadComponent: () => import('../fields/button/prime-button.component'),
    mapper: insertArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: PrimeField.RemoveArrayItem,
    loadComponent: () => import('../fields/button/prime-button.component'),
    mapper: removeArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: PrimeField.PopArrayItem,
    loadComponent: () => import('../fields/button/prime-button.component'),
    mapper: popArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: PrimeField.ShiftArrayItem,
    loadComponent: () => import('../fields/button/prime-button.component'),
    mapper: shiftArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: PrimeField.Textarea,
    loadComponent: () => import('../fields/textarea/prime-textarea.component'),
    mapper: valueFieldMapper,
    propsToMeta: ['rows', 'cols'],
    scope: 'text-input',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: PrimeField.Radio,
    loadComponent: () => import('../fields/radio/prime-radio.component'),
    mapper: optionsFieldMapper,
    scope: 'single-select',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: PrimeField.MultiCheckbox,
    loadComponent: () => import('../fields/multi-checkbox/prime-multi-checkbox.component'),
    mapper: optionsFieldMapper,
    scope: 'multi-select',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: PrimeField.Datepicker,
    loadComponent: () => import('../fields/datepicker/prime-datepicker.component'),
    mapper: datepickerFieldMapper,
    scope: 'date',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: PrimeField.Slider,
    loadComponent: () => import('../fields/slider/prime-slider.component'),
    mapper: valueFieldMapper,
    scope: 'numeric',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: PrimeField.Toggle,
    loadComponent: () => import('../fields/toggle/prime-toggle.component'),
    mapper: checkboxFieldMapper,
    scope: 'boolean',
    ...VALUE_FIELD_TYPES_BASE,
  },
];
