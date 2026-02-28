import { computed, Provider, Signal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { EventBus } from '../events/event.bus';
import { FieldContextRegistryService } from '../core/registry/field-context-registry.service';
import { FunctionRegistryService } from '../core/registry/function-registry.service';
import { RootFormRegistryService } from '../core/registry/root-form-registry.service';
import { SchemaRegistryService } from '../core/registry/schema-registry.service';
import { FormStateManager, FORM_STATE_DEPS, FormStateDeps } from '../state/form-state-manager';
import { DEFAULT_PROPS, DEFAULT_VALIDATION_MESSAGES, FORM_OPTIONS } from '../models/field-signal-context.token';
import { DERIVATION_WARNING_TRACKER, createDerivationWarningTracker } from '../core/derivation/derivation-warning-tracker';
import { DEPRECATION_WARNING_TRACKER, createDeprecationWarningTracker } from '../utils/deprecation-warning-tracker';
import { DERIVATION_ORCHESTRATOR, createDerivationOrchestrator } from '../core/derivation/derivation-orchestrator';
import { DynamicFormLogger } from './features/logger/logger.token';
import { DERIVATION_LOG_CONFIG } from './features/logger/with-logger-config';
import { CONTAINER_FIELD_PROCESSORS, createContainerFieldProcessors } from '../utils/container-utils/container-field-processors';
import {
  PropertyOverrideStore,
  PROPERTY_OVERRIDE_STORE,
  createPropertyOverrideStore,
} from '../core/property-derivation/property-override-store';
import {
  createPropertyDerivationOrchestrator,
  PROPERTY_DERIVATION_ORCHESTRATOR,
} from '../core/property-derivation/property-derivation-orchestrator';
import { ExpressionCacheContext } from './expression-cache-context';
import { FormDerivedState } from './form-derived-state';
import { FieldDef } from '../definitions/base/field-def';
import { createDerivationLogger } from '../core/derivation/derivation-logger.service';
import { Logger } from './features/logger/logger.interface';
import { DerivationLogConfig } from '../models/logic/logic-config';

/**
 * Provides all per-form DI tokens for the `DynamicForm` component.
 *
 * Uses two cohesive groups to reduce token count:
 * - `ExpressionCacheContext` — aggregates all expression/logic caches (5 → 1)
 * - `FormDerivedState` — aggregates readonly signals from `FormStateManager` (4 → 1, +3 public bridges)
 *
 * Services injected **by** `FormStateManager` (SchemaRegistryService,
 * FunctionRegistryService, DEPRECATION_WARNING_TRACKER, CONTAINER_FIELD_PROCESSORS)
 * are provided before `FormStateManager` to avoid circular DI.
 *
 * Services that use `inject()` internally (EventBus, FormStateManager,
 * FieldContextRegistryService, orchestrators) remain as regular DI providers.
 *
 * @internal
 */
export function provideDynamicFormDI(): Provider[] {
  return [
    // ─── Phase 1: Providers needed by FormStateManager (no circular deps) ──
    EventBus,
    { provide: CONTAINER_FIELD_PROCESSORS, useFactory: createContainerFieldProcessors },
    SchemaRegistryService,
    FunctionRegistryService,
    { provide: DEPRECATION_WARNING_TRACKER, useFactory: createDeprecationWarningTracker },
    {
      provide: FORM_STATE_DEPS,
      useFactory: (): FormStateDeps => ({ config: null, formOptions: null, value: null }),
    },

    // ─── Phase 2: FormStateManager ─────────────────────────────────────────
    FormStateManager,

    // ─── Phase 3: Cohesive groups ──────────────────────────────────────────
    ExpressionCacheContext,
    {
      provide: FormDerivedState,
      useFactory: (stateManager: FormStateManager) => new FormDerivedState(stateManager),
      deps: [FormStateManager],
    },

    // ─── Phase 4: Services derived from FormStateManager ───────────────────
    {
      provide: RootFormRegistryService,
      useFactory: (stateManager: FormStateManager) =>
        new RootFormRegistryService(
          stateManager.formValue as Signal<Record<string, unknown>>,
          computed(() => stateManager.form()),
        ),
      deps: [FormStateManager],
    },
    { provide: DERIVATION_WARNING_TRACKER, useFactory: createDerivationWarningTracker },
    { provide: PROPERTY_OVERRIDE_STORE, useFactory: createPropertyOverrideStore },

    // ─── Phase 5: Public API bridge providers (delegate to FormDerivedState) ─
    { provide: DEFAULT_PROPS, useFactory: (state: FormDerivedState) => state.defaultProps, deps: [FormDerivedState] },
    {
      provide: DEFAULT_VALIDATION_MESSAGES,
      useFactory: (state: FormDerivedState) => state.defaultValidationMessages,
      deps: [FormDerivedState],
    },
    { provide: FORM_OPTIONS, useFactory: (state: FormDerivedState) => state.formOptions, deps: [FormDerivedState] },

    // ─── Phase 6: Services with inject() — must stay as DI providers ───────
    FieldContextRegistryService,
    {
      provide: DERIVATION_ORCHESTRATOR,
      useFactory: (stateManager: FormStateManager, derivedState: FormDerivedState, logger: Logger, logConfig: DerivationLogConfig) =>
        createDerivationOrchestrator({
          schemaFields: computed(() => stateManager.formSetup()?.schemaFields as FieldDef<unknown>[] | undefined),
          formValue: stateManager.formValue as Signal<Record<string, unknown>>,
          form: computed(() => stateManager.form() as unknown as FieldTree<unknown>),
          derivationLogger: computed(() => createDerivationLogger(logConfig, logger)),
          externalData: derivedState.externalData,
        }),
      deps: [FormStateManager, FormDerivedState, DynamicFormLogger, DERIVATION_LOG_CONFIG],
    },
    {
      provide: PROPERTY_DERIVATION_ORCHESTRATOR,
      useFactory: (stateManager: FormStateManager, derivedState: FormDerivedState, store: PropertyOverrideStore) =>
        createPropertyDerivationOrchestrator({
          schemaFields: computed(() => stateManager.formSetup()?.schemaFields as FieldDef<unknown>[] | undefined),
          formValue: stateManager.formValue as Signal<Record<string, unknown>>,
          store,
          externalData: derivedState.externalData,
        }),
      deps: [FormStateManager, FormDerivedState, PROPERTY_OVERRIDE_STORE],
    },
  ];
}
