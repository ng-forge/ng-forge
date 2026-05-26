import { HttpClient } from '@angular/common/http';
import { computed, DestroyRef, inject, InjectionToken, Injector, Signal, untracked } from '@angular/core';
import { DEV_MODE } from '../../utils/dev-mode';
import { toObservable } from '@angular/core/rxjs-interop';
import { FieldTree } from '@angular/forms/signals';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { FieldDef } from '../../definitions/base/field-def';
import { FORM_OPTIONS } from '../../models/field-signal-context.token';
import type { FormOptions } from '../../models/form-config';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import { Logger } from '../../providers/features/logger/logger.interface';
import { DEFAULT_DEBOUNCE_MS } from '../../utils/debounce/debounce';
import { FunctionRegistryService } from '../registry';
import { applyDerivationsForTrigger } from './derivation-applicator';
import { collectAllDerivations, collectDerivations } from './derivation-collector';
import { collectPropertyDerivations } from '../property-derivation/property-derivation-collector';
import { validateNoCycles } from './cycle-detector';
import { DerivationCollection, DerivationEntry } from './derivation-types';
import { DerivationLogger } from './derivation-logger.service';
import { DERIVATION_WARNING_TRACKER } from './derivation-warning-tracker';
import { createHttpDerivationStream, HttpDerivationStreamContext } from './http-derivation-stream';
import { createAsyncDerivationStream } from './async-derivation-stream';
import { resolveExternalData } from './external-data-resolver';
import { setupDebouncedStream, setupEntryAsyncStream, setupOnChangeStream } from './pipeline-setup-utils';
import { applyPropertyDerivationsForTrigger } from '../property-derivation/property-derivation-applicator';
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
  private readonly functionRegistry = inject(FunctionRegistryService);
  private readonly httpClient = inject(HttpClient, { optional: true });

  // Pipeline-specific deps are injected lazily inside the per-pipeline setup
  // methods so the unused token's provider isn't required when only one
  // pipeline is active (matters for tests + the future
  // withPropertyDerivations() / withDerivations() split). The value-pipeline
  // apply helpers read `this.formOptions` directly; the definite-assignment
  // assertion is safe because those helpers only fire from streams wired by
  // setupValuePipeline(), which assigns the signal first.
  private formOptions!: Signal<FormOptions | undefined>;

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

    const valueEnabled = !!(config.form && config.derivationLogger);
    const propertyStore = config.propertyStore;
    const propertyEnabled = !!propertyStore;

    // Shared single-traversal collector — built only when BOTH pipelines are
    // active. When only one pipeline is active that pipeline's setup runs the
    // slice-specific collector directly. The memoization assumption: in the
    // common case where both pipeline signals are pulled in the same Angular
    // change-detection cycle, the shared computed runs once and both
    // consumers reuse the result. If only one consumer pulls within a frame,
    // the work is identical to the slice-collector path — no extra cost.
    const sharedAllDerivations =
      valueEnabled && propertyEnabled
        ? computed(() => {
            const fields = config.schemaFields();
            if (!fields || fields.length === 0) return null;
            return collectAllDerivations(fields);
          })
        : null;

    this.derivationCollection = valueEnabled
      ? this.setupValuePipeline(sharedAllDerivations)
      : computed<DerivationCollection | null>(() => null);

    this.propertyDerivationCollection = propertyStore
      ? this.setupPropertyPipeline(propertyStore, sharedAllDerivations)
      : computed<PropertyDerivationCollection | null>(() => null);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Value pipeline — setup
  // ─────────────────────────────────────────────────────────────────────────────

  private setupValuePipeline(
    sharedAllDerivations: Signal<{ value: DerivationCollection; property: PropertyDerivationCollection } | null> | null,
  ): Signal<DerivationCollection | null> {
    this.formOptions = inject(FORM_OPTIONS);

    const collection = computed<DerivationCollection | null>(() => {
      const fields = this.config.schemaFields();

      if (!fields || fields.length === 0) {
        return null;
      }

      // When both pipelines run, reuse the shared traversal; otherwise this
      // pipeline owns the walk (no property tracker needed).
      const collected = sharedAllDerivations ? (sharedAllDerivations()?.value ?? null) : collectDerivations(fields);

      if (!collected || collected.entries.length === 0) {
        return null;
      }

      validateNoCycles(collected, this.logger);
      if (DEV_MODE) {
        warnAboutWildcardDependencies(this.logger, collected.entries, fields.length);
        warnAboutMisconfiguredReEngagement(this.logger, collected.entries);
      }

      return collected;
    });

    setupOnChangeStream<DerivationCollection>({
      injector: this.injector,
      destroyRef: this.destroyRef,
      logger: this.logger,
      errorLabel: 'Derivation onChange stream error',
      collectionSignal: collection,
      formValueSignal: this.config.formValue,
      // The form accessor signal must also wake the stream so that config swaps
      // (which produce a new FieldTree) trigger a re-application of derivations
      // against the freshly-built form.
      additionalAwakeners: [this.config.form!],
      applyOnChange: (current, changedFields) => {
        this.applyOnChangeDerivations(
          current,
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
      collectionSignal: collection,
      formValueSignal: this.config.formValue,
      applyDebouncedForPeriod: (debounceMs, current, changedFields) => {
        const formAccessor = untracked(() => this.config.form!());
        if (!formAccessor) return;
        this.applyDebouncedEntriesForPeriod(debounceMs, current, formAccessor, changedFields);
      },
    });

    this.setupValueHttpStreams(collection);
    this.setupValueAsyncFunctionStreams(collection);

    return collection;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Property pipeline — setup
  // ─────────────────────────────────────────────────────────────────────────────

  private setupPropertyPipeline(
    propertyStore: PropertyOverrideStore,
    sharedAllDerivations: Signal<{ value: DerivationCollection; property: PropertyDerivationCollection } | null> | null,
  ): Signal<PropertyDerivationCollection | null> {
    const collection = computed<PropertyDerivationCollection | null>(() => {
      const fields = this.config.schemaFields();

      if (!fields || fields.length === 0) {
        return null;
      }

      // When both pipelines run, reuse the shared traversal; otherwise this
      // pipeline owns the walk.
      const collected = sharedAllDerivations ? (sharedAllDerivations()?.property ?? null) : collectPropertyDerivations(fields);

      if (!collected || collected.entries.length === 0) {
        return null;
      }

      return collected;
    });

    // Side effect: clear store + register fields whenever the collection changes.
    // schemaFields is in the dep array so the field count is always in sync.
    explicitEffect([collection, this.config.schemaFields], ([current, fields]) => {
      propertyStore.clear();

      if (!current) return;

      for (const entry of current.entries) {
        propertyStore.registerField(entry.fieldKey);
      }

      if (DEV_MODE) {
        warnAboutWildcardPropertyDependencies(this.logger, current.entries, fields?.length ?? 0);
      }
    });

    setupOnChangeStream<PropertyDerivationCollection>({
      injector: this.injector,
      destroyRef: this.destroyRef,
      logger: this.logger,
      errorLabel: 'Property derivation onChange stream error',
      collectionSignal: collection,
      formValueSignal: this.config.formValue,
      // Property pipeline's onChange historically ignored the changed-fields set
      // (it always re-runs all 'onChange' entries). The helper computes one anyway;
      // we drop it here to preserve the original behavior.
      applyOnChange: (current) => this.applyOnChangePropertyDerivations(current, propertyStore),
    });

    setupDebouncedStream<PropertyDerivationCollection>({
      injector: this.injector,
      destroyRef: this.destroyRef,
      logger: this.logger,
      errorLabel: 'Property derivation debounced stream error',
      collectionSignal: collection,
      formValueSignal: this.config.formValue,
      applyDebouncedForPeriod: (debounceMs, current, changedFields) => {
        this.applyDebouncedPropertyEntriesForPeriod(debounceMs, current, propertyStore, changedFields);
      },
    });

    this.setupPropertyHttpStreams(collection, propertyStore);
    this.setupPropertyAsyncFunctionStreams(collection, propertyStore);

    return collection;
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

  private setupValueHttpStreams(collectionSignal: Signal<DerivationCollection | null>): void {
    const formValue$ = toObservable(this.config.formValue, { injector: this.injector });

    setupEntryAsyncStream<DerivationCollection, DerivationEntry>({
      injector: this.injector,
      destroyRef: this.destroyRef,
      logger: this.logger,
      errorLabel: 'HTTP Derivation: outer stream error',
      collectionSignal,
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

  private setupValueAsyncFunctionStreams(collectionSignal: Signal<DerivationCollection | null>): void {
    const formValue$ = toObservable(this.config.formValue, { injector: this.injector });

    setupEntryAsyncStream<DerivationCollection, DerivationEntry>({
      injector: this.injector,
      destroyRef: this.destroyRef,
      logger: this.logger,
      errorLabel: 'Async Derivation: outer stream error',
      collectionSignal,
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

  private setupPropertyHttpStreams(collectionSignal: Signal<PropertyDerivationCollection | null>, store: PropertyOverrideStore): void {
    const formValue$ = toObservable(this.config.formValue, { injector: this.injector });

    setupEntryAsyncStream<PropertyDerivationCollection, PropertyDerivationEntry>({
      injector: this.injector,
      destroyRef: this.destroyRef,
      logger: this.logger,
      errorLabel: 'HTTP Property Derivation: outer stream error',
      collectionSignal,
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

  private setupPropertyAsyncFunctionStreams(
    collectionSignal: Signal<PropertyDerivationCollection | null>,
    store: PropertyOverrideStore,
  ): void {
    const formValue$ = toObservable(this.config.formValue, { injector: this.injector });

    setupEntryAsyncStream<PropertyDerivationCollection, PropertyDerivationEntry>({
      injector: this.injector,
      destroyRef: this.destroyRef,
      logger: this.logger,
      errorLabel: 'Async Property Derivation: outer stream error',
      collectionSignal,
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
 * Back-compat injection token for the (formerly separate) property-derivation
 * orchestrator. The property pipeline is now wired by the unified
 * {@link DerivationOrchestrator}; the DI binding for this token uses
 * `useExisting: DERIVATION_ORCHESTRATOR`, so any consumer still calling
 * `inject(PROPERTY_DERIVATION_ORCHESTRATOR)` resolves to the same instance.
 *
 * New code should `inject(DERIVATION_ORCHESTRATOR)` directly.
 *
 * @deprecated Use {@link DERIVATION_ORCHESTRATOR}.
 */
export const PROPERTY_DERIVATION_ORCHESTRATOR = new InjectionToken<DerivationOrchestrator>('PROPERTY_DERIVATION_ORCHESTRATOR');

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
