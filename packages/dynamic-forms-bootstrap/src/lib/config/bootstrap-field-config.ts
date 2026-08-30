/* eslint-disable @nx/enforce-module-boundaries -- package self-imports preserve real lazy secondary entrypoints. */
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

const loadInputComponent = () =>
  import('@ng-forge/dynamic-forms-bootstrap/lazy/input').then(({ BsInputFieldComponent }) => BsInputFieldComponent);
const loadSelectComponent = () =>
  import('@ng-forge/dynamic-forms-bootstrap/lazy/select').then(({ BsSelectFieldComponent }) => BsSelectFieldComponent);
const loadCheckboxComponent = () =>
  import('@ng-forge/dynamic-forms-bootstrap/lazy/checkbox').then(({ BsCheckboxFieldComponent }) => BsCheckboxFieldComponent);
const loadButtonComponent = () =>
  import('@ng-forge/dynamic-forms-bootstrap/lazy/button').then(({ BsButtonFieldComponent }) => BsButtonFieldComponent);
const loadTextareaComponent = () =>
  import('@ng-forge/dynamic-forms-bootstrap/lazy/textarea').then(({ BsTextareaFieldComponent }) => BsTextareaFieldComponent);
const loadRadioComponent = () =>
  import('@ng-forge/dynamic-forms-bootstrap/lazy/radio').then(({ BsRadioFieldComponent }) => BsRadioFieldComponent);
const loadMultiCheckboxComponent = () =>
  import('@ng-forge/dynamic-forms-bootstrap/lazy/multi-checkbox').then(
    ({ BsMultiCheckboxFieldComponent }) => BsMultiCheckboxFieldComponent,
  );
const loadDatepickerComponent = () =>
  import('@ng-forge/dynamic-forms-bootstrap/lazy/datepicker').then(({ BsDatepickerFieldComponent }) => BsDatepickerFieldComponent);
const loadSliderComponent = () =>
  import('@ng-forge/dynamic-forms-bootstrap/lazy/slider').then(({ BsSliderFieldComponent }) => BsSliderFieldComponent);
const loadToggleComponent = () =>
  import('@ng-forge/dynamic-forms-bootstrap/lazy/toggle').then(({ BsToggleFieldComponent }) => BsToggleFieldComponent);

export const BOOTSTRAP_FIELD_TYPES: FieldTypeDefinition[] = [
  {
    name: BsField.Input,
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
    name: BsField.Select,
    loadComponent: loadSelectComponent,
    mapper: optionsFieldMapper,
    scope: 'single-select',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: BsField.Checkbox,
    loadComponent: loadCheckboxComponent,
    mapper: checkboxFieldMapper,
    scope: 'boolean',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: BsField.Button,
    loadComponent: loadButtonComponent,
    mapper: buttonFieldMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: BsField.Submit,
    loadComponent: loadButtonComponent,
    mapper: submitButtonFieldMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: BsField.Next,
    loadComponent: loadButtonComponent,
    mapper: nextButtonFieldMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: BsField.Previous,
    loadComponent: loadButtonComponent,
    mapper: previousButtonFieldMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: BsField.AddArrayItem,
    loadComponent: loadButtonComponent,
    mapper: addArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: BsField.PrependArrayItem,
    loadComponent: loadButtonComponent,
    mapper: prependArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: BsField.InsertArrayItem,
    loadComponent: loadButtonComponent,
    mapper: insertArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: BsField.RemoveArrayItem,
    loadComponent: loadButtonComponent,
    mapper: removeArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: BsField.PopArrayItem,
    loadComponent: loadButtonComponent,
    mapper: popArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: BsField.ShiftArrayItem,
    loadComponent: loadButtonComponent,
    mapper: shiftArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: BsField.Textarea,
    loadComponent: loadTextareaComponent,
    mapper: valueFieldMapper,
    propsToMeta: ['rows'],
    scope: 'text-input',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: BsField.Radio,
    loadComponent: loadRadioComponent,
    mapper: optionsFieldMapper,
    scope: 'single-select',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: BsField.MultiCheckbox,
    loadComponent: loadMultiCheckboxComponent,
    mapper: optionsFieldMapper,
    scope: 'multi-select',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: BsField.Datepicker,
    loadComponent: loadDatepickerComponent,
    mapper: datepickerFieldMapper,
    scope: 'date',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: BsField.Slider,
    loadComponent: loadSliderComponent,
    mapper: valueFieldMapper,
    scope: 'numeric',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: BsField.Toggle,
    loadComponent: loadToggleComponent,
    mapper: checkboxFieldMapper,
    scope: 'boolean',
    ...VALUE_FIELD_TYPES_BASE,
  },
];
