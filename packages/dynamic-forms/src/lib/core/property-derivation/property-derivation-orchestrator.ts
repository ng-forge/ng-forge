import { HttpClient } from '@angular/common/http';
import { computed, DestroyRef, inject, InjectionToken, Injector, Signal } from '@angular/core';
import { DEV_MODE } from '../../utils/dev-mode';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { FieldDef } from '../../definitions/base/field-def';
import { FORM_OPTIONS } from '../../models/field-signal-context.token';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import { Logger } from '../../providers/features/logger/logger.interface';
import { DEFAULT_DEBOUNCE_MS } from '../../utils/debounce/debounce';
import { FunctionRegistryService } from '../registry';
import { DERIVATION_WARNING_TRACKER } from '../derivation/derivation-warning-tracker';
import { resolveExternalData } from '../derivation/external-data-resolver';
import { setupDebouncedStream, setupEntryAsyncStream, setupOnChangeStream } from '../derivation/pipeline-setup-utils';
import { DEPRECATION_WARNING_TRACKER } from '../../utils/deprecation-warning-tracker';
import { applyPropertyDerivationsForTrigger } from './property-derivation-applicator';
import { collectPropertyDerivations } from './property-derivation-collector';
import { PropertyDerivationCollection, PropertyDerivationEntry } from './property-derivation-types';
import { PropertyOverrideStore } from './property-override-store';
import { createHttpPropertyDerivationStream } from './http-property-derivation-stream';
import { createAsyncPropertyDerivationStream } from './async-property-derivation-stream';

/**
 * Configuration for creating a PropertyDerivationOrchestrator.
 *
 * @internal
 */
export interface PropertyDerivationOrchestratorConfig {
  /** Signal from stateManager.formSetup()?.schemaFields */
  schemaFields: Signal<FieldDef<unknown>[] | undefined>;

  /** Signal from stateManager.formValue */
  formValue: Signal<Record<string, unknown>>;

  /** The property override store instance */
  store: PropertyOverrideStore;

  /** Signal from stateManager.activeConfig()?.externalData */
  externalData?: Signal<Record<string, Signal<unknown>> | undefined>;
}

/**
 * Orchestrates property derivation processing for a dynamic form.
 *
 * Uses the same reactive stream pattern as DerivationOrchestrator:
 * - `exhaustMap` prevents re-entry during onChange processing
 * - `pairwise` tracks value changes without mutable state
 * - `takeUntilDestroyed` handles automatic cleanup
 *
 * @public
 */
export class PropertyDerivationOrchestrator {
  private readonly config: PropertyDerivationOrchestratorConfig;
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly logger = inject(DynamicFormLogger);
  private readonly warningTracker = inject(DERIVATION_WARNING_TRACKER);
  private readonly deprecationTracker = inject(DEPRECATION_WARNING_TRACKER);
  private readonly functionRegistry = inject(FunctionRegistryService);
  private readonly formOptions = inject(FORM_OPTIONS);
  private readonly httpClient = inject(HttpClient, { optional: true });

  /**
   * Computed signal containing the collected property derivations.
   * Returns null if no property derivations are defined.
   */
  readonly propertyDerivationCollection: Signal<PropertyDerivationCollection | null>;

  constructor(config: PropertyDerivationOrchestratorConfig) {
    this.config = config;

    // Pure computed — no side effects. Just derives the collection from schema fields.
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

    // Side effects react to collection changes: clear the store, register fields, warn.
    // schemaFields is included in the dependency array to ensure the field count is always
    // in sync with the collection (avoids reading a stale value via untracked).
    explicitEffect([this.propertyDerivationCollection, this.config.schemaFields], ([collection, fields]) => {
      config.store.clear();

      if (!collection) return;

      for (const entry of collection.entries) {
        config.store.registerField(entry.fieldKey);
      }

      if (DEV_MODE) {
        warnAboutWildcardDependencies(this.logger, collection.entries, fields?.length ?? 0);
      }
    });

    setupOnChangeStream<PropertyDerivationCollection>({
      injector: this.injector,
      destroyRef: this.destroyRef,
      logger: this.logger,
      errorLabel: 'Property derivation onChange stream error',
      collectionSignal: this.propertyDerivationCollection,
      formValueSignal: this.config.formValue,
      // Property-derivation's onChange path historically ignored the changedFields set
      // (it always re-runs all 'onChange'-triggered entries). The helper computes one
      // anyway — the cost is negligible and keeping the behavior intact requires only
      // dropping the second argument here.
      applyOnChange: (collection) => this.applyOnChangePropertyDerivations(collection),
    });

    setupDebouncedStream<PropertyDerivationCollection>({
      injector: this.injector,
      destroyRef: this.destroyRef,
      logger: this.logger,
      errorLabel: 'Property derivation debounced stream error',
      collectionSignal: this.propertyDerivationCollection,
      formValueSignal: this.config.formValue,
      applyDebouncedForPeriod: (debounceMs, collection, changedFields) => {
        this.applyDebouncedEntriesForPeriod(debounceMs, collection, changedFields);
      },
    });

    this.setupHttpStreams();
    this.setupAsyncFunctionStreams();
  }

  private applyOnChangePropertyDerivations(collection: PropertyDerivationCollection): void {
    const applicatorContext = {
      formValue: this.config.formValue,
      store: this.config.store,
      derivationFunctions: this.functionRegistry.getDerivationFunctions(),
      customFunctions: this.functionRegistry.getCustomFunctions(),
      externalData: resolveExternalData(this.config.externalData),
      logger: this.logger,
      warningTracker: this.warningTracker,
    };

    applyPropertyDerivationsForTrigger(collection, 'onChange', applicatorContext);
  }

