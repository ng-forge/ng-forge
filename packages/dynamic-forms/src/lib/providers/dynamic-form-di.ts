import { computed, Provider, Signal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { EventBus } from '../events/event.bus';
import { ArrayItemRegistryService } from '../core/registry/array-item-registry.service';
import { FieldContextRegistryService } from '@ng-forge/dynamic-forms/internal';
import { FunctionRegistryService } from '@ng-forge/dynamic-forms/internal';
import { RootFormRegistryService } from '@ng-forge/dynamic-forms/internal';
import { SchemaRegistryService } from '../core/registry/schema-registry.service';
import { FormIdPrefixService } from '../core/registry/form-id-prefix.service';
import { FormStateManager, FORM_STATE_DEPS, FormStateDeps } from '../state/form-state-manager';
import {
  DEFAULT_PROPS,
  DEFAULT_VALIDATION_MESSAGES,
  DEFAULT_WRAPPERS,
  EXTERNAL_DATA,
  FORM_ID_PREFIX,
  FORM_OPTIONS,
} from '@ng-forge/dynamic-forms/internal';
import { DERIVATION_WARNING_TRACKER } from '../core/derivation/derivation-warning-tracker';
import { DEPRECATION_WARNING_TRACKER } from '@ng-forge/dynamic-forms/internal';
import { createWarningTracker } from '@ng-forge/dynamic-forms/internal';
import {
  DERIVATION_ORCHESTRATOR,
  createDerivationOrchestrator,
  DerivationOrchestratorConfig,
} from '../core/derivation/derivation-orchestrator';
import { createDerivationLogger } from '../core/derivation/derivation-logger.service';
import { DynamicFormLogger } from '@ng-forge/dynamic-forms/internal';
import { Logger } from '@ng-forge/dynamic-forms/internal';
import { DERIVATION_LOG_CONFIG } from './features/logger/with-logger-config';
import { DerivationLogConfig } from '@ng-forge/dynamic-forms/internal';
import { FieldDef } from '@ng-forge/dynamic-forms/internal';
import { CONTAINER_FIELD_PROCESSORS, createContainerFieldProcessors } from '../utils/container-utils/container-field-processors';
import {
  createPropertyOverrideStore,
  PROPERTY_OVERRIDE_STORE,
  PropertyOverrideStore,
} from '../core/property-derivation/property-override-store';
import { HTTP_CONDITION_CACHE, HttpConditionCache } from '@ng-forge/dynamic-forms/internal';
import { LogicFunctionCacheService } from '@ng-forge/dynamic-forms/internal';
import { HttpConditionFunctionCacheService } from '@ng-forge/dynamic-forms/internal';
import { AsyncConditionFunctionCacheService } from '@ng-forge/dynamic-forms/internal';
import { DynamicValueFunctionCacheService } from '../core/values/dynamic-value-function-cache.service';
import { PROPERTY_DERIVATION_ORCHESTRATOR } from '../core/derivation/derivation-orchestrator';
import { FORM_INITIALIZER } from './form-initializer.token';
import { ADDON_ACTION_REGISTRY, createAddonActionRegistry } from './features/addons/addon-action-registry.token';

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
      useFactory: (): FormStateDeps => ({ config: null, formOptions: null, value: null, source: null }),
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
    ArrayItemRegistryService,
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
    // Per-form DOM-id prefix: registers this instance with the root registry for
    // multi-form collision detection and publishes the resolved prefix signal.
    FormIdPrefixService,
    {
      provide: FORM_ID_PREFIX,
      useFactory: (svc: FormIdPrefixService) => svc.prefix,
      deps: [FormIdPrefixService],
    },
    { provide: DEPRECATION_WARNING_TRACKER, useFactory: createWarningTracker },
    // ADDON_ACTION_REGISTRY must live at form scope (not root) because the
    // multi-provider source `ADDON_ACTION_HANDLERS` is contributed by
    // `provideAddonActions(...)` features passed to `provideDynamicForm(...)`
    // — those entries are only visible inside the form's own injector tree.
    { provide: ADDON_ACTION_REGISTRY, useFactory: createAddonActionRegistry },
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
        propertyStore: PropertyOverrideStore,
      ) => {
        // FormStateManager is injected without type parameters, so its generic defaults
        // to Record<string, unknown>. The casts widen the type to match DerivationOrchestratorConfig
        // which uses unknown — safe because the orchestrator only reads values.
        // Both value AND property pipelines are wired on the same instance. When
        // propertyDerivationProviders() is moved behind a withPropertyDerivations()
        // feature factory, callers who omit it will get a no-op PROPERTY_OVERRIDE_STORE
        // and the orchestrator's property pipeline will stay dormant.
        const config: DerivationOrchestratorConfig = {
          schemaFields: computed(() => stateManager.formSetup()?.schemaFields as FieldDef<unknown>[] | undefined),
          formValue: stateManager.formValue as Signal<Record<string, unknown>>,
          form: computed(() => stateManager.form() as unknown as FieldTree<unknown>),
          derivationLogger: computed(() => createDerivationLogger(logConfig, logger)),
          propertyStore,
          externalData,
        };
        return createDerivationOrchestrator(config);
      },
      deps: [FormStateManager, DynamicFormLogger, DERIVATION_LOG_CONFIG, EXTERNAL_DATA, PROPERTY_OVERRIDE_STORE],
    },
    // Wake the orchestrator at form bootstrap without DynamicForm needing a static
    // reference to the token.
    { provide: FORM_INITIALIZER, useExisting: DERIVATION_ORCHESTRATOR, multi: true },
  ];
}

/**
 * Providers for the property-derivation pipeline: the override store consumed
 * by the unified `DerivationOrchestrator` plus the back-compat alias token.
 *
 * @internal
 */
function propertyDerivationProviders(): Provider[] {
  return [
    { provide: PROPERTY_OVERRIDE_STORE, useFactory: createPropertyOverrideStore },
    // PROPERTY_DERIVATION_ORCHESTRATOR is a back-compat alias for any caller
    // that still injects the legacy token. Resolves to the same instance.
    { provide: PROPERTY_DERIVATION_ORCHESTRATOR, useExisting: DERIVATION_ORCHESTRATOR },
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
    ...propertyDerivationProviders(),
    ...derivationProviders(),
  ];
}
