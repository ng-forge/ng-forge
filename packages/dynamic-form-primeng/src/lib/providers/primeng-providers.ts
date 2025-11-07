import { FieldTypeDefinition } from '@ng-forge/dynamic-form';
import { PRIMENG_FIELD_TYPES } from '../config/primeng-field-config';

/**
 * Provides PrimeNG field type definitions for the dynamic form system.
 *
 * Use this function in your application providers to register PrimeNG field components.
 *
 * @example
 * ```typescript
 * // Component-level provider (recommended)
 * @Component({
 *   providers: [
 *     provideDynamicForm(...withPrimeNGFields())
 *   ]
 * })
 * export class MyFormComponent {
 *   config = {
 *     fields: [
 *       { key: 'email', type: 'input', props: { type: 'email' } }
 *     ]
 *   };
 * }
 * ```
 *
 * @returns Array of field type definitions for PrimeNG components
 */
export function withPrimeNGFields(): FieldTypeDefinition[] {
  return PRIMENG_FIELD_TYPES;
}
