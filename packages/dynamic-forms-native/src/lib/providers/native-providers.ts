import type { FieldTypeDefinition, WrapperTypeDefinition } from '@ng-forge/dynamic-forms/integration';
import { NATIVE_FIELD_TYPES } from '../config/native-field-config';

/**
 * Core wrappers whose rendering assumes a browser. Registered under the built-in names, so these
 * replace them: a later registration of a built-in wrapper name wins without a warning.
 */
export const NATIVE_WRAPPERS: WrapperTypeDefinition[] = [
  { wrapperName: 'row', loadComponent: () => import('../wrappers/native-row-wrapper.component') },
  {
    wrapperName: 'field-errors',
    loadComponent: () => import('../wrappers/native-field-errors-wrapper.component'),
    rendersFieldErrors: true,
  },
];

/**
 * The ng-native field types and wrappers, for `provideDynamicForm(...withNativeFields())`.
 */
export function withNativeFields(): (FieldTypeDefinition | WrapperTypeDefinition)[] {
  return [...NATIVE_FIELD_TYPES, ...NATIVE_WRAPPERS];
}
