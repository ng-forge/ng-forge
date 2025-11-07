import { FieldTypeDefinition } from '@ng-forge/dynamic-form';
import { BOOTSTRAP_FIELD_TYPES } from '../config/bootstrap-field-config';

/**
 * Provides Bootstrap field types for the dynamic form system.
 * Use with provideDynamicForm(...withBootstrapFields())
 *
 * @example
 * ```typescript
 * @Component({
 *   providers: [provideDynamicForm(...withBootstrapFields())],
 * })
 * export class MyFormComponent {
 *   config: DynamicFormConfig = {
 *     fields: [
 *       {
 *         key: 'email',
 *         type: 'input',
 *         label: 'Email',
 *         props: { type: 'email', size: 'lg' }
 *       }
 *     ]
 *   };
 * }
 * ```
 */
export function withBootstrapFields(): FieldTypeDefinition[] {
  return BOOTSTRAP_FIELD_TYPES;
}
