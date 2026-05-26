import { HttpClient } from '@angular/common/http';
import { computed, DestroyRef, inject, InjectionToken, Injector, Signal, untracked } from '@angular/core';
import { DEV_MODE } from '../../utils/dev-mode';
import { toObservable } from '@angular/core/rxjs-interop';
import { FieldTree } from '@angular/forms/signals';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { FieldDef } from '../../definitions/base/field-def';
import { FORM_OPTIONS } from '../../models/field-signal-context.token';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import { Logger } from '../../providers/features/logger/logger.interface';
import { DEFAULT_DEBOUNCE_MS } from '../../utils/debounce/debounce';
import { DEPRECATION_WARNING_TRACKER } from '../../utils/deprecation-warning-tracker';
import { FunctionRegistryService } from '../registry';
import { applyDerivationsForTrigger } from './derivation-applicator';
import { collectDerivations } from './derivation-collector';
import { validateNoCycles } from './cycle-detector';
import { DerivationCollection, DerivationEntry } from './derivation-types';
import { DerivationLogger } from './derivation-logger.service';
import { DERIVATION_WARNING_TRACKER } from './derivation-warning-tracker';
import { createHttpDerivationStream, HttpDerivationStreamContext } from './http-derivation-stream';
import { createAsyncDerivationStream } from './async-derivation-stream';
import { resolveExternalData } from './external-data-resolver';
import { setupDebouncedStream, setupEntryAsyncStream, setupOnChangeStream } from './pipeline-setup-utils';
import { applyPropertyDerivationsForTrigger } from '../property-derivation/property-derivation-applicator';
import { collectPropertyDerivations } from '../property-derivation/property-derivation-collector';
import { PropertyDerivationCollection, PropertyDerivationEntry } from '../property-derivation/property-derivation-types';
import { PropertyOverrideStore } from '../property-derivation/property-override-store';
import { createHttpPropertyDerivationStream } from '../property-derivation/http-property-derivation-stream';
import { createAsyncPropertyDerivationStream } from '../property-derivation/async-property-derivation-stream';

/**
 * Configuration for creating a DerivationOrchestrator. Both pipelines are
 * opt-in via their respective config fields:
 *
 * - **Value pipeline** (form-value derivations): activated when both `form`
 *   and `derivationLogger` are provided. Wires onChange/debounced/HTTP/async
 *   streams that write derived values into the Angular Signal-Form tree via
 *   `form()`.
 * - **Property pipeline** (hidden/disabled/readonly derivations): activated
 *   when `propertyStore` is provided. Wires the same four stream variants
 *   that write derived property overrides into the store.
 *
 * Both pipelines share the same `schemaFields` and `formValue` signals — the
 * collectors walk the same field tree but extract disjoint sets of entries
 * (value entries have no `targetProperty`; property entries have one).
 *
 * @public
 */
export interface DerivationOrchestratorConfig {
  /** Signal containing the flattened schema fields */
  schemaFields: Signal<FieldDef<unknown>[] | undefined>;

  /** Signal containing the current form value */
  formValue: Signal<Record<string, unknown>>;

  /**
   * Signal containing the form accessor. **Required for the value pipeline.**
   * Omit (together with `derivationLogger`) to skip value-derivation setup.
   */
  form?: Signal<FieldTree<unknown>>;

  /**
   * Signal containing the derivation logger. **Required for the value
   * pipeline.** Omit (together with `form`) to skip value-derivation setup.
   */
  derivationLogger?: Signal<DerivationLogger>;

  /**
   * Property override store to write derived hidden/disabled/readonly states
   * into. **Required for the property pipeline.** Omit to skip
   * property-derivation setup.
   */
  propertyStore?: PropertyOverrideStore;

  /** Signal containing external data signals for expression evaluation */
  externalData?: Signal<Record<string, Signal<unknown>> | undefined>;
}

/**
 * Orchestrates derivation processing for a dynamic form — both **value
 * derivations** (writes into the form's FieldTree) and **property derivations**
 * (writes into a property override store). Each pipeline opts in via the
 * corresponding fields of {@link DerivationOrchestratorConfig}; an orchestrator
 * instance can run one, both, or (degenerately) neither.
 *
 * The streaming plumbing is shared between pipelines via
 * `pipeline-setup-utils` — both wire onChange + debounced + HTTP-entry-keyed +
 * async-function-entry-keyed streams via the same helpers, differing only in
 * collection, apply callback, and per-entry stream constructor.
 *
 * @public
 */
