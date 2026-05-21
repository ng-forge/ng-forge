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
import { BsField } from '../types/types';
import { buttonFieldMapper } from '../fields/button/bs-button.mapper';
import { nextButtonFieldMapper, previousButtonFieldMapper, submitButtonFieldMapper } from '../fields/button/bs-specific-button.mapper';

const VALUE_FIELD_TYPES_BASE = {
  renderReadyWhen: ['field'],
} as const;

const BUTTON_FIELD_TYPES_BASE = {
  renderReadyWhen: [],
  valueHandling: 'exclude',
} as const;

export const BOOTSTRAP_FIELD_TYPES: FieldTypeDefinition[] = [
  {
    name: BsField.Input,
    loadComponent: () => import('../fields/input/bs-input.component'),
    mapper: valueFieldMapper,
    propsToMeta: ['type'],
    scope: ['text-input', 'numeric'],
    addons: {
      slots: ['prefix', 'suffix'],
    },
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: BsField.Select,
    loadComponent: () => import('../fields/select/bs-select.component'),
    mapper: optionsFieldMapper,
    scope: 'single-select',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: BsField.Checkbox,
    loadComponent: () => import('../fields/checkbox/bs-checkbox.component'),
    mapper: checkboxFieldMapper,
    scope: 'boolean',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: BsField.Button,
    loadComponent: () => import('../fields/button/bs-button.component'),
    mapper: buttonFieldMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: BsField.Submit,
    loadComponent: () => import('../fields/button/bs-button.component'),
    mapper: submitButtonFieldMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: BsField.Next,
    loadComponent: () => import('../fields/button/bs-button.component'),
    mapper: nextButtonFieldMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: BsField.Previous,
    loadComponent: () => import('../fields/button/bs-button.component'),
    mapper: previousButtonFieldMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: BsField.AddArrayItem,
    loadComponent: () => import('../fields/button/bs-button.component'),
    mapper: addArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: BsField.PrependArrayItem,
    loadComponent: () => import('../fields/button/bs-button.component'),
    mapper: prependArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: BsField.InsertArrayItem,
    loadComponent: () => import('../fields/button/bs-button.component'),
    mapper: insertArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: BsField.RemoveArrayItem,
    loadComponent: () => import('../fields/button/bs-button.component'),
    mapper: removeArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: BsField.PopArrayItem,
    loadComponent: () => import('../fields/button/bs-button.component'),
    mapper: popArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: BsField.ShiftArrayItem,
    loadComponent: () => import('../fields/button/bs-button.component'),
    mapper: shiftArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: BsField.Textarea,
    loadComponent: () => import('../fields/textarea/bs-textarea.component'),
    mapper: valueFieldMapper,
    propsToMeta: ['rows'],
    scope: 'text-input',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: BsField.Radio,
    loadComponent: () => import('../fields/radio/bs-radio.component'),
    mapper: optionsFieldMapper,
    scope: 'single-select',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: BsField.MultiCheckbox,
    loadComponent: () => import('../fields/multi-checkbox/bs-multi-checkbox.component'),
    mapper: optionsFieldMapper,
    scope: 'multi-select',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: BsField.Datepicker,
    loadComponent: () => import('../fields/datepicker/bs-datepicker.component'),
    mapper: datepickerFieldMapper,
    scope: 'date',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: BsField.Slider,
    loadComponent: () => import('../fields/slider/bs-slider.component'),
    mapper: valueFieldMapper,
    scope: 'numeric',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: BsField.Toggle,
    loadComponent: () => import('../fields/toggle/bs-toggle.component'),
    mapper: checkboxFieldMapper,
    scope: 'boolean',
    ...VALUE_FIELD_TYPES_BASE,
  },
];
