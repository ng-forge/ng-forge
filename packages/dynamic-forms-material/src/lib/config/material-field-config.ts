/* eslint-disable @nx/enforce-module-boundaries -- Package self-imports preserve ng-packagr secondary entry points. */
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
import { MatField } from '../types/types';
import { buttonFieldMapper } from '../fields/button/mat-button.mapper';
import { nextButtonFieldMapper, previousButtonFieldMapper, submitButtonFieldMapper } from '../fields/button/mat-specific-button.mapper';

/**
 * Base for value-bearing field types — waits for the mapper to emit the `field`
 * input before instantiating the component (matches NgForgeField's
 * `input.required<FieldTree<T>>()` contract).
 */
const VALUE_FIELD_TYPES_BASE = {
  renderReadyWhen: ['field'],
} as const;

/**
 * Base for action/button field types that don't bind to a form value.
 * Renders immediately, opted out of form-value collection.
 */
const BUTTON_FIELD_TYPES_BASE = {
  renderReadyWhen: [],
  valueHandling: 'exclude',
} as const;

const loadInputComponent = () =>
  import('@ng-forge/dynamic-forms-material/lazy/input').then(({ MatInputFieldComponent }) => MatInputFieldComponent);
const loadSelectComponent = () =>
  import('@ng-forge/dynamic-forms-material/lazy/select').then(({ MatSelectFieldComponent }) => MatSelectFieldComponent);
const loadCheckboxComponent = () =>
  import('@ng-forge/dynamic-forms-material/lazy/checkbox').then(({ MatCheckboxFieldComponent }) => MatCheckboxFieldComponent);
const loadButtonComponent = () =>
  import('@ng-forge/dynamic-forms-material/lazy/button').then(({ MatButtonFieldComponent }) => MatButtonFieldComponent);
const loadTextareaComponent = () =>
  import('@ng-forge/dynamic-forms-material/lazy/textarea').then(({ MatTextareaFieldComponent }) => MatTextareaFieldComponent);
const loadRadioComponent = () =>
  import('@ng-forge/dynamic-forms-material/lazy/radio').then(({ MatRadioFieldComponent }) => MatRadioFieldComponent);
const loadMultiCheckboxComponent = () =>
  import('@ng-forge/dynamic-forms-material/lazy/multi-checkbox').then(
    ({ MatMultiCheckboxFieldComponent }) => MatMultiCheckboxFieldComponent,
  );
const loadDatepickerComponent = () =>
  import('@ng-forge/dynamic-forms-material/lazy/datepicker').then(({ MatDatepickerFieldComponent }) => MatDatepickerFieldComponent);
const loadSliderComponent = () =>
  import('@ng-forge/dynamic-forms-material/lazy/slider').then(({ MatSliderFieldComponent }) => MatSliderFieldComponent);
const loadToggleComponent = () =>
  import('@ng-forge/dynamic-forms-material/lazy/toggle').then(({ MatToggleFieldComponent }) => MatToggleFieldComponent);

/**
 * Material Design field type definitions
 * Follows the FieldTypeDefinition interface for proper registry integration
 */
export const MATERIAL_FIELD_TYPES: FieldTypeDefinition[] = [
  {
    name: MatField.Input,
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
    name: MatField.Select,
    loadComponent: loadSelectComponent,
    mapper: optionsFieldMapper,
    scope: 'single-select',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: MatField.Checkbox,
    loadComponent: loadCheckboxComponent,
    mapper: checkboxFieldMapper,
    scope: 'boolean',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: MatField.Button,
    loadComponent: loadButtonComponent,
    mapper: buttonFieldMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: MatField.Submit,
    loadComponent: loadButtonComponent,
    mapper: submitButtonFieldMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: MatField.Next,
    loadComponent: loadButtonComponent,
    mapper: nextButtonFieldMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: MatField.Previous,
    loadComponent: loadButtonComponent,
    mapper: previousButtonFieldMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: MatField.AddArrayItem,
    loadComponent: loadButtonComponent,
    mapper: addArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: MatField.PrependArrayItem,
    loadComponent: loadButtonComponent,
    mapper: prependArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: MatField.InsertArrayItem,
    loadComponent: loadButtonComponent,
    mapper: insertArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: MatField.RemoveArrayItem,
    loadComponent: loadButtonComponent,
    mapper: removeArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: MatField.PopArrayItem,
    loadComponent: loadButtonComponent,
    mapper: popArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: MatField.ShiftArrayItem,
    loadComponent: loadButtonComponent,
    mapper: shiftArrayItemButtonMapper,
    ...BUTTON_FIELD_TYPES_BASE,
  },
  {
    name: MatField.Textarea,
    loadComponent: loadTextareaComponent,
    mapper: valueFieldMapper,
    propsToMeta: ['rows', 'cols'],
    scope: 'text-input',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: MatField.Radio,
    loadComponent: loadRadioComponent,
    mapper: optionsFieldMapper,
    scope: 'single-select',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: MatField.MultiCheckbox,
    loadComponent: loadMultiCheckboxComponent,
    mapper: optionsFieldMapper,
    scope: 'multi-select',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: MatField.Datepicker,
    loadComponent: loadDatepickerComponent,
    mapper: datepickerFieldMapper,
    scope: 'date',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: MatField.Slider,
    loadComponent: loadSliderComponent,
    mapper: valueFieldMapper,
    scope: 'numeric',
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: MatField.Toggle,
    loadComponent: loadToggleComponent,
    mapper: checkboxFieldMapper,
    scope: 'boolean',
    ...VALUE_FIELD_TYPES_BASE,
  },
];
