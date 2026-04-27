import { computed, Provider, Signal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { EventBus } from '../events/event.bus';
import { FieldContextRegistryService } from '../core/registry/field-context-registry.service';
import { FunctionRegistryService } from '../core/registry/function-registry.service';
import { RootFormRegistryService } from '../core/registry/root-form-registry.service';
import { SchemaRegistryService } from '../core/registry/schema-registry.service';
import { FormStateManager, FORM_STATE_DEPS, FormStateDeps } from '../state/form-state-manager';
import {
  DEFAULT_PROPS,
  DEFAULT_VALIDATION_MESSAGES,
  DEFAULT_WRAPPERS,
  EXTERNAL_DATA,
  FORM_OPTIONS,
} from '../models/field-signal-context.token';
import { DERIVATION_WARNING_TRACKER } from '../core/derivation/derivation-warning-tracker';
import { DEPRECATION_WARNING_TRACKER } from '../utils/deprecation-warning-tracker';
import { createWarningTracker } from '../utils/warning-tracker';
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
import { HTTP_CONDITION_CACHE, HttpConditionCache } from '../core/http/http-condition-cache';
import { LogicFunctionCacheService } from '../core/expressions/logic-function-cache.service';
import { HttpConditionFunctionCacheService } from '../core/expressions/http-condition-function-cache.service';
import { AsyncConditionFunctionCacheService } from '../core/expressions/async-condition-function-cache.service';
import { DynamicValueFunctionCacheService } from '../core/values/dynamic-value-function-cache.service';
import {
  createPropertyDerivationOrchestrator,
  PROPERTY_DERIVATION_ORCHESTRATOR,
  PropertyDerivationOrchestratorConfig,
} from '../core/property-derivation/property-derivation-orchestrator';
import { FORM_INITIALIZER } from './form-initializer.token';

/**
 * Always-on providers for any DynamicForm: state machine, registries, signal-context tokens.
 * Pure form bootstrap — no derivation, HTTP, or async machinery.
 *
 * @internal
 */
function coreProviders(): Provider[] {
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
      provide: DEFAULT_WRAPPERS,
      useFactory: (stateManager: FormStateManager) => computed(() => stateManager.activeConfig()?.defaultWrappers),
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
    { provide: DEPRECATION_WARNING_TRACKER, useFactory: createWarningTracker },
  ];
}

/**
 * Providers for the value-derivation engine: orchestrator + warning tracker.
 * Future: this group becomes opt-in via withDerivations() at a separate entry point.
 *
 * @internal
 */
function derivationProviders(): Provider[] {
  return [
    { provide: DERIVATION_WARNING_TRACKER, useFactory: createWarningTracker },
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
    // Wake the orchestrator at form bootstrap without DynamicForm needing a static
    // reference to the token. Keeps the orchestrator module reachable only from
    // this provider group, which a future PR can lift to a secondary entry point.
    { provide: FORM_INITIALIZER, useExisting: DERIVATION_ORCHESTRATOR, multi: true },
  ];
}

/**
 * Providers for the property-derivation engine (writes to property override store).
 * Future: opt-in via withPropertyDerivations() — separate from value derivations.
 *
 * @internal
 */
function propertyDerivationProviders(): Provider[] {
  return [
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
    { provide: FORM_INITIALIZER, useExisting: PROPERTY_DERIVATION_ORCHESTRATOR, multi: true },
  ];
}

/**
 * Providers for HTTP-backed condition expressions and validators.
 * Future: opt-in via withHttpExpressions() at a separate entry point.
 *
 * @internal
 */
function httpExpressionProviders(): Provider[] {
  return [{ provide: HTTP_CONDITION_CACHE, useFactory: () => new HttpConditionCache(100) }, HttpConditionFunctionCacheService];
}

/**
 * Providers for async (Promise/Observable-returning) condition expressions.
 * Future: opt-in via withAsyncExpressions() at a separate entry point.
 *
 * @internal
 */
function asyncExpressionProviders(): Provider[] {
  return [AsyncConditionFunctionCacheService];
}

/**
 * Providers for dynamic-value functions (numeric/string validator parameters resolved
 * from formValue expressions, e.g. `min: { expression: 'formValue.minAge' }`).
 * Future: opt-in via withDynamicValues() at a separate entry point.
 *
 * @internal
 */
function dynamicValueProviders(): Provider[] {
  return [DynamicValueFunctionCacheService];
}

/**
 * Providers for the logic function cache (memoizes compiled state-logic conditions
 * — `when`, `disabled`, `readonly`, `hidden` predicates). Used universally by
 * validator-factory, logic-applicator, schema-application; treated as core for now.
 *
 * @internal
 */
function logicProviders(): Provider[] {
  return [LogicFunctionCacheService];
}

/**
 * Composes all DynamicForm-level providers. Today: every feature group is included so
 * behavior matches the prior monolithic provider list. The grouped composition exists
 * so future feature flags / secondary entry points can drop groups consumers don't use
 * without re-touching every provider.
 *
 * @internal
 */
export function provideDynamicFormDI(): Provider[] {
  return [
    ...coreProviders(),
    ...logicProviders(),
    ...dynamicValueProviders(),
    ...httpExpressionProviders(),
    ...asyncExpressionProviders(),
    ...derivationProviders(),
    ...propertyDerivationProviders(),
  ];
}
