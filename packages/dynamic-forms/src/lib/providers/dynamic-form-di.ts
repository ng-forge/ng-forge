import { computed, Provider, Signal } from '@angular/core';
import { EventBus } from '@ng-forge/dynamic-forms/internal';
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
import { createDerivationRenderGate, DERIVATION_RENDER_GATE } from '../core/derivation/derivation-render-gate';
import { CONTAINER_FIELD_PROCESSORS, createContainerFieldProcessors } from '../utils/container-utils/container-field-processors';
import { createPropertyOverrideStore, PROPERTY_OVERRIDE_STORE } from '../core/property-derivation/property-override-store';
import { HTTP_CONDITION_CACHE, HttpConditionCache } from '@ng-forge/dynamic-forms/internal';
import { LogicFunctionCacheService } from '@ng-forge/dynamic-forms/internal';
import { HttpConditionFunctionCacheService } from '@ng-forge/dynamic-forms/internal';
import { AsyncConditionFunctionCacheService } from '@ng-forge/dynamic-forms/internal';
import { DynamicValueFunctionCacheService } from '@ng-forge/dynamic-forms/internal';
import { ADDON_ACTION_REGISTRY, createAddonActionRegistry } from '@ng-forge/dynamic-forms/internal';

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
 * Providers for the value-derivation engine: warning tracker + a lazy bootstrap
 * hook. The heavy orchestrator module (collectors, applicators, cycle detection,
 * and the value/property/HTTP/async stream factories) is NOT statically imported
 * here — it is dynamically imported the first time a config declares a derivation,
 * so forms without derivations never pay for the engine.
 *
 * @internal
 */
function derivationProviders(): Provider[] {
  return [
    { provide: DERIVATION_WARNING_TRACKER, useFactory: createWarningTracker },
    // The render gate lazy-loads + wires the orchestrator on the first config
    // that declares a derivation, and holds `shouldRender` closed until it does
    // (so derivation-bearing fields render already-derived, no flash). The
    // orchestrator is component-scoped (it can't be `providedIn: 'root'`), so the
    // gate loads it with a plain dynamic `import()` + `runInInjectionContext`,
    // not `injectAsync`. `DynamicForm` injects the gate, which wakes the load.
    { provide: DERIVATION_RENDER_GATE, useFactory: createDerivationRenderGate },
  ];
}

/**
 * Provider for the property-derivation override store. The store is consumed
 * eagerly by field rendering (to apply derived hidden/disabled/readonly state),
 * so it stays eager even though the orchestrator that writes into it is lazy.
 *
 * @internal
 */
function propertyDerivationProviders(): Provider[] {
  return [{ provide: PROPERTY_OVERRIDE_STORE, useFactory: createPropertyOverrideStore }];
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
