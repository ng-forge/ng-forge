/**
 * Back-compat injection token for the (formerly separate) property-derivation
 * orchestrator. The property pipeline is now wired by the unified
 * {@link DerivationOrchestrator} from `core/derivation/`. This token resolves
 * via `useExisting` to the same instance — kept so any consumer still calling
 * `inject(PROPERTY_DERIVATION_ORCHESTRATOR)` continues to work.
 *
 * New code should `inject(DERIVATION_ORCHESTRATOR)` directly.
 *
 * @deprecated Use {@link DERIVATION_ORCHESTRATOR}.
 */
import { InjectionToken } from '@angular/core';
import { DerivationOrchestrator } from '../derivation/derivation-orchestrator';

export const PROPERTY_DERIVATION_ORCHESTRATOR = new InjectionToken<DerivationOrchestrator>('PROPERTY_DERIVATION_ORCHESTRATOR');
