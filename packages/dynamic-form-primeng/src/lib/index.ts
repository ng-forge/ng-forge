// Field components
export * from './fields';

// Configuration
export { PRIMENG_FIELD_TYPES } from './config/primeng-field-config';
export type { PrimeNGConfig } from './models/primeng-config';
export { PRIMENG_CONFIG } from './models/primeng-config.token';

// Types and constants
export { PrimeField, type PrimeFieldType } from './types/types';

// Module augmentation for global types
import './types/registry-augmentation';

// Providers
export { withPrimeNGFields, withPrimeNGConfig } from './providers/primeng-providers';

// Testing utilities
export * from './testing';
