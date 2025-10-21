// Field components
export * from './fields';

// Configuration
export { MATERIAL_FIELD_TYPES } from './config/material-field-config';

// Providers
export { withMaterialFields, withTypedMaterialFields } from './providers/material-providers';

// Type augmentations (must be imported to register the type extensions)
import './types/material-field-types';
