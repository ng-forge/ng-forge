// Types
export type {
  DerivationEntry,
  DerivationCollection,
  CycleDetectionResult,
  DerivationChainContext,
  DerivationProcessingResult,
} from './derivation-types';

export { createEmptyDerivationCollection, createDerivationChainContext, createDerivationKey, parseDerivationKey } from './derivation-types';

// Collector
export { collectDerivations } from './derivation-collector';

// Cycle detection
export { detectCycles, validateNoCycles } from './cycle-detector';

// Sorter
export { topologicalSort } from './derivation-sorter';

// Applicator
export type { DerivationApplicatorContext } from './derivation-applicator';
export { applyDerivations, applyDerivationsForTrigger, getDebouncedDerivationEntries } from './derivation-applicator';

// Warning Tracker
export type { DerivationWarningTracker } from './derivation-warning-tracker';
export { DERIVATION_WARNING_TRACKER, createDerivationWarningTracker } from './derivation-warning-tracker';

// Constants
export { MAX_DERIVATION_ITERATIONS, ARRAY_PLACEHOLDER, MAX_AST_CACHE_SIZE, DERIVATION_KEY_DELIMITER } from './derivation-constants';

// Re-export DEFAULT_DEBOUNCE_MS from the general debounce utility for convenience
export { DEFAULT_DEBOUNCE_MS } from '../../utils/debounce/debounce';

// Logger
export type { DerivationLogLevel, DerivationLogConfig, DerivationLogEntry } from './derivation-logger';
export { createDefaultDerivationLogConfig } from './derivation-logger';

// Derivation Logger Service
export type { DerivationLogger } from './derivation-logger.service';
export { createDerivationLogger } from './derivation-logger.service';

// Derivation Orchestrator
export type { DerivationOrchestratorConfig } from './derivation-orchestrator';
export {
  DerivationOrchestrator,
  createDerivationOrchestrator,
  DERIVATION_ORCHESTRATOR,
  injectDerivationOrchestrator,
} from './derivation-orchestrator';
