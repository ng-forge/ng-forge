import { computed, Provider, Signal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { EventBus } from '../events/event.bus';
import { FieldContextRegistryService } from '../core/registry/field-context-registry.service';
import { FunctionRegistryService } from '../core/registry/function-registry.service';
import { RootFormRegistryService } from '../core/registry/root-form-registry.service';
import { SchemaRegistryService } from '../core/registry/schema-registry.service';
import { FormStateManager, FORM_STATE_DEPS, FormStateDeps } from '../state/form-state-manager';
import { DEFAULT_PROPS, DEFAULT_VALIDATION_MESSAGES, EXTERNAL_DATA, FORM_OPTIONS } from '../models/field-signal-context.token';
import { DERIVATION_WARNING_TRACKER, createDerivationWarningTracker } from '../core/derivation/derivation-warning-tracker';
import {
  DERIVATION_ORCHESTRATOR,
  createDerivationOrchestrator,
  DerivationOrchestratorConfig,
} from '../core/derivation/derivation-orchestrator';
import { createDerivationLogger } from '../core/derivation/derivation-logger.service';
import { DynamicFormLogger } from './features/logger/logger.token';
import { Logger } from './features/logger/logger.interface';
import { DERIVATION_LOG_CONFIG } from './features/logger/with-logger-config';
import { DerivationLogConfig } from '../models/logic/logic-config';
import { FieldDef } from '../definitions/base/field-def';
import { CONTAINER_FIELD_PROCESSORS, createContainerFieldProcessors } from '../utils/container-utils/container-field-processors';
import {
  createPropertyOverrideStore,
  PROPERTY_OVERRIDE_STORE,
  PropertyOverrideStore,
} from '../core/property-derivation/property-override-store';
import {
  createPropertyDerivationOrchestrator,
  PROPERTY_DERIVATION_ORCHESTRATOR,
  PropertyDerivationOrchestratorConfig,
} from '../core/property-derivation/property-derivation-orchestrator';

/** @internal */
export function provideDynamicFormDI(): Provider[] {
  return [
    EventBus,
    { provide: CONTAINER_FIELD_PROCESSORS, useFactory: createContainerFieldProcessors },
    SchemaRegistryService,
    FunctionRegistryService,
    {
      provide: FORM_STATE_DEPS,
      useFactory: (): FormStateDeps => ({ config: null, formOptions: null, value: null }),
    },
    FormStateManager,
    {
      provide: RootFormRegistryService,
      useFactory: (stateManager: FormStateManager) =>
        new RootFormRegistryService(
          stateManager.formValue as Signal<Record<string, unknown>>,
          computed(() => stateManager.form()),
        ),
      deps: [FormStateManager],
    },
    FieldContextRegistryService,
    {
      provide: DEFAULT_PROPS,
      useFactory: (stateManager: FormStateManager) => computed(() => stateManager.activeConfig()?.defaultProps),
      deps: [FormStateManager],
    },
    {
      provide: DEFAULT_VALIDATION_MESSAGES,
      useFactory: (stateManager: FormStateManager) => computed(() => stateManager.activeConfig()?.defaultValidationMessages),
      deps: [FormStateManager],
    },
    {
      provide: FORM_OPTIONS,
      useFactory: (stateManager: FormStateManager) => stateManager.effectiveFormOptions,
      deps: [FormStateManager],
    },
    {
      provide: EXTERNAL_DATA,
      useFactory: (stateManager: FormStateManager) => computed(() => stateManager.activeConfig()?.externalData),
      deps: [FormStateManager],
    },
    { provide: DERIVATION_WARNING_TRACKER, useFactory: createDerivationWarningTracker },
    {
      provide: DERIVATION_ORCHESTRATOR,
      useFactory: (
        stateManager: FormStateManager,
        logger: Logger,
        logConfig: DerivationLogConfig,
        externalData: Signal<Record<string, Signal<unknown>> | undefined>,
      ) => {
        // FormStateManager is injected without type parameters, so its generic defaults
        // to Record<string, unknown>. The casts widen the type to match DerivationOrchestratorConfig
        // which uses unknown — safe because the orchestrator only reads values.
        const config: DerivationOrchestratorConfig = {
          schemaFields: computed(() => stateManager.formSetup()?.schemaFields as FieldDef<unknown>[] | undefined),
          formValue: stateManager.formValue as Signal<Record<string, unknown>>,
          form: computed(() => stateManager.form() as unknown as FieldTree<unknown>),
          derivationLogger: computed(() => createDerivationLogger(logConfig, logger)),
          externalData,
        };
        return createDerivationOrchestrator(config);
      },
      deps: [FormStateManager, DynamicFormLogger, DERIVATION_LOG_CONFIG, EXTERNAL_DATA],
    },
    { provide: PROPERTY_OVERRIDE_STORE, useFactory: createPropertyOverrideStore },
    {
      provide: PROPERTY_DERIVATION_ORCHESTRATOR,
      useFactory: (
        stateManager: FormStateManager,
        externalData: Signal<Record<string, Signal<unknown>> | undefined>,
        store: PropertyOverrideStore,
      ) => {
        const config: PropertyDerivationOrchestratorConfig = {
          schemaFields: computed(() => stateManager.formSetup()?.schemaFields as FieldDef<unknown>[] | undefined),
          formValue: stateManager.formValue as Signal<Record<string, unknown>>,
          store,
          externalData,
        };
        return createPropertyDerivationOrchestrator(config);
      },
      deps: [FormStateManager, EXTERNAL_DATA, PROPERTY_OVERRIDE_STORE],
    },
  ];
}
