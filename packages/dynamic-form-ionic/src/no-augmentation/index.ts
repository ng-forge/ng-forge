/**
 * No-augmentation entry point for @ng-forge/dynamic-form-ionic
 *
 * Use this entry point when you have multiple UI libraries (e.g., Material + Ionic)
 * to avoid TypeScript module augmentation conflicts.
 *
 * @example
 * ```typescript
 * import { withIonicFields } from '@ng-forge/dynamic-form-ionic/no-augmentation';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideDynamicForm(...withIonicFields()),
 *   ],
 * };
 * ```
 */

// Field type definitions (without module augmentation)
export * from '../lib/types/field-types';

// Configuration
export { IONIC_FIELD_TYPES } from '../lib/config/ionic-field-config';

// Types and constants
export { IonicField, type IonicFieldType } from '../lib/types/types';

// Providers
export { withIonicFields } from '../lib/providers/ionic-providers';

// Helper functions
export {
  submitButton,
  nextPageButton,
  previousPageButton,
  actionButton,
} from '../lib/fields/button/ionic-button.function';
