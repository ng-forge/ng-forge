import { Provider } from '@angular/core';
import { EventBus } from '../events/event.bus';
import { FieldContextRegistryService } from '../core/registry/field-context-registry.service';
import { FunctionRegistryService } from '../core/registry/function-registry.service';
import { RootFormRegistryService } from '../core/registry/root-form-registry.service';
import { SchemaRegistryService } from '../core/registry/schema-registry.service';
import { FormStateManager, FORM_STATE_DEPS, FormStateDeps } from '../state/form-state-manager';
import { DEFAULT_PROPS, DEFAULT_VALIDATION_MESSAGES, EXTERNAL_DATA, FORM_OPTIONS } from '../models/field-signal-context.token';
import { DERIVATION_WARNING_TRACKER } from '../core/derivation/derivation-warning-tracker';
import { DEPRECATION_WARNING_TRACKER, createDeprecationWarningTracker } from '../utils/deprecation-warning-tracker';
import { DERIVATION_ORCHESTRATOR, createDerivationOrchestrator } from '../core/derivation/derivation-orchestrator';
import { DynamicFormLogger } from './features/logger/logger.token';
import { Logger } from './features/logger/logger.interface';
import { DERIVATION_LOG_CONFIG } from './features/logger/with-logger-config';
import { DerivationLogConfig } from '../models/logic/logic-config';
import { CONTAINER_FIELD_PROCESSORS, createContainerFieldProcessors } from '../utils/container-utils/container-field-processors';
import { PROPERTY_OVERRIDE_STORE } from '../core/property-derivation/property-override-store';
import { HTTP_CONDITION_CACHE } from '../core/http/http-condition-cache';
import { LogicFunctionCacheService } from '../core/expressions/logic-function-cache.service';
import { HttpConditionFunctionCacheService } from '../core/expressions/http-condition-function-cache.service';
import { AsyncConditionFunctionCacheService } from '../core/expressions/async-condition-function-cache.service';
import { DynamicValueFunctionCacheService } from '../core/values/dynamic-value-function-cache.service';
import {
  createPropertyDerivationOrchestrator,
  PROPERTY_DERIVATION_ORCHESTRATOR,
} from '../core/property-derivation/property-derivation-orchestrator';
import { DynamicFormContext } from './dynamic-form-context';

/**
 * Provides all per-form DI tokens for the `DynamicForm` component.
 *
 * Uses `DynamicFormContext` as a single factory that eagerly constructs all
 * services/signals that depend on `FormStateManager` but don't require
 * Angular's injection context. Bridge providers then delegate to the context
 * so existing `inject()` call sites continue to work unchanged.
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

    // ─── Phase 3: DynamicFormContext — single factory for post-FSM services ─
    {
      provide: DynamicFormContext,
      useFactory: (stateManager: FormStateManager, logger: Logger, logConfig: DerivationLogConfig) =>
        new DynamicFormContext(stateManager, logger, logConfig),
      deps: [FormStateManager, DynamicFormLogger, DERIVATION_LOG_CONFIG],
    },

    // ─── Phase 4: Bridge providers — delegate to DynamicFormContext ─────────
    { provide: RootFormRegistryService, useFactory: (ctx: DynamicFormContext) => ctx.rootFormRegistry, deps: [DynamicFormContext] },
    { provide: DEFAULT_PROPS, useFactory: (ctx: DynamicFormContext) => ctx.defaultProps, deps: [DynamicFormContext] },
    {
      provide: DEFAULT_VALIDATION_MESSAGES,
      useFactory: (ctx: DynamicFormContext) => ctx.defaultValidationMessages,
      deps: [DynamicFormContext],
    },
    { provide: FORM_OPTIONS, useFactory: (ctx: DynamicFormContext) => ctx.formOptions, deps: [DynamicFormContext] },
    { provide: EXTERNAL_DATA, useFactory: (ctx: DynamicFormContext) => ctx.externalData, deps: [DynamicFormContext] },
    {
      provide: DERIVATION_WARNING_TRACKER,
      useFactory: (ctx: DynamicFormContext) => ctx.derivationWarningTracker,
      deps: [DynamicFormContext],
    },
    { provide: PROPERTY_OVERRIDE_STORE, useFactory: (ctx: DynamicFormContext) => ctx.propertyOverrideStore, deps: [DynamicFormContext] },
    { provide: HTTP_CONDITION_CACHE, useFactory: (ctx: DynamicFormContext) => ctx.httpConditionCache, deps: [DynamicFormContext] },
    { provide: LogicFunctionCacheService, useFactory: (ctx: DynamicFormContext) => ctx.logicFunctionCache, deps: [DynamicFormContext] },
    {
      provide: HttpConditionFunctionCacheService,
      useFactory: (ctx: DynamicFormContext) => ctx.httpConditionFunctionCache,
      deps: [DynamicFormContext],
    },
    {
      provide: AsyncConditionFunctionCacheService,
      useFactory: (ctx: DynamicFormContext) => ctx.asyncConditionFunctionCache,
      deps: [DynamicFormContext],
    },
    {
      provide: DynamicValueFunctionCacheService,
      useFactory: (ctx: DynamicFormContext) => ctx.dynamicValueFunctionCache,
      deps: [DynamicFormContext],
    },

    // ─── Phase 5: Services with inject() — must stay as DI providers ───────
    FieldContextRegistryService,
    {
      provide: DERIVATION_ORCHESTRATOR,
      useFactory: (ctx: DynamicFormContext) => createDerivationOrchestrator(ctx.derivationOrchestratorConfig),
      deps: [DynamicFormContext],
    },
    {
      provide: PROPERTY_DERIVATION_ORCHESTRATOR,
      useFactory: (ctx: DynamicFormContext) => createPropertyDerivationOrchestrator(ctx.propertyDerivationOrchestratorConfig),
      deps: [DynamicFormContext],
    },
  ];
}
