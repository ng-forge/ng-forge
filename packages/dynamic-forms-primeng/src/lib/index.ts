// Field components
export * from './fields';

// Configuration
export { PRIMENG_FIELD_TYPES } from './config/primeng-field-config';
export * from './models';

// Types and constants
export { PrimeField, type PrimeFieldType } from './types/types';

// Module augmentation for global types
import './types/registry-augmentation';

// Providers
export { withPrimeNGFields } from './providers/primeng-providers';

// Testing utilities
export * from './testing';
