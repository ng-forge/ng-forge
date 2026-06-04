import { computed, inject, Signal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { DerivationLogConfig, DynamicFormLogger, EXTERNAL_DATA, FieldDef } from '@ng-forge/dynamic-forms/internal';
import { DERIVATION_LOG_CONFIG } from '../../providers/features/logger/with-logger-config';
import { FormStateManager } from '../../state/form-state-manager';
import { PROPERTY_OVERRIDE_STORE } from '../property-derivation/property-override-store';
import { createDerivationLogger } from './derivation-logger.service';
import { createDerivationOrchestrator, DerivationOrchestratorConfig } from './derivation-orchestrator';

/**
 * Lazy entry point for the derivation engine. This module is the dynamic-import
 * chunk boundary: it statically imports the heavy {@link createDerivationOrchestrator}
 * (and the value/property/HTTP/async stream factories it pulls), so the whole
 * engine only loads when a config actually declares a derivation.
 *
 * Builds the orchestrator config from the form-scoped DI services and constructs
 * the orchestrator. Must be called within the form's injection context (the
 * orchestrator reads `inject(DestroyRef)`/`inject(FORM_OPTIONS)` etc. in its field
 * initializers). The instance is retained by the reactive stream subscriptions it
 * wires (tied to the component `DestroyRef`), so the return value is intentionally
 * discarded.
 *
 * @internal
 */
export function bootstrapDerivationOrchestrator(): void {
  const stateManager = inject(FormStateManager);
  const logger = inject(DynamicFormLogger);
  const logConfig = inject<DerivationLogConfig>(DERIVATION_LOG_CONFIG);
  const externalData = inject(EXTERNAL_DATA);
  const propertyStore = inject(PROPERTY_OVERRIDE_STORE);

  // FormStateManager is injected without type parameters, so its generic defaults
  // to Record<string, unknown>. The casts widen the type to match
  // DerivationOrchestratorConfig (which uses unknown) — safe because the
  // orchestrator only reads values.
  const config: DerivationOrchestratorConfig = {
    schemaFields: computed(() => stateManager.formSetup()?.schemaFields as FieldDef<unknown>[] | undefined),
    formValue: stateManager.formValue as Signal<Record<string, unknown>>,
    form: computed(() => stateManager.form() as unknown as FieldTree<unknown>),
    derivationLogger: computed(() => createDerivationLogger(logConfig, logger)),
    propertyStore,
    externalData,
  };

  createDerivationOrchestrator(config);
}
