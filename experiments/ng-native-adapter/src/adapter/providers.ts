import {
  addArrayItemButtonMapper,
  buttonFieldMapper,
  checkboxFieldMapper,
  textFieldMapper,
  type FieldTypeDefinition,
  valueFieldMapper,
} from '@ng-forge/dynamic-forms/integration';
import { nativeSubmitButtonMapper } from './native-submit.mapper';

const VALUE = { renderReadyWhen: ['field'] } as const;
const BUTTON = { renderReadyWhen: [], valueHandling: 'exclude' } as const;

export const NATIVE_FIELD_TYPES: FieldTypeDefinition[] = [
  { name: 'input', loadComponent: () => import('./native-input.component'), mapper: valueFieldMapper, ...VALUE },
  { name: 'toggle', loadComponent: () => import('./native-toggle.component'), mapper: checkboxFieldMapper, ...VALUE },
  { name: 'button', loadComponent: () => import('./native-button.component'), mapper: buttonFieldMapper, ...BUTTON },
  { name: 'submit', loadComponent: () => import('./native-button.component'), mapper: nativeSubmitButtonMapper, ...BUTTON },
  { name: 'add-array-item', loadComponent: () => import('./native-button.component'), mapper: addArrayItemButtonMapper, ...BUTTON },
  // Overrides core's `text`, which renders <p>/<h1-6> that have no native counterpart.
  {
    name: 'text',
    loadComponent: () => import('./native-text.component'),
    mapper: textFieldMapper,
    valueHandling: 'exclude',
    renderReadyWhen: [],
  },
];

export function withNativeFields(): FieldTypeDefinition[] {
  return NATIVE_FIELD_TYPES;
}
