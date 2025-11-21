// Field components
export * from './fields';

// Configuration
export { MATERIAL_FIELD_TYPES } from './config/material-field-config';
export * from './models';

// Types and constants
export { MatField, type MatFieldType } from './types/types';

// Module augmentation for global types
import './types/registry-augmentation';

// Providers
export { withMaterialFields } from './providers/material-providers';
