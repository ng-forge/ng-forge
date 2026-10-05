import {
  addArrayItemButtonMapper,
  buttonFieldMapper,
  checkboxFieldMapper,
  FieldTypeDefinition,
  insertArrayItemButtonMapper,
  nextButtonFieldMapper,
  optionsFieldMapper,
  popArrayItemButtonMapper,
  prependArrayItemButtonMapper,
  previousButtonFieldMapper,
  removeArrayItemButtonMapper,
  shiftArrayItemButtonMapper,
  textFieldMapper,
  valueFieldMapper,
} from '@ng-forge/dynamic-forms/integration';
import { nativeSubmitButtonFieldMapper } from '../fields/button/native-submit-button.mapper';

const VALUE_FIELD_TYPES_BASE = { renderReadyWhen: ['field'] } as const;
const BUTTON_FIELD_TYPES_BASE = { renderReadyWhen: [], valueHandling: 'exclude' } as const;

const loadButton = () => import('../fields/button/native-button.component');

export const NATIVE_FIELD_TYPES: FieldTypeDefinition[] = [
  {
    name: 'input',
    loadComponent: () => import('../fields/input/native-input.component'),
    mapper: valueFieldMapper,
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: 'textarea',
    loadComponent: () => import('../fields/textarea/native-textarea.component'),
    mapper: valueFieldMapper,
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: 'toggle',
    loadComponent: () => import('../fields/toggle/native-toggle.component'),
    mapper: checkboxFieldMapper,
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: 'checkbox',
    loadComponent: () => import('../fields/checkbox/native-checkbox.component'),
    mapper: checkboxFieldMapper,
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: 'radio',
    loadComponent: () => import('../fields/radio/native-radio.component'),
    mapper: optionsFieldMapper,
    ...VALUE_FIELD_TYPES_BASE,
  },
  {
    name: 'multi-checkbox',
    loadComponent: () => import('../fields/multi-checkbox/native-multi-checkbox.component'),
    mapper: optionsFieldMapper,
    ...VALUE_FIELD_TYPES_BASE,
  },
  { name: 'button', loadComponent: loadButton, mapper: buttonFieldMapper, ...BUTTON_FIELD_TYPES_BASE },
  { name: 'submit', loadComponent: loadButton, mapper: nativeSubmitButtonFieldMapper, ...BUTTON_FIELD_TYPES_BASE },
  { name: 'next', loadComponent: loadButton, mapper: nextButtonFieldMapper, ...BUTTON_FIELD_TYPES_BASE },
  { name: 'previous', loadComponent: loadButton, mapper: previousButtonFieldMapper, ...BUTTON_FIELD_TYPES_BASE },
  { name: 'add-array-item', loadComponent: loadButton, mapper: addArrayItemButtonMapper, ...BUTTON_FIELD_TYPES_BASE },
  { name: 'prepend-array-item', loadComponent: loadButton, mapper: prependArrayItemButtonMapper, ...BUTTON_FIELD_TYPES_BASE },
  { name: 'insert-array-item', loadComponent: loadButton, mapper: insertArrayItemButtonMapper, ...BUTTON_FIELD_TYPES_BASE },
  { name: 'remove-array-item', loadComponent: loadButton, mapper: removeArrayItemButtonMapper, ...BUTTON_FIELD_TYPES_BASE },
  { name: 'pop-array-item', loadComponent: loadButton, mapper: popArrayItemButtonMapper, ...BUTTON_FIELD_TYPES_BASE },
  { name: 'shift-array-item', loadComponent: loadButton, mapper: shiftArrayItemButtonMapper, ...BUTTON_FIELD_TYPES_BASE },
  // Overrides core's `text`, whose <p>/<h1>-<h6>/<span> have no native counterpart.
  {
    name: 'text',
    loadComponent: () => import('../fields/text/native-text.component'),
    mapper: textFieldMapper,
    valueHandling: 'exclude',
    renderReadyWhen: [],
  },
];
