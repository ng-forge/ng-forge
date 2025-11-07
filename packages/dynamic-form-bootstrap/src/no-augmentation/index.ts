/**
 * @ng-forge/dynamic-form-bootstrap/no-augmentation
 *
 * This entry point exports all Bootstrap functionality WITHOUT module augmentation.
 * Use this in applications where multiple UI libraries need to coexist (e.g., docs app).
 *
 * The default entry point includes module augmentation which extends the
 * FieldRegistryLeaves interface globally. Only one UI library can augment
 * at a time to avoid TypeScript conflicts.
 */

// Field components
export * from '../lib/fields';

// Configuration
export { BOOTSTRAP_FIELD_TYPES } from '../lib/config/bootstrap-field-config';

// Types and constants
export { BsField, type BsFieldType } from '../lib/types/types';

// Providers
export { withBootstrapFields } from '../lib/providers/bootstrap-providers';

// Testing utilities
export * from '../lib/testing';

// Note: registry-augmentation is intentionally NOT imported here