export class DerivationOrchestrator {
  private readonly config: DerivationOrchestratorConfig;
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly logger = inject(DynamicFormLogger);
  private readonly warningTracker = inject(DERIVATION_WARNING_TRACKER);
  private readonly deprecationTracker = inject(DEPRECATION_WARNING_TRACKER);
  private readonly functionRegistry = inject(FunctionRegistryService);
  private readonly formOptions = inject(FORM_OPTIONS);
  private readonly httpClient = inject(HttpClient, { optional: true });

  /**
   * Computed signal containing the collected and validated value derivations.
   * Returns null when no value derivations are defined OR the value pipeline
   * was not activated (no `form`/`derivationLogger` in config).
   */
  readonly derivationCollection: Signal<DerivationCollection | null>;

  /**
   * Computed signal containing the collected property derivations. Returns
   * null when no property derivations are defined OR the property pipeline
   * was not activated (no `propertyStore` in config).
   */
  readonly propertyDerivationCollection: Signal<PropertyDerivationCollection | null>;

  constructor(config: DerivationOrchestratorConfig) {
    this.config = config;
    const valuePipelineEnabled = !!(config.form && config.derivationLogger);
    const propertyPipelineEnabled = !!config.propertyStore;

    // Value pipeline: collection + 4 stream variants
    if (valuePipelineEnabled) {
      this.derivationCollection = computed<DerivationCollection | null>(() => {
        const fields = config.schemaFields();

        if (!fields || fields.length === 0) {
          return null;
        }

        const collection = collectDerivations(fields);

        if (collection.entries.length === 0) {
          return null;
        }

        validateNoCycles(collection, this.logger);
        if (DEV_MODE) {
          warnAboutWildcardDependencies(this.logger, collection.entries, fields.length);
          warnAboutMisconfiguredReEngagement(this.logger, collection.entries);
        }

        return collection;
      });

      setupOnChangeStream<DerivationCollection>({
        injector: this.injector,
        destroyRef: this.destroyRef,
        logger: this.logger,
        errorLabel: 'Derivation onChange stream error',
        collectionSignal: this.derivationCollection,
        formValueSignal: this.config.formValue,
        // The form accessor signal must also wake the stream so that config swaps
        // (which produce a new FieldTree) trigger a re-application of derivations
        // against the freshly-built form.
        additionalAwakeners: [this.config.form!],
        applyOnChange: (collection, changedFields) => {
          this.applyOnChangeDerivations(
            collection,
            untracked(() => this.config.form!()),
            changedFields,
          );
        },
      });

      setupDebouncedStream<DerivationCollection>({
        injector: this.injector,
        destroyRef: this.destroyRef,
        logger: this.logger,
        errorLabel: 'Derivation debounced stream error',
        collectionSignal: this.derivationCollection,
        formValueSignal: this.config.formValue,
        applyDebouncedForPeriod: (debounceMs, collection, changedFields) => {
          const formAccessor = untracked(() => this.config.form!());
          if (!formAccessor) return;
          this.applyDebouncedEntriesForPeriod(debounceMs, collection, formAccessor, changedFields);
        },
      });

      this.setupValueHttpStreams();
      this.setupValueAsyncFunctionStreams();
    } else {
      this.derivationCollection = computed<DerivationCollection | null>(() => null);
    }

    // Property pipeline: collection + clear/register effect + 4 stream variants
    if (propertyPipelineEnabled) {
      const propertyStore = config.propertyStore!;

      this.propertyDerivationCollection = computed<PropertyDerivationCollection | null>(() => {
        const fields = config.schemaFields();

        if (!fields || fields.length === 0) {
          return null;
        }

        const collection = collectPropertyDerivations(fields, this.logger, this.deprecationTracker);

        if (collection.entries.length === 0) {
          return null;
        }

        return collection;
      });

      // Side effect: clear store + register fields whenever the collection changes.
      // schemaFields is in the dep array so the field count is always in sync.
      explicitEffect([this.propertyDerivationCollection, this.config.schemaFields], ([collection, fields]) => {
        propertyStore.clear();

        if (!collection) return;

        for (const entry of collection.entries) {
          propertyStore.registerField(entry.fieldKey);
        }

        if (DEV_MODE) {
          warnAboutWildcardPropertyDependencies(this.logger, collection.entries, fields?.length ?? 0);
        }
      });

      setupOnChangeStream<PropertyDerivationCollection>({
        injector: this.injector,
        destroyRef: this.destroyRef,
        logger: this.logger,
        errorLabel: 'Property derivation onChange stream error',
        collectionSignal: this.propertyDerivationCollection,
        formValueSignal: this.config.formValue,
        // Property pipeline's onChange historically ignored the changed-fields set
        // (it always re-runs all 'onChange' entries). The helper computes one anyway;
        // we drop it here to preserve the original behavior.
        applyOnChange: (collection) => this.applyOnChangePropertyDerivations(collection, propertyStore),
      });

      setupDebouncedStream<PropertyDerivationCollection>({
        injector: this.injector,
        destroyRef: this.destroyRef,
        logger: this.logger,
        errorLabel: 'Property derivation debounced stream error',
        collectionSignal: this.propertyDerivationCollection,
        formValueSignal: this.config.formValue,
        applyDebouncedForPeriod: (debounceMs, collection, changedFields) => {
          this.applyDebouncedPropertyEntriesForPeriod(debounceMs, collection, propertyStore, changedFields);
        },
      });

      this.setupPropertyHttpStreams(propertyStore);
      this.setupPropertyAsyncFunctionStreams(propertyStore);
    } else {
      this.propertyDerivationCollection = computed<PropertyDerivationCollection | null>(() => null);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Value pipeline — apply helpers
  // ─────────────────────────────────────────────────────────────────────────────

  private applyOnChangeDerivations(collection: DerivationCollection, formAccessor: FieldTree<unknown>, changedFields?: Set<string>): void {
    const applicatorContext = {
      formValue: this.config.formValue,
      rootForm: formAccessor,
      derivationFunctions: this.functionRegistry.getDerivationFunctions(),
      customFunctions: this.functionRegistry.getCustomFunctions(),
      externalData: resolveExternalData(this.config.externalData),
      logger: this.logger,
      warningTracker: this.warningTracker,
      derivationLogger: untracked(() => this.config.derivationLogger!()),
      maxIterations: untracked(() => this.formOptions()?.maxDerivationIterations),
    };

    const result = applyDerivationsForTrigger(collection, 'onChange', applicatorContext, changedFields);

    if (result.maxIterationsReached) {
      this.logger.warn(
        `Derivation processing reached max iterations. ` +
          `This may indicate a loop in derivation logic that wasn't caught at build time. ` +
          `Applied: ${result.appliedCount}, Skipped: ${result.skippedCount}, Errors: ${result.errorCount}`,
      );
    }
  }

  private applyDebouncedEntriesForPeriod(
    debounceMs: number,
    collection: DerivationCollection,
    formAccessor: FieldTree<unknown>,
    changedFields?: Set<string>,
  ): void {
    const debouncedEntries = collection.entries.filter(
      (entry) => entry.trigger === 'debounced' && (entry.debounceMs ?? DEFAULT_DEBOUNCE_MS) === debounceMs,
    );

    if (debouncedEntries.length === 0) {
      return;
    }

    const filteredCollection: DerivationCollection = {
      entries: debouncedEntries,
    };

    const applicatorContext = {
      formValue: this.config.formValue,
      rootForm: formAccessor,
      derivationFunctions: this.functionRegistry.getDerivationFunctions(),
      customFunctions: this.functionRegistry.getCustomFunctions(),
      externalData: resolveExternalData(this.config.externalData),
      logger: this.logger,
      warningTracker: this.warningTracker,
      derivationLogger: untracked(() => this.config.derivationLogger!()),
      maxIterations: untracked(() => this.formOptions()?.maxDerivationIterations),
    };

    const result = applyDerivationsForTrigger(filteredCollection, 'debounced', applicatorContext, changedFields);

    if (result.maxIterationsReached) {
      this.logger.warn(
        `Debounced derivation processing reached max iterations (${debounceMs}ms). ` +
          `Applied: ${result.appliedCount}, Skipped: ${result.skippedCount}, Errors: ${result.errorCount}`,
      );
    }
  }

  private setupValueHttpStreams(): void {
    const formValue$ = toObservable(this.config.formValue, { injector: this.injector });

    setupEntryAsyncStream<DerivationCollection, DerivationEntry>({
      injector: this.injector,
      destroyRef: this.destroyRef,
      logger: this.logger,
      errorLabel: 'HTTP Derivation: outer stream error',
      collectionSignal: this.derivationCollection,
      selectEntries: (collection) => collection?.entries.filter((entry) => entry.http) ?? [],
      entrySignature: valueHttpEntrySignature,
      createStream: (entry) => {
        if (!this.httpClient) {
          this.logger.error(
            'HTTP Derivation: HttpClient is not available. Ensure provideHttpClient() is included in your application providers.',
          );
          return null;
        }
        const context: HttpDerivationStreamContext = {
          formValue: this.config.formValue,
          form: this.config.form!,
          httpClient: this.httpClient,
          logger: this.logger,
          derivationLogger: this.config.derivationLogger!,
          customFunctions: () => this.functionRegistry.getCustomFunctions(),
          externalData: () => resolveExternalData(this.config.externalData),
          warningTracker: this.warningTracker,
        };
        return createHttpDerivationStream(entry, formValue$, context);
      },
    });
  }

  private setupValueAsyncFunctionStreams(): void {
    const formValue$ = toObservable(this.config.formValue, { injector: this.injector });

    setupEntryAsyncStream<DerivationCollection, DerivationEntry>({
      injector: this.injector,
      destroyRef: this.destroyRef,
      logger: this.logger,
      errorLabel: 'Async Derivation: outer stream error',
      collectionSignal: this.derivationCollection,
      selectEntries: (collection) => collection?.entries.filter((entry) => entry.asyncFunctionName || entry.asyncFn) ?? [],
      entrySignature: valueAsyncEntrySignature,
      createStream: (entry) =>
        createAsyncDerivationStream(entry, formValue$, {
          formValue: this.config.formValue,
          form: this.config.form!,
          logger: this.logger,
          derivationLogger: this.config.derivationLogger!,
          customFunctions: () => this.functionRegistry.getCustomFunctions(),
          asyncDerivationFunctions: () => this.functionRegistry.getAsyncDerivationFunctions(),
          externalData: () => resolveExternalData(this.config.externalData),
          warningTracker: this.warningTracker,
        }),
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Property pipeline — apply helpers
  // ─────────────────────────────────────────────────────────────────────────────

  private applyOnChangePropertyDerivations(collection: PropertyDerivationCollection, store: PropertyOverrideStore): void {
    const applicatorContext = {
      formValue: this.config.formValue,
      store,
      derivationFunctions: this.functionRegistry.getDerivationFunctions(),
      customFunctions: this.functionRegistry.getCustomFunctions(),
      externalData: resolveExternalData(this.config.externalData),
      logger: this.logger,
      warningTracker: this.warningTracker,
    };

    applyPropertyDerivationsForTrigger(collection, 'onChange', applicatorContext);
  }

  private applyDebouncedPropertyEntriesForPeriod(
    debounceMs: number,
    collection: PropertyDerivationCollection,
    store: PropertyOverrideStore,
    changedFields?: Set<string>,
  ): void {
    const debouncedEntries = collection.entries.filter(
      (entry) => entry.trigger === 'debounced' && (entry.debounceMs ?? DEFAULT_DEBOUNCE_MS) === debounceMs,
    );

    if (debouncedEntries.length === 0) return;

    const filteredCollection: PropertyDerivationCollection = { entries: debouncedEntries };

    const applicatorContext = {
      formValue: this.config.formValue,
      store,
      derivationFunctions: this.functionRegistry.getDerivationFunctions(),
      customFunctions: this.functionRegistry.getCustomFunctions(),
      externalData: resolveExternalData(this.config.externalData),
      logger: this.logger,
      warningTracker: this.warningTracker,
    };

    applyPropertyDerivationsForTrigger(filteredCollection, 'debounced', applicatorContext, changedFields);
  }

  private setupPropertyHttpStreams(store: PropertyOverrideStore): void {
    const formValue$ = toObservable(this.config.formValue, { injector: this.injector });

    setupEntryAsyncStream<PropertyDerivationCollection, PropertyDerivationEntry>({
      injector: this.injector,
      destroyRef: this.destroyRef,
      logger: this.logger,
      errorLabel: 'HTTP Property Derivation: outer stream error',
      collectionSignal: this.propertyDerivationCollection,
      selectEntries: (collection) => collection?.entries.filter((entry) => entry.http) ?? [],
      entrySignature: propertyHttpEntrySignature,
      createStream: (entry) => {
        if (!this.httpClient) {
          this.logger.error(
            'HTTP Property Derivation: HttpClient is not available. Ensure provideHttpClient() is included in your application providers.',
          );
          return null;
        }
        return createHttpPropertyDerivationStream(entry, formValue$, {
          formValue: this.config.formValue,
          store,
          httpClient: this.httpClient,
          logger: this.logger,
          customFunctions: () => this.functionRegistry.getCustomFunctions(),
          externalData: () => resolveExternalData(this.config.externalData),
        });
      },
    });
  }

  private setupPropertyAsyncFunctionStreams(store: PropertyOverrideStore): void {
    const formValue$ = toObservable(this.config.formValue, { injector: this.injector });

    setupEntryAsyncStream<PropertyDerivationCollection, PropertyDerivationEntry>({
      injector: this.injector,
      destroyRef: this.destroyRef,
      logger: this.logger,
      errorLabel: 'Async Property Derivation: outer stream error',
      collectionSignal: this.propertyDerivationCollection,
      selectEntries: (collection) => collection?.entries.filter((entry) => entry.asyncFunctionName || entry.asyncFn) ?? [],
      entrySignature: propertyAsyncEntrySignature,
      createStream: (entry) =>
        createAsyncPropertyDerivationStream(entry, formValue$, {
          formValue: this.config.formValue,
          store,
          logger: this.logger,
          customFunctions: () => this.functionRegistry.getCustomFunctions(),
          asyncDerivationFunctions: () => this.functionRegistry.getAsyncDerivationFunctions(),
          externalData: () => resolveExternalData(this.config.externalData),
        }),
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Entry signatures — value pipeline
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Identity signature for an HTTP value-derivation entry. Includes every field
 * that drives the inner stream's behavior — changing any of them must tear
 * down and rebuild the stream. Stable across topological reorderings because
 * the consumer ({@link entrySetsEqual}) compares as a multiset.
 */
function valueHttpEntrySignature(entry: DerivationEntry): string {
  const config = {
    http: entry.http,
    responseExpression: entry.responseExpression,
    dependsOn: entry.dependsOn,
    debounceMs: entry.debounceMs,
    trigger: entry.trigger,
    condition: entry.condition,
    stopOnUserOverride: entry.stopOnUserOverride,
    reEngageOnDependencyChange: entry.reEngageOnDependencyChange,
  };
  return `${entry.fieldKey}:${JSON.stringify(config)}`;
}

function valueAsyncEntrySignature(entry: DerivationEntry): string {
  // For inline `asyncFn` entries we tag the signature with the field path (the
  // real identity, since derivations are self-targeting) rather than the array
  // index. Index-based tagging churned identities whenever topologicalSort
  // reordered entries, causing unnecessary teardown + re-subscribe.
  const config = {
    asyncFunctionName: entry.asyncFunctionName,
    asyncFnId: entry.asyncFn ? `inline:${entry.fieldKey}` : undefined,
    dependsOn: entry.dependsOn,
    debounceMs: entry.debounceMs,
    trigger: entry.trigger,
    condition: entry.condition,
    stopOnUserOverride: entry.stopOnUserOverride,
    reEngageOnDependencyChange: entry.reEngageOnDependencyChange,
  };
  return `${entry.fieldKey}:${JSON.stringify(config)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Entry signatures — property pipeline
// ─────────────────────────────────────────────────────────────────────────────

function propertyHttpEntrySignature(entry: PropertyDerivationEntry): string {
  const config = {
    http: entry.http,
    responseExpression: entry.responseExpression,
    dependsOn: entry.dependsOn,
    debounceMs: entry.debounceMs,
    trigger: entry.trigger,
    condition: entry.condition,
  };
  return `${entry.fieldKey}.${entry.targetProperty}:${JSON.stringify(config)}`;
}

function propertyAsyncEntrySignature(entry: PropertyDerivationEntry): string {
  const config = {
    asyncFunctionName: entry.asyncFunctionName,
    asyncFnId: entry.asyncFn ? `inline:${entry.fieldKey}.${entry.targetProperty}` : undefined,
    dependsOn: entry.dependsOn,
    debounceMs: entry.debounceMs,
    trigger: entry.trigger,
    condition: entry.condition,
  };
  return `${entry.fieldKey}.${entry.targetProperty}:${JSON.stringify(config)}`;
}

/**
 * Creates a DerivationOrchestrator for a dynamic form.
 * Must be called within an injection context.
 *
 * @param config - Form-specific signals configuration
 * @returns The created DerivationOrchestrator
 *
 * @public
 */
export function createDerivationOrchestrator(config: DerivationOrchestratorConfig): DerivationOrchestrator {
  return new DerivationOrchestrator(config);
}

/**
 * Injection token for the DerivationOrchestrator.
 *
 * @public
 */
export const DERIVATION_ORCHESTRATOR = new InjectionToken<DerivationOrchestrator>('DERIVATION_ORCHESTRATOR');

/**
 * Injects the DerivationOrchestrator from the current injection context.
 *
 * @returns The DerivationOrchestrator instance
 * @throws Error if called outside of an injection context or if orchestrator is not provided
 *
 * @public
 */
export function injectDerivationOrchestrator(): DerivationOrchestrator {
  return inject(DERIVATION_ORCHESTRATOR);
}

// ─────────────────────────────────────────────────────────────────────────────
// Dev-mode diagnostics (tree-shaken in prod via DEV_MODE gate at call site)
// ─────────────────────────────────────────────────────────────────────────────

function warnAboutWildcardDependencies(logger: Logger, entries: DerivationEntry[], fieldCount: number): void {
  const wildcardEntries = entries.filter((entry) => entry.dependsOn.includes('*'));
  if (wildcardEntries.length === 0) return;

  // HTTP and async entries require explicit dependsOn (validated at collection time)
  const implicitWildcards = wildcardEntries.filter(
    (entry) =>
      !entry.http &&
      !entry.asyncFunctionName &&
      !entry.asyncFn &&
      (entry.functionName || entry.fn) &&
      (!entry.originalConfig?.dependsOn || entry.originalConfig.dependsOn.length === 0),
  );

  if (implicitWildcards.length > 0) {
    const derivationDescs = implicitWildcards.map((e) => `${e.fieldKey} (${e.functionName ?? '<inline fn>'})`);
    logger.warn(
      'Derivation: custom functions without explicit dependsOn detected. ' +
        `These run on EVERY form change, which may impact performance (form has ${fieldCount} fields). ` +
        'Consider specifying explicit dependsOn arrays for better performance.',
      derivationDescs,
    );
  }
}

function warnAboutMisconfiguredReEngagement(logger: Logger, entries: DerivationEntry[]): void {
  const misconfigured = entries.filter((entry) => entry.reEngageOnDependencyChange && !entry.stopOnUserOverride);
  if (misconfigured.length === 0) return;

  const fieldKeys = misconfigured.map((e) => e.debugName ?? e.fieldKey);
  logger.warn(
    'Derivation: reEngageOnDependencyChange without stopOnUserOverride detected. ' +
      'reEngageOnDependencyChange only takes effect when stopOnUserOverride is true. ' +
      'Either add stopOnUserOverride: true or remove reEngageOnDependencyChange.',
    fieldKeys,
  );
}

function warnAboutWildcardPropertyDependencies(logger: Logger, entries: PropertyDerivationEntry[], fieldCount: number): void {
  const implicitWildcards = entries.filter(
    (entry) =>
      entry.dependsOn.includes('*') &&
      (entry.functionName || entry.fn) &&
      (!entry.originalConfig?.dependsOn || entry.originalConfig.dependsOn.length === 0),
  );

  if (implicitWildcards.length > 0) {
    const derivationDescs = implicitWildcards.map((e) => `${e.fieldKey}.${e.targetProperty} (${e.functionName ?? '<inline fn>'})`);
    logger.warn(
      'PropertyDerivation: custom functions without explicit dependsOn detected. ' +
        `These run on EVERY form change, which may impact performance (form has ${fieldCount} fields). ` +
        'Consider specifying explicit dependsOn arrays for better performance.',
      derivationDescs,
    );
  }
}
