// Types
export type { DerivationEntry, DerivationCollection, CycleDetectionResult, DerivationChainContext } from './derivation-types';

export { createEmptyDerivationCollection, createDerivationChainContext, createDerivationKey, parseDerivationKey } from './derivation-types';

// Collector
export { collectDerivations } from './derivation-collector';

// Cache
export { precomputeCachedCollections, getOnChangeCollection, getDebouncedCollection, getDebouncePeriods } from './derivation-cache';

// Cycle detection
export { detectCycles, validateNoCycles } from './cycle-detector';

// Sorter
export { topologicalSort, createSortedCollection } from './derivation-sorter';

// Applicator
export type { DerivationApplicatorContext, DerivationProcessingResult } from './derivation-applicator';
export { applyDerivations, applyDerivationsForTrigger, getDebouncedDerivationEntries } from './derivation-applicator';

// Warning Tracker
export type { DerivationWarningTracker } from './derivation-warning-tracker';
export { DERIVATION_WARNING_TRACKER, createDerivationWarningTracker } from './derivation-warning-tracker';

// Constants
export { MAX_DERIVATION_ITERATIONS, ARRAY_PLACEHOLDER, MAX_AST_CACHE_SIZE, DERIVATION_KEY_DELIMITER } from './derivation-constants';

// Re-export DEFAULT_DEBOUNCE_MS from the general debounce utility for convenience
export { DEFAULT_DEBOUNCE_MS } from '../../utils/debounce/debounce';

// Logger
export type { DerivationLogLevel, DerivationLogConfig } from './derivation-logger';
export { logDerivationSummary, logMaxIterationsReached, createDefaultDerivationLogConfig } from './derivation-logger';
