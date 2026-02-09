// Types
export type { PropertyDerivationEntry, PropertyDerivationCollection } from './property-derivation-types';
export { createEmptyPropertyDerivationCollection } from './property-derivation-types';

// Store
export type { PropertyOverrideStore } from './property-override-store';
export { createPropertyOverrideStore, PROPERTY_OVERRIDE_STORE } from './property-override-store';

// Key utility
export { buildPropertyOverrideKey, PLACEHOLDER_INDEX } from './property-override-key';

// Collector
export { collectPropertyDerivations } from './property-derivation-collector';

// Applicator
export type { PropertyDerivationApplicatorContext, PropertyDerivationProcessingResult } from './property-derivation-applicator';
export { applyPropertyDerivations, applyPropertyDerivationsForTrigger } from './property-derivation-applicator';

// Apply overrides
export { applyPropertyOverrides } from './apply-property-overrides';

// Orchestrator
export type { PropertyDerivationOrchestratorConfig } from './property-derivation-orchestrator';
export {
  PropertyDerivationOrchestrator,
  createPropertyDerivationOrchestrator,
  PROPERTY_DERIVATION_ORCHESTRATOR,
} from './property-derivation-orchestrator';
