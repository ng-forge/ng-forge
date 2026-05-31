import { FieldTypeDefinition } from '@ng-forge/dynamic-forms/integration';
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
import { IonicField } from '../types/types';
import { buttonFieldMapper } from '../fields/button/ionic-button.mapper';
import { nextButtonFieldMapper, previousButtonFieldMapper, submitButtonFieldMapper } from '../fields/button/ionic-specific-button.mapper';

const VALUE_FIELD_TYPES_BASE = {
  renderReadyWhen: ['field'],
} as const;

const BUTTON_FIELD_TYPES_BASE = {
  renderReadyWhen: [],
  valueHandling: 'exclude',
} as const;

/**
 * Ionic field type definitions
 * Follows the FieldTypeDefinition interface for proper registry integration
 */
export const IONIC_FIELD_TYPES: FieldTypeDefinition[] = [
  {
    name: IonicField.Input,
    loadComponent: () => import('../fields/input/ionic-input.component'),
    mapper: valueFieldMapper,
    propsToMeta: ['type'],
    scope: ['text-input', 'numeric'],
    addons: {
      slots: ['prefix', 'suffix'],
    },
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: IonicField.Select,
    loadComponent: () => import('../fields/select/ionic-select.component'),
    mapper: optionsFieldMapper,
    scope: 'single-select',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: IonicField.Checkbox,
    loadComponent: () => import('../fields/checkbox/ionic-checkbox.component'),
    mapper: checkboxFieldMapper,
    scope: 'boolean',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: IonicField.Button,
    loadComponent: () => import('../fields/button/ionic-button.component'),
    mapper: buttonFieldMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: IonicField.Submit,
    loadComponent: () => import('../fields/button/ionic-button.component'),
    mapper: submitButtonFieldMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: IonicField.Next,
    loadComponent: () => import('../fields/button/ionic-button.component'),
    mapper: nextButtonFieldMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: IonicField.Previous,
    loadComponent: () => import('../fields/button/ionic-button.component'),
    mapper: previousButtonFieldMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: IonicField.AddArrayItem,
    loadComponent: () => import('../fields/button/ionic-button.component'),
    mapper: addArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: IonicField.PrependArrayItem,
    loadComponent: () => import('../fields/button/ionic-button.component'),
    mapper: prependArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: IonicField.InsertArrayItem,
    loadComponent: () => import('../fields/button/ionic-button.component'),
    mapper: insertArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: IonicField.RemoveArrayItem,
    loadComponent: () => import('../fields/button/ionic-button.component'),
    mapper: removeArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: IonicField.PopArrayItem,
    loadComponent: () => import('../fields/button/ionic-button.component'),
    mapper: popArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: IonicField.ShiftArrayItem,
    loadComponent: () => import('../fields/button/ionic-button.component'),
    mapper: shiftArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: IonicField.Textarea,
    loadComponent: () => import('../fields/textarea/ionic-textarea.component'),
    mapper: valueFieldMapper,
    propsToMeta: ['rows'],
    scope: 'text-input',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: IonicField.Radio,
    loadComponent: () => import('../fields/radio/ionic-radio.component'),
    mapper: optionsFieldMapper,
    scope: 'single-select',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: IonicField.MultiCheckbox,
    loadComponent: () => import('../fields/multi-checkbox/ionic-multi-checkbox.component'),
    mapper: optionsFieldMapper,
    scope: 'multi-select',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: IonicField.Datepicker,
    loadComponent: () => import('../fields/datepicker/ionic-datepicker.component'),
    mapper: datepickerFieldMapper,
    scope: 'date',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: IonicField.Slider,
    loadComponent: () => import('../fields/slider/ionic-slider.component'),
    mapper: valueFieldMapper,
    scope: 'numeric',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: IonicField.Toggle,
    loadComponent: () => import('../fields/toggle/ionic-toggle.component'),
    mapper: checkboxFieldMapper,
    scope: 'boolean',
    ...VALUE_FIELD_TYPES_BASE,
  },
];
