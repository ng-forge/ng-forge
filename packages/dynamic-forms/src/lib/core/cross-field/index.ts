// Types
export type {
  CrossFieldCategory,
  BaseCrossFieldEntry,
  CrossFieldValidatorEntry,
  LogicType,
  CrossFieldLogicEntry,
  CrossFieldSchemaEntry,
  CrossFieldEntry,
} from './cross-field-types';

// Detection
export { isCrossFieldExpression } from '@ng-forge/dynamic-forms/internal';
export type { CrossFieldDetectionContext } from '@ng-forge/dynamic-forms/internal';

// Collector
export { collectCrossFieldEntries, createEmptyCollection } from './cross-field-collector';
export type { CrossFieldCollection } from './cross-field-collector';
