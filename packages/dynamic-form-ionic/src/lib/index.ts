// Field fields
export * from './fields';

// Configuration
export { IONIC_FIELD_TYPES } from './config/ionic-field-config';
export type { IonicConfig } from './models/ionic-config';
export { IONIC_CONFIG } from './models/ionic-config.token';

// Types and constants
export { IonicField, type IonicFieldType } from './types/types';

// Module augmentation for global types
import './types/registry-augmentation';

// Providers
export { withIonicFields, withIonicConfig } from './providers/ionic-providers';
