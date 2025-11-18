// Field components
export * from './fields';

// Configuration
export { MATERIAL_FIELD_TYPES } from './config/material-field-config';
export type { MaterialConfig } from './models/material-config';
export { MATERIAL_CONFIG } from './models/material-config.token';

// Types and constants
export { MatField, type MatFieldType } from './types/types';

// Module augmentation for global types
import './types/registry-augmentation';

// Providers
export { withMaterialFields, withMaterialConfig } from './providers/material-providers';
