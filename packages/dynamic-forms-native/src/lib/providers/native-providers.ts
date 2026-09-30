import { FieldTypeDefinition } from '@ng-forge/dynamic-forms/integration';
import { NATIVE_FIELD_TYPES } from '../config/native-field-config';

/**
 * The ng-native field types, for `provideDynamicForm(...withNativeFields())`.
 */
export function withNativeFields(): FieldTypeDefinition[] {
  return NATIVE_FIELD_TYPES;
}
