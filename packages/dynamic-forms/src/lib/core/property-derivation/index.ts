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

// Orchestrator — the property-derivation pipeline is now wired by the unified
// `DerivationOrchestrator` in `core/derivation/`. Only the legacy DI token is
// retained for back-compat (it resolves to the same unified instance via
// `useExisting`). Construct `DerivationOrchestrator` with `propertyStore` set
// to wire the property pipeline.
export { PROPERTY_DERIVATION_ORCHESTRATOR } from '../derivation/derivation-orchestrator';
