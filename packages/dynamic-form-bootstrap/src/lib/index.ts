// Field components
export * from './fields';

// Configuration
export { BOOTSTRAP_FIELD_TYPES } from './config/bootstrap-field-config';
export type { BootstrapConfig } from './models/bootstrap-config';
export { BOOTSTRAP_CONFIG } from './models/bootstrap-config.token';

// Types and constants
export { BsField, type BsFieldType } from './types/types';

// Module augmentation for global types
import './types/registry-augmentation';

// Providers
export { withBootstrapFields, withBootstrapConfig } from './providers/bootstrap-providers';
