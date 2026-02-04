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
  },
  {
    name: PrimeField.Select,
    loadComponent: () => import('../fields/select/prime-select.component'),
    mapper: optionsFieldMapper,
  },
  {
    name: PrimeField.Checkbox,
    loadComponent: () => import('../fields/checkbox/prime-checkbox.component'),
    mapper: checkboxFieldMapper,
  },
  {
    name: PrimeField.Button,
    loadComponent: () => import('../fields/button/prime-button.component'),
    mapper: buttonFieldMapper,
    valueHandling: 'exclude',
  },
  {
    name: PrimeField.Submit,
    loadComponent: () => import('../fields/button/prime-button.component'),
    mapper: submitButtonFieldMapper,
    valueHandling: 'exclude',
  },
  {
    name: PrimeField.Next,
    loadComponent: () => import('../fields/button/prime-button.component'),
    mapper: nextButtonFieldMapper,
    valueHandling: 'exclude',
  },
  {
    name: PrimeField.Previous,
    loadComponent: () => import('../fields/button/prime-button.component'),
    mapper: previousButtonFieldMapper,
    valueHandling: 'exclude',
  },
  {
    name: PrimeField.AddArrayItem,
    loadComponent: () => import('../fields/button/prime-button.component'),
    mapper: addArrayItemButtonMapper,
    valueHandling: 'exclude',
  },
  {
    name: PrimeField.PrependArrayItem,
    loadComponent: () => import('../fields/button/prime-button.component'),
    mapper: prependArrayItemButtonMapper,
    valueHandling: 'exclude',
  },
  {
    name: PrimeField.InsertArrayItem,
    loadComponent: () => import('../fields/button/prime-button.component'),
    mapper: insertArrayItemButtonMapper,
    valueHandling: 'exclude',
  },
  {
    name: PrimeField.RemoveArrayItem,
    loadComponent: () => import('../fields/button/prime-button.component'),
    mapper: removeArrayItemButtonMapper,
    valueHandling: 'exclude',
  },
  {
    name: PrimeField.PopArrayItem,
    loadComponent: () => import('../fields/button/prime-button.component'),
    mapper: popArrayItemButtonMapper,
    valueHandling: 'exclude',
  },
  {
    name: PrimeField.ShiftArrayItem,
    loadComponent: () => import('../fields/button/prime-button.component'),
    mapper: shiftArrayItemButtonMapper,
    valueHandling: 'exclude',
  },
  {
    name: PrimeField.Textarea,
    loadComponent: () => import('../fields/textarea/prime-textarea.component'),
    mapper: valueFieldMapper,
    propsToMeta: ['rows', 'cols'],
  },
  {
    name: PrimeField.Radio,
    loadComponent: () => import('../fields/radio/prime-radio.component'),
    mapper: optionsFieldMapper,
  },
  {
    name: PrimeField.MultiCheckbox,
    loadComponent: () => import('../fields/multi-checkbox/prime-multi-checkbox.component'),
    mapper: optionsFieldMapper,
  },
  {
    name: PrimeField.Datepicker,
    loadComponent: () => import('../fields/datepicker/prime-datepicker.component'),
    mapper: datepickerFieldMapper,
  },
  {
    name: PrimeField.Slider,
    loadComponent: () => import('../fields/slider/prime-slider.component'),
    mapper: valueFieldMapper,
  },
  {
    name: PrimeField.Toggle,
    loadComponent: () => import('../fields/toggle/prime-toggle.component'),
    mapper: checkboxFieldMapper,
  },
];