  private applyDebouncedEntriesForPeriod(debounceMs: number, collection: PropertyDerivationCollection, changedFields?: Set<string>): void {
    const debouncedEntries = collection.entries.filter(
      (entry) => entry.trigger === 'debounced' && (entry.debounceMs ?? DEFAULT_DEBOUNCE_MS) === debounceMs,
    );

    if (debouncedEntries.length === 0) return;

    const filteredCollection: PropertyDerivationCollection = { entries: debouncedEntries };

    const applicatorContext = {
      formValue: this.config.formValue,
      store: this.config.store,
      derivationFunctions: this.functionRegistry.getDerivationFunctions(),
      customFunctions: this.functionRegistry.getCustomFunctions(),
      externalData: resolveExternalData(this.config.externalData),
      logger: this.logger,
      warningTracker: this.warningTracker,
    };

    applyPropertyDerivationsForTrigger(filteredCollection, 'debounced', applicatorContext, changedFields);
  }

  /**
   * Declarative pipeline for HTTP property-derivation entries. Delegates the
   * collection-watching / dedup / cancellation plumbing to
   * {@link setupEntryAsyncStream} so both orchestrators share one
   * implementation.
   */
  private setupHttpStreams(): void {
    const formValue$ = toObservable(this.config.formValue, { injector: this.injector });

    setupEntryAsyncStream<PropertyDerivationCollection, PropertyDerivationEntry>({
      injector: this.injector,
      destroyRef: this.destroyRef,
      logger: this.logger,
      errorLabel: 'HTTP Property Derivation: outer stream error',
      collectionSignal: this.propertyDerivationCollection,
      selectEntries: (collection) => collection?.entries.filter((entry) => entry.http) ?? [],
      entrySignature: httpEntrySignature,
      createStream: (entry) => {
        if (!this.httpClient) {
          this.logger.error(
            'HTTP Property Derivation: HttpClient is not available. Ensure provideHttpClient() is included in your application providers.',
          );
          return null;
        }
        return createHttpPropertyDerivationStream(entry, formValue$, {
          formValue: this.config.formValue,
          store: this.config.store,
          httpClient: this.httpClient,
          logger: this.logger,
          customFunctions: () => this.functionRegistry.getCustomFunctions(),
          externalData: () => resolveExternalData(this.config.externalData),
        });
      },
    });
  }

  private setupAsyncFunctionStreams(): void {
    const formValue$ = toObservable(this.config.formValue, { injector: this.injector });

    setupEntryAsyncStream<PropertyDerivationCollection, PropertyDerivationEntry>({
      injector: this.injector,
      destroyRef: this.destroyRef,
      logger: this.logger,
      errorLabel: 'Async Property Derivation: outer stream error',
      collectionSignal: this.propertyDerivationCollection,
      selectEntries: (collection) => collection?.entries.filter((entry) => entry.asyncFunctionName || entry.asyncFn) ?? [],
      entrySignature: asyncEntrySignature,
      createStream: (entry) =>
        createAsyncPropertyDerivationStream(entry, formValue$, {
          formValue: this.config.formValue,
          store: this.config.store,
          logger: this.logger,
          customFunctions: () => this.functionRegistry.getCustomFunctions(),
          asyncDerivationFunctions: () => this.functionRegistry.getAsyncDerivationFunctions(),
          externalData: () => resolveExternalData(this.config.externalData),
        }),
    });
  }
}

/**
 * Identity signature for an HTTP property-derivation entry. Includes every
 * field that drives the inner stream's behavior — changing any of them must
 * tear down and rebuild the stream. Stable across topological reorderings
 * because the consumer ({@link entrySetsEqual}) compares as a multiset.
 */
function httpEntrySignature(entry: PropertyDerivationEntry): string {
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

/**
 * Identity signature for an async-function property-derivation entry. Same
 * principle as {@link httpEntrySignature}: include every field the inner
 * stream closes over so changes force a rebuild. Inline `asyncFn`s use the
 * `fieldKey.targetProperty` path as a stable identifier — function identity
 * isn't JSON-serializable.
 */
function asyncEntrySignature(entry: PropertyDerivationEntry): string {
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
 * Creates a PropertyDerivationOrchestrator for a dynamic form.
 * Must be called within an injection context.
 *
 * @param config - Form-specific signals configuration
 * @returns The created PropertyDerivationOrchestrator
 *
 * @public
 */
export function createPropertyDerivationOrchestrator(config: PropertyDerivationOrchestratorConfig): PropertyDerivationOrchestrator {
  return new PropertyDerivationOrchestrator(config);
}

/**
 * Injection token for the PropertyDerivationOrchestrator.
 *
 * @public
 */
export const PROPERTY_DERIVATION_ORCHESTRATOR = new InjectionToken<PropertyDerivationOrchestrator>('PROPERTY_DERIVATION_ORCHESTRATOR');

// ─────────────────────────────────────────────────────────────────────────────
// Dev-mode diagnostics (tree-shaken in prod via DEV_MODE gate at call site)
// ─────────────────────────────────────────────────────────────────────────────

function warnAboutWildcardDependencies(logger: Logger, entries: PropertyDerivationEntry[], fieldCount: number): void {
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
