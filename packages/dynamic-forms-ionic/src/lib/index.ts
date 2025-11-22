// Field fields
export * from './fields';

// Configuration
export { IONIC_FIELD_TYPES } from './config/ionic-field-config';
export * from './models';

// Types and constants
export { IonicField, type IonicFieldType } from './types/types';

// Module augmentation for global types
import './types/registry-augmentation';

// Providers
export { withIonicFields } from './providers/ionic-providers';
