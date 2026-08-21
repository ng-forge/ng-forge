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

const loadInputComponent = () =>
  import('@ng-forge/dynamic-forms-primeng/lazy/input').then(({ PrimeInputFieldComponent }) => PrimeInputFieldComponent);
const loadSelectComponent = () =>
  import('@ng-forge/dynamic-forms-primeng/lazy/select').then(({ PrimeSelectFieldComponent }) => PrimeSelectFieldComponent);
const loadCheckboxComponent = () =>
  import('@ng-forge/dynamic-forms-primeng/lazy/checkbox').then(({ PrimeCheckboxFieldComponent }) => PrimeCheckboxFieldComponent);
const loadButtonComponent = () =>
  import('@ng-forge/dynamic-forms-primeng/lazy/button').then(({ PrimeButtonFieldComponent }) => PrimeButtonFieldComponent);
const loadTextareaComponent = () =>
  import('@ng-forge/dynamic-forms-primeng/lazy/textarea').then(({ PrimeTextareaFieldComponent }) => PrimeTextareaFieldComponent);
const loadRadioComponent = () =>
  import('@ng-forge/dynamic-forms-primeng/lazy/radio').then(({ PrimeRadioFieldComponent }) => PrimeRadioFieldComponent);
const loadMultiCheckboxComponent = () =>
  import('@ng-forge/dynamic-forms-primeng/lazy/multi-checkbox').then(
    ({ PrimeMultiCheckboxFieldComponent }) => PrimeMultiCheckboxFieldComponent,
  );
const loadDatepickerComponent = () =>
  import('@ng-forge/dynamic-forms-primeng/lazy/datepicker').then(({ PrimeDatepickerFieldComponent }) => PrimeDatepickerFieldComponent);
const loadSliderComponent = () =>
  import('@ng-forge/dynamic-forms-primeng/lazy/slider').then(({ PrimeSliderFieldComponent }) => PrimeSliderFieldComponent);
const loadToggleComponent = () =>
  import('@ng-forge/dynamic-forms-primeng/lazy/toggle').then(({ PrimeToggleFieldComponent }) => PrimeToggleFieldComponent);

/**
 * PrimeNG field type definitions
 * Follows the FieldTypeDefinition interface for proper registry integration
 */
export const PRIMENG_FIELD_TYPES: FieldTypeDefinition[] = [
  {
    name: PrimeField.Input,
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
    name: PrimeField.Select,
    loadComponent: loadSelectComponent,
    mapper: optionsFieldMapper,
    scope: 'single-select',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: PrimeField.Checkbox,
    loadComponent: loadCheckboxComponent,
    mapper: checkboxFieldMapper,
    scope: 'boolean',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: PrimeField.Button,
    loadComponent: loadButtonComponent,
    mapper: buttonFieldMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: PrimeField.Submit,
    loadComponent: loadButtonComponent,
    mapper: submitButtonFieldMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: PrimeField.Next,
    loadComponent: loadButtonComponent,
    mapper: nextButtonFieldMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: PrimeField.Previous,
    loadComponent: loadButtonComponent,
    mapper: previousButtonFieldMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: PrimeField.AddArrayItem,
    loadComponent: loadButtonComponent,
    mapper: addArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: PrimeField.PrependArrayItem,
    loadComponent: loadButtonComponent,
    mapper: prependArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: PrimeField.InsertArrayItem,
    loadComponent: loadButtonComponent,
    mapper: insertArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: PrimeField.RemoveArrayItem,
    loadComponent: loadButtonComponent,
    mapper: removeArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: PrimeField.PopArrayItem,
    loadComponent: loadButtonComponent,
    mapper: popArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: PrimeField.ShiftArrayItem,
    loadComponent: loadButtonComponent,
    mapper: shiftArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: PrimeField.Textarea,
    loadComponent: loadTextareaComponent,
    mapper: valueFieldMapper,
    propsToMeta: ['rows', 'cols'],
    scope: 'text-input',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: PrimeField.Radio,
    loadComponent: loadRadioComponent,
    mapper: optionsFieldMapper,
    scope: 'single-select',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: PrimeField.MultiCheckbox,
    loadComponent: loadMultiCheckboxComponent,
    mapper: optionsFieldMapper,
    scope: 'multi-select',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: PrimeField.Datepicker,
    loadComponent: loadDatepickerComponent,
    mapper: datepickerFieldMapper,
    scope: 'date',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: PrimeField.Slider,
    loadComponent: loadSliderComponent,
    mapper: valueFieldMapper,
    scope: 'numeric',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: PrimeField.Toggle,
    loadComponent: loadToggleComponent,
    mapper: checkboxFieldMapper,
    scope: 'boolean',
    ...VALUE_FIELD_TYPES_BASE,
  },
];
