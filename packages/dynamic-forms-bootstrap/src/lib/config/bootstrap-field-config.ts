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

export const BOOTSTRAP_FIELD_TYPES: FieldTypeDefinition[] = [
  {
    name: BsField.Input,
    loadComponent: () => import('../fields/input/bs-input.component'),
    mapper: valueFieldMapper,
    propsToMeta: ['type'],
  },
  {
    name: BsField.Select,
    loadComponent: () => import('../fields/select/bs-select.component'),
    mapper: optionsFieldMapper,
  },
  {
    name: BsField.Checkbox,
    loadComponent: () => import('../fields/checkbox/bs-checkbox.component'),
    mapper: checkboxFieldMapper,
  },
  {
    name: BsField.Button,
    loadComponent: () => import('../fields/button/bs-button.component'),
    mapper: buttonFieldMapper,
    valueHandling: 'exclude',
  },
  {
    name: BsField.Submit,
    loadComponent: () => import('../fields/button/bs-button.component'),
    mapper: submitButtonFieldMapper,
    valueHandling: 'exclude',
  },
  {
    name: BsField.Next,
    loadComponent: () => import('../fields/button/bs-button.component'),
    mapper: nextButtonFieldMapper,
    valueHandling: 'exclude',
  },
  {
    name: BsField.Previous,
    loadComponent: () => import('../fields/button/bs-button.component'),
    mapper: previousButtonFieldMapper,
    valueHandling: 'exclude',
  },
  {
    name: BsField.AddArrayItem,
    loadComponent: () => import('../fields/button/bs-button.component'),
    mapper: addArrayItemButtonMapper,
    valueHandling: 'exclude',
  },
  {
    name: BsField.PrependArrayItem,
    loadComponent: () => import('../fields/button/bs-button.component'),
    mapper: prependArrayItemButtonMapper,
    valueHandling: 'exclude',
  },
  {
    name: BsField.InsertArrayItem,
    loadComponent: () => import('../fields/button/bs-button.component'),
    mapper: insertArrayItemButtonMapper,
    valueHandling: 'exclude',
  },
  {
    name: BsField.RemoveArrayItem,
    loadComponent: () => import('../fields/button/bs-button.component'),
    mapper: removeArrayItemButtonMapper,
    valueHandling: 'exclude',
  },
  {
    name: BsField.PopArrayItem,
    loadComponent: () => import('../fields/button/bs-button.component'),
    mapper: popArrayItemButtonMapper,
    valueHandling: 'exclude',
  },
  {
    name: BsField.ShiftArrayItem,
    loadComponent: () => import('../fields/button/bs-button.component'),
    mapper: shiftArrayItemButtonMapper,
    valueHandling: 'exclude',
  },
  {
    name: BsField.Textarea,
    loadComponent: () => import('../fields/textarea/bs-textarea.component'),
    mapper: valueFieldMapper,
    propsToMeta: ['rows'],
  },
  {
    name: BsField.Radio,
    loadComponent: () => import('../fields/radio/bs-radio.component'),
    mapper: optionsFieldMapper,
  },
  {
    name: BsField.MultiCheckbox,
    loadComponent: () => import('../fields/multi-checkbox/bs-multi-checkbox.component'),
    mapper: optionsFieldMapper,
  },
  {
    name: BsField.Datepicker,
    loadComponent: () => import('../fields/datepicker/bs-datepicker.component'),
    mapper: datepickerFieldMapper,
  },
  {
    name: BsField.Slider,
    loadComponent: () => import('../fields/slider/bs-slider.component'),
    mapper: valueFieldMapper,
  },
  {
    name: BsField.Toggle,
    loadComponent: () => import('../fields/toggle/bs-toggle.component'),
    mapper: checkboxFieldMapper,
  },
];
