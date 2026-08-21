/* eslint-disable @nx/enforce-module-boundaries -- Published secondary-entry imports must remain package specifiers for real lazy chunks. */
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

const loadInputComponent = () =>
  import('@ng-forge/dynamic-forms-ionic/lazy/input').then(({ IonicInputFieldComponent }) => IonicInputFieldComponent);
const loadSelectComponent = () =>
  import('@ng-forge/dynamic-forms-ionic/lazy/select').then(({ IonicSelectFieldComponent }) => IonicSelectFieldComponent);
const loadCheckboxComponent = () =>
  import('@ng-forge/dynamic-forms-ionic/lazy/checkbox').then(({ IonicCheckboxFieldComponent }) => IonicCheckboxFieldComponent);
const loadButtonComponent = () =>
  import('@ng-forge/dynamic-forms-ionic/lazy/button').then(({ IonicButtonFieldComponent }) => IonicButtonFieldComponent);
const loadTextareaComponent = () =>
  import('@ng-forge/dynamic-forms-ionic/lazy/textarea').then(({ IonicTextareaFieldComponent }) => IonicTextareaFieldComponent);
const loadRadioComponent = () =>
  import('@ng-forge/dynamic-forms-ionic/lazy/radio').then(({ IonicRadioFieldComponent }) => IonicRadioFieldComponent);
const loadMultiCheckboxComponent = () =>
  import('@ng-forge/dynamic-forms-ionic/lazy/multi-checkbox').then(
    ({ IonicMultiCheckboxFieldComponent }) => IonicMultiCheckboxFieldComponent,
  );
const loadDatepickerComponent = () =>
  import('@ng-forge/dynamic-forms-ionic/lazy/datepicker').then(({ IonicDatepickerFieldComponent }) => IonicDatepickerFieldComponent);
const loadSliderComponent = () =>
  import('@ng-forge/dynamic-forms-ionic/lazy/slider').then(({ IonicSliderFieldComponent }) => IonicSliderFieldComponent);
const loadToggleComponent = () =>
  import('@ng-forge/dynamic-forms-ionic/lazy/toggle').then(({ IonicToggleFieldComponent }) => IonicToggleFieldComponent);

/**
 * Ionic field type definitions
 * Follows the FieldTypeDefinition interface for proper registry integration
 */
export const IONIC_FIELD_TYPES: FieldTypeDefinition[] = [
  {
    name: IonicField.Input,
    loadComponent: loadInputComponent,
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
    loadComponent: loadSelectComponent,
    mapper: optionsFieldMapper,
    scope: 'single-select',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: IonicField.Checkbox,
    loadComponent: loadCheckboxComponent,
    mapper: checkboxFieldMapper,
    scope: 'boolean',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: IonicField.Button,
    loadComponent: loadButtonComponent,
    mapper: buttonFieldMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: IonicField.Submit,
    loadComponent: loadButtonComponent,
    mapper: submitButtonFieldMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: IonicField.Next,
    loadComponent: loadButtonComponent,
    mapper: nextButtonFieldMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: IonicField.Previous,
    loadComponent: loadButtonComponent,
    mapper: previousButtonFieldMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: IonicField.AddArrayItem,
    loadComponent: loadButtonComponent,
    mapper: addArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: IonicField.PrependArrayItem,
    loadComponent: loadButtonComponent,
    mapper: prependArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: IonicField.InsertArrayItem,
    loadComponent: loadButtonComponent,
    mapper: insertArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: IonicField.RemoveArrayItem,
    loadComponent: loadButtonComponent,
    mapper: removeArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: IonicField.PopArrayItem,
    loadComponent: loadButtonComponent,
    mapper: popArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: IonicField.ShiftArrayItem,
    loadComponent: loadButtonComponent,
    mapper: shiftArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: IonicField.Textarea,
    loadComponent: loadTextareaComponent,
    mapper: valueFieldMapper,
    propsToMeta: ['rows'],
    scope: 'text-input',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: IonicField.Radio,
    loadComponent: loadRadioComponent,
    mapper: optionsFieldMapper,
    scope: 'single-select',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: IonicField.MultiCheckbox,
    loadComponent: loadMultiCheckboxComponent,
    mapper: optionsFieldMapper,
    scope: 'multi-select',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: IonicField.Datepicker,
    loadComponent: loadDatepickerComponent,
    mapper: datepickerFieldMapper,
    scope: 'date',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: IonicField.Slider,
    loadComponent: loadSliderComponent,
    mapper: valueFieldMapper,
    scope: 'numeric',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: IonicField.Toggle,
    loadComponent: loadToggleComponent,
    mapper: checkboxFieldMapper,
    scope: 'boolean',
    ...VALUE_FIELD_TYPES_BASE,
  },
];
