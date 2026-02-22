import { computed, Signal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { FieldDef } from '../definitions/base/field-def';
import { FormStateManager } from '../state/form-state-manager';
import { RootFormRegistryService } from '../core/registry/root-form-registry.service';
import { LogicFunctionCacheService } from '../core/expressions/logic-function-cache.service';
import { HttpConditionFunctionCacheService } from '../core/expressions/http-condition-function-cache.service';
import { AsyncConditionFunctionCacheService } from '../core/expressions/async-condition-function-cache.service';
import { DynamicValueFunctionCacheService } from '../core/values/dynamic-value-function-cache.service';
import { HttpConditionCache } from '../core/http/http-condition-cache';
import { createDerivationWarningTracker, DerivationWarningTracker } from '../core/derivation/derivation-warning-tracker';
import { createPropertyOverrideStore, PropertyOverrideStore } from '../core/property-derivation/property-override-store';
import { DerivationOrchestratorConfig } from '../core/derivation/derivation-orchestrator';
import { PropertyDerivationOrchestratorConfig } from '../core/property-derivation/property-derivation-orchestrator';
import { createDerivationLogger } from '../core/derivation/derivation-logger.service';
import { DerivationLogConfig } from '../models/logic/logic-config';
import { Logger } from './features/logger/logger.interface';
import { FormOptions } from '../models/form-config';
import { ValidationMessages } from '../models/validation-types';

/**
 * Aggregates per-form services and derived signals that depend on
 * `FormStateManager` but do not require Angular's injection context.
 *
 * Constructed once per `DynamicForm` instance via a single factory provider,
 * replacing many individual provider entries whose construction Angular would
 * otherwise resolve through separate DI lookups.
 *
 * **Not included here** (provided separately to avoid circular DI):
 * - Services injected by `FormStateManager` itself: `SchemaRegistryService`,
 *   `FunctionRegistryService`, `DEPRECATION_WARNING_TRACKER`, `CONTAINER_FIELD_PROCESSORS`
 * - Services that use `inject()`: `EventBus`, `FormStateManager`,
 *   `FieldContextRegistryService`, orchestrators
 *
 * @internal
 */
export class DynamicFormContext {
  // ─── Caches ────────────────────────────────────────────────────────────────

  readonly logicFunctionCache = new LogicFunctionCacheService();
  readonly httpConditionFunctionCache = new HttpConditionFunctionCacheService();
  readonly asyncConditionFunctionCache = new AsyncConditionFunctionCacheService();
  readonly dynamicValueFunctionCache = new DynamicValueFunctionCacheService();
  readonly httpConditionCache = new HttpConditionCache(100);

  // ─── Warning tracker ───────────────────────────────────────────────────────

  readonly derivationWarningTracker: DerivationWarningTracker = createDerivationWarningTracker();

  // ─── Property override store ───────────────────────────────────────────────

  readonly propertyOverrideStore: PropertyOverrideStore = createPropertyOverrideStore();

  // ─── Signals derived from FormStateManager ─────────────────────────────────

  readonly defaultProps: Signal<Record<string, unknown> | undefined>;
  readonly defaultValidationMessages: Signal<ValidationMessages | undefined>;
  readonly formOptions: Signal<FormOptions | undefined>;
  readonly externalData: Signal<Record<string, Signal<unknown>> | undefined>;

  // ─── Registry (plain class, no inject()) ───────────────────────────────────

  readonly rootFormRegistry: RootFormRegistryService;

  // ─── Orchestrator configs (pre-built for lazy orchestrator construction) ───

  readonly derivationOrchestratorConfig: DerivationOrchestratorConfig;
  readonly propertyDerivationOrchestratorConfig: PropertyDerivationOrchestratorConfig;

  constructor(stateManager: FormStateManager, logger: Logger, logConfig: DerivationLogConfig) {
    // Derived signals — each reads from FormStateManager's activeConfig signal.
    this.defaultProps = computed(() => stateManager.activeConfig()?.defaultProps);
    this.defaultValidationMessages = computed(() => stateManager.activeConfig()?.defaultValidationMessages);
    this.formOptions = stateManager.effectiveFormOptions;
    this.externalData = computed(() => stateManager.activeConfig()?.externalData);

    // RootFormRegistryService is a plain data holder — no inject() calls.
    this.rootFormRegistry = new RootFormRegistryService(
      stateManager.formValue as Signal<Record<string, unknown>>,
      computed(() => stateManager.form()),
    );

    // Pre-build configs so orchestrator factories receive them via deps.
    // FormStateManager is injected without type parameters, so its generic defaults
    // to Record<string, unknown>. The casts widen the type to match the config
    // interfaces which use unknown — safe because the orchestrators only read values.
    this.derivationOrchestratorConfig = {
      schemaFields: computed(() => stateManager.formSetup()?.schemaFields as FieldDef<unknown>[] | undefined),
      formValue: stateManager.formValue as Signal<Record<string, unknown>>,
      form: computed(() => stateManager.form() as unknown as FieldTree<unknown>),
      derivationLogger: computed(() => createDerivationLogger(logConfig, logger)),
      externalData: this.externalData,
    };

    this.propertyDerivationOrchestratorConfig = {
      schemaFields: computed(() => stateManager.formSetup()?.schemaFields as FieldDef<unknown>[] | undefined),
      formValue: stateManager.formValue as Signal<Record<string, unknown>>,
      store: this.propertyOverrideStore,
      externalData: this.externalData,
    };
  }
}
