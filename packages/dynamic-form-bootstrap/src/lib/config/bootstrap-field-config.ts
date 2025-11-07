import { FieldTypeDefinition, valueFieldMapper, checkboxFieldMapper } from '@ng-forge/dynamic-form';
import { BsField } from '../types/types';
import { buttonFieldMapper } from '../fields/button/bs-button.mapper';
import {
  submitButtonFieldMapper,
  nextButtonFieldMapper,
  previousButtonFieldMapper,
} from '../fields/button/bs-specific-button.mapper';

export const BOOTSTRAP_FIELD_TYPES: FieldTypeDefinition[] = [
  {
    name: BsField.Input,
    loadComponent: () => import('../fields/input/bs-input.component'),
    mapper: valueFieldMapper,
  },
  {
    name: BsField.Select,
    loadComponent: () => import('../fields/select/bs-select.component'),
    mapper: valueFieldMapper,
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
    name: BsField.Textarea,
    loadComponent: () => import('../fields/textarea/bs-textarea.component'),
    mapper: valueFieldMapper,
  },
  {
    name: BsField.Radio,
    loadComponent: () => import('../fields/radio/bs-radio.component'),
    mapper: valueFieldMapper,
  },
  {
    name: BsField.MultiCheckbox,
    loadComponent: () => import('../fields/multi-checkbox/bs-multi-checkbox.component'),
    mapper: valueFieldMapper,
  },
  {
    name: BsField.Datepicker,
    loadComponent: () => import('../fields/datepicker/bs-datepicker.component'),
    mapper: valueFieldMapper,
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
