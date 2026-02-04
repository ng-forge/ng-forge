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
import { IonicField } from '../types/types';
import { buttonFieldMapper } from '../fields/button/ionic-button.mapper';
import { nextButtonFieldMapper, previousButtonFieldMapper, submitButtonFieldMapper } from '../fields/button/ionic-specific-button.mapper';

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
  },
  {
    name: IonicField.Select,
    loadComponent: () => import('../fields/select/ionic-select.component'),
    mapper: optionsFieldMapper,
  },
  {
    name: IonicField.Checkbox,
    loadComponent: () => import('../fields/checkbox/ionic-checkbox.component'),
    mapper: checkboxFieldMapper,
  },
  {
    name: IonicField.Button,
    loadComponent: () => import('../fields/button/ionic-button.component'),
    mapper: buttonFieldMapper,
    valueHandling: 'exclude',
  },
  {
    name: IonicField.Submit,
    loadComponent: () => import('../fields/button/ionic-button.component'),
    mapper: submitButtonFieldMapper,
    valueHandling: 'exclude',
  },
  {
    name: IonicField.Next,
    loadComponent: () => import('../fields/button/ionic-button.component'),
    mapper: nextButtonFieldMapper,
    valueHandling: 'exclude',
  },
  {
    name: IonicField.Previous,
    loadComponent: () => import('../fields/button/ionic-button.component'),
    mapper: previousButtonFieldMapper,
    valueHandling: 'exclude',
  },
  {
    name: IonicField.AddArrayItem,
    loadComponent: () => import('../fields/button/ionic-button.component'),
    mapper: addArrayItemButtonMapper,
    valueHandling: 'exclude',
  },
  {
    name: IonicField.PrependArrayItem,
    loadComponent: () => import('../fields/button/ionic-button.component'),
    mapper: prependArrayItemButtonMapper,
    valueHandling: 'exclude',
  },
  {
    name: IonicField.InsertArrayItem,
    loadComponent: () => import('../fields/button/ionic-button.component'),
    mapper: insertArrayItemButtonMapper,
    valueHandling: 'exclude',
  },
  {
    name: IonicField.RemoveArrayItem,
    loadComponent: () => import('../fields/button/ionic-button.component'),
    mapper: removeArrayItemButtonMapper,
    valueHandling: 'exclude',
  },
  {
    name: IonicField.PopArrayItem,
    loadComponent: () => import('../fields/button/ionic-button.component'),
    mapper: popArrayItemButtonMapper,
    valueHandling: 'exclude',
  },
  {
    name: IonicField.ShiftArrayItem,
    loadComponent: () => import('../fields/button/ionic-button.component'),
    mapper: shiftArrayItemButtonMapper,
    valueHandling: 'exclude',
  },
  {
    name: IonicField.Textarea,
    loadComponent: () => import('../fields/textarea/ionic-textarea.component'),
    mapper: valueFieldMapper,
    propsToMeta: ['rows'],
  },
  {
    name: IonicField.Radio,
    loadComponent: () => import('../fields/radio/ionic-radio.component'),
    mapper: optionsFieldMapper,
  },
  {
    name: IonicField.MultiCheckbox,
    loadComponent: () => import('../fields/multi-checkbox/ionic-multi-checkbox.component'),
    mapper: optionsFieldMapper,
  },
  {
    name: IonicField.Datepicker,
    loadComponent: () => import('../fields/datepicker/ionic-datepicker.component'),
    mapper: datepickerFieldMapper,
  },
  {
    name: IonicField.Slider,
    loadComponent: () => import('../fields/slider/ionic-slider.component'),
    mapper: valueFieldMapper,
  },
  {
    name: IonicField.Toggle,
    loadComponent: () => import('../fields/toggle/ionic-toggle.component'),
    mapper: checkboxFieldMapper,
  },
];
