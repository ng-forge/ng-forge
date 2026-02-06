import { computed, Provider, Signal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { EventBus } from '../events/event.bus';
import { FieldContextRegistryService } from '../core/registry/field-context-registry.service';
import { FunctionRegistryService } from '../core/registry/function-registry.service';
import { RootFormRegistryService } from '../core/registry/root-form-registry.service';
import { SchemaRegistryService } from '../core/registry/schema-registry.service';
import { DYNAMIC_FORM_REF } from '../core/registry/dynamic-form-ref.token';
import { FormStateManager } from '../state/form-state-manager';
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

/**
 * Creates all providers needed by the DynamicForm component.
 *
 * Extracts provider setup from the component decorator to:
 * - Eliminate circular dependency (DERIVATION_ORCHESTRATOR previously depended on DynamicForm)
 * - Centralize provider configuration in one place
 * - Make the component class thinner
 *
 * @returns Array of providers for the DynamicForm component
 *
 * @internal
 */
export function provideDynamicFormDI(): Provider[] {
  return [
    EventBus,
    SchemaRegistryService,
    FunctionRegistryService,
    FormStateManager,
    {
      provide: DYNAMIC_FORM_REF,
      useFactory: (stateManager: FormStateManager) => ({
        entity: stateManager.entity,
        form: computed(() => stateManager.form()),
      }),
      deps: [FormStateManager],
    },
    RootFormRegistryService,
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
      useFactory: (stateManager: FormStateManager, logger: Logger, logConfig: DerivationLogConfig) => {
        const config: DerivationOrchestratorConfig = {
          schemaFields: computed(() => stateManager.formSetup()?.schemaFields as FieldDef<unknown>[] | undefined),
          formValue: stateManager.formValue as Signal<Record<string, unknown>>,
          // Safe: form() returns Angular Signals Form instance which implements FieldTree at runtime.
          // TypeScript can't prove compatibility due to generic erasure between form<TModel> and FieldTree<unknown>.
          form: computed(() => stateManager.form() as unknown as FieldTree<unknown>),
          derivationLogger: computed(() => createDerivationLogger(logConfig, logger)),
        };
        return createDerivationOrchestrator(config);
      },
      deps: [FormStateManager, DynamicFormLogger, DERIVATION_LOG_CONFIG],
    },
  ];
}
