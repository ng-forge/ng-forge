// Field fields
export * from './fields';

// Configuration
export { MATERIAL_FIELD_TYPES } from './config/material-field-config';

// Field type constants and types
export {
  MatField,
  type MatFieldType,
  type MatFieldTypeMap,
  type MatFieldValueType,
  getAllMatFieldTypes,
  isMatFieldType,
  getMatFieldValueTypeName,
} from './types/material-field-types.enum';

// Providers
export { withMaterial, withMaterialFields } from './providers/material-providers';

// Type augmentations (must be imported to register the type extensions)
import './types/material-field-types';
