// Field fields
export * from './fields';

// Configuration
export { MATERIAL_FIELD_TYPES } from './config/material-field-config';

// Types and constants
export { MatField, type MatFieldType } from './types/types';

// Module augmentation for global types (auto-imported when package is used)
import './types/material-form-config';

// Providers
export { withMaterialFields } from './providers/material-providers';
