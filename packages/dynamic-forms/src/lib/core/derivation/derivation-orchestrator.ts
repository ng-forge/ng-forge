import { HttpClient } from '@angular/common/http';
import { computed, DestroyRef, inject, InjectionToken, Injector, Signal, untracked } from '@angular/core';
import { DEV_MODE } from '../../utils/dev-mode';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FieldTree } from '@angular/forms/signals';
import { FieldDef } from '../../definitions/base/field-def';
import { FORM_OPTIONS } from '../../models/field-signal-context.token';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import { Logger } from '../../providers/features/logger/logger.interface';
import { DEFAULT_DEBOUNCE_MS } from '../../utils/debounce/debounce';
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

/**
 * Minimal configuration for creating a DerivationOrchestrator.
 * Only includes form-specific signals that cannot be injected.
 *
 * @internal
 */
export interface DerivationOrchestratorConfig {
  /** Signal containing the flattened schema fields */
  schemaFields: Signal<FieldDef<unknown>[] | undefined>;

  /** Signal containing the current form value */
  formValue: Signal<Record<string, unknown>>;

  /** Signal containing the form accessor */
  form: Signal<FieldTree<unknown>>;

  /** Signal containing the derivation logger */
  derivationLogger: Signal<DerivationLogger>;

  /** Signal containing external data signals for expression evaluation */
  externalData?: Signal<Record<string, Signal<unknown>> | undefined>;
}

/**
 * Orchestrates derivation processing for a dynamic form.
 *
 * Uses RxJS streams for reactive derivation processing:
 * - `exhaustMap` prevents re-entry during onChange derivation application
 * - `pairwise` tracks value changes without mutable state
 * - `takeUntilDestroyed` handles automatic cleanup
 *
 * Injects common services directly, requiring only form-specific signals in config.
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
  private readonly formOptions = inject(FORM_OPTIONS);
  private readonly httpClient = inject(HttpClient, { optional: true });

  /**
   * Computed signal containing the collected and validated derivations.
   * Returns null if no derivations are defined.
   */
  readonly derivationCollection: Signal<DerivationCollection | null>;

  constructor(config: DerivationOrchestratorConfig) {
    this.config = config;

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
      additionalAwakeners: [this.config.form],
      applyOnChange: (collection, changedFields) => {
        this.applyOnChangeDerivations(
          collection,
          untracked(() => this.config.form()),
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
        const formAccessor = untracked(() => this.config.form());
        if (!formAccessor) return;
        this.applyDebouncedEntriesForPeriod(debounceMs, collection, formAccessor, changedFields);
      },
    });

    this.setupHttpStreams();
    this.setupAsyncFunctionStreams();
  }

  private applyOnChangeDerivations(collection: DerivationCollection, formAccessor: FieldTree<unknown>, changedFields?: Set<string>): void {
    const applicatorContext = {
      formValue: this.config.formValue,
      rootForm: formAccessor,
      derivationFunctions: this.functionRegistry.getDerivationFunctions(),
      customFunctions: this.functionRegistry.getCustomFunctions(),
      externalData: resolveExternalData(this.config.externalData),
      logger: this.logger,
      warningTracker: this.warningTracker,
      derivationLogger: untracked(() => this.config.derivationLogger()),
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
    // Filter entries to just those with the specific debounce period
    const debouncedEntries = collection.entries.filter(
      (entry) => entry.trigger === 'debounced' && (entry.debounceMs ?? DEFAULT_DEBOUNCE_MS) === debounceMs,
    );

    if (debouncedEntries.length === 0) {
      return;
    }

    // Create a minimal collection with filtered entries
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
      derivationLogger: untracked(() => this.config.derivationLogger()),
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

  /**
   * Builds a declarative stream that reacts to changes in the set of HTTP
   * derivation entries and emits per-entry streams merged together. See
   * {@link setupEntryAsyncStream} for the shared outer-pipeline shape;
   * this method only supplies the value-pipeline createStream callback.
   */
  private setupHttpStreams(): void {
    const formValue$ = toObservable(this.config.formValue, { injector: this.injector });

    setupEntryAsyncStream<DerivationCollection, DerivationEntry>({
      injector: this.injector,
      destroyRef: this.destroyRef,
      logger: this.logger,
      errorLabel: 'HTTP Derivation: outer stream error',
      collectionSignal: this.derivationCollection,
      selectEntries: (collection) => collection?.entries.filter((entry) => entry.http) ?? [],
      entrySignature: httpEntrySignature,
      createStream: (entry) => {
        if (!this.httpClient) {
          this.logger.error(
            'HTTP Derivation: HttpClient is not available. Ensure provideHttpClient() is included in your application providers.',
          );
          return null;
        }
        const context: HttpDerivationStreamContext = {
          formValue: this.config.formValue,
          form: this.config.form,
          httpClient: this.httpClient,
          logger: this.logger,
          derivationLogger: this.config.derivationLogger,
          customFunctions: () => this.functionRegistry.getCustomFunctions(),
          externalData: () => resolveExternalData(this.config.externalData),
          warningTracker: this.warningTracker,
        };
        return createHttpDerivationStream(entry, formValue$, context);
      },
    });
  }

  private setupAsyncFunctionStreams(): void {
    const formValue$ = toObservable(this.config.formValue, { injector: this.injector });

    setupEntryAsyncStream<DerivationCollection, DerivationEntry>({
      injector: this.injector,
      destroyRef: this.destroyRef,
      logger: this.logger,
      errorLabel: 'Async Derivation: outer stream error',
      collectionSignal: this.derivationCollection,
      selectEntries: (collection) => collection?.entries.filter((entry) => entry.asyncFunctionName || entry.asyncFn) ?? [],
      entrySignature: asyncEntrySignature,
      createStream: (entry) =>
        createAsyncDerivationStream(entry, formValue$, {
          formValue: this.config.formValue,
          form: this.config.form,
          logger: this.logger,
          derivationLogger: this.config.derivationLogger,
          customFunctions: () => this.functionRegistry.getCustomFunctions(),
          asyncDerivationFunctions: () => this.functionRegistry.getAsyncDerivationFunctions(),
          externalData: () => resolveExternalData(this.config.externalData),
          warningTracker: this.warningTracker,
        }),
    });
  }
}

/**
 * Identity signature for an HTTP derivation entry. Includes every field that
 * drives the inner stream's behavior — changing any of them must tear down
 * and rebuild the stream. Stable across topological reorderings because the
 * consumer ({@link entrySetsEqual}) compares as a multiset.
 */
function httpEntrySignature(entry: DerivationEntry): string {
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

function asyncEntrySignature(entry: DerivationEntry): string {
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
