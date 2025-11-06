/**
 * Secondary entry point for @ng-forge/dynamic-form-primeng without module augmentation.
 *
 * Use this entry point when you need to use PrimeNG fields alongside other field libraries
 * (like Material) in the same application to avoid TypeScript module augmentation conflicts.
 *
 * This entry point exports all the same functionality as the main entry point,
 * but does NOT augment the global FieldRegistryLeaves interface.
 *
 * @example
 * ```typescript
 * import { withPrimeNGFields } from '@ng-forge/dynamic-form-primeng/no-augmentation';
 *
 * @Component({
 *   providers: [provideDynamicForm(...withPrimeNGFields())]
 * })
 * export class MyComponent {}
 * ```
 */

// Field components
export * from '../lib/fields';

// Configuration
export { PRIMENG_FIELD_TYPES } from '../lib/config/primeng-field-config';

// Types and constants
export { PrimeField } from '../lib/types/types';
// Note: Field types are exported from individual field modules in '../lib/fields'

// Providers
export { withPrimeNGFields } from '../lib/providers/primeng-providers';

// Shared components
export { PrimeErrorsComponent } from '../lib/shared/prime-errors.component';

// Testing utilities
export * from '../lib/testing';

// NOTE: Module augmentation is NOT imported here to avoid conflicts with other field libraries
