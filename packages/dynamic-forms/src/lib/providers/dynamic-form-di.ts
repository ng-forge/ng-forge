import { computed, Provider, Signal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { EventBus } from '../events/event.bus';
import { FieldContextRegistryService, FunctionRegistryService, RootFormRegistryService, SchemaRegistryService } from '../core/registry';
import { FormStateManager } from '../state/form-state-manager';
import { DEFAULT_PROPS, DEFAULT_VALIDATION_MESSAGES, EXTERNAL_DATA, FORM_OPTIONS } from '../models/field-signal-context.token';
import {
  DERIVATION_WARNING_TRACKER,
  DERIVATION_ORCHESTRATOR,
  createDerivationWarningTracker,
  createDerivationOrchestrator,
  createDerivationLogger,
  DerivationOrchestratorConfig,
} from '../core/derivation';
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
    RootFormRegistryService,
    FieldContextRegistryService,
    FormStateManager,
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
          form: computed(() => stateManager.form() as unknown as FieldTree<unknown>),
          derivationLogger: computed(() => createDerivationLogger(logConfig, logger)),
        };
        return createDerivationOrchestrator(config);
      },
      deps: [FormStateManager, DynamicFormLogger, DERIVATION_LOG_CONFIG],
    },
  ];
}
