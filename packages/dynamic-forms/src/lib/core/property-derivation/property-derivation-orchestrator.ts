import { computed, DestroyRef, inject, InjectionToken, Injector, isDevMode, isSignal, Signal, untracked } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { explicitEffect } from 'ngxtension/explicit-effect';
import {
  auditTime,
  combineLatestWith,
  debounceTime,
  exhaustMap,
  filter,
  map,
  merge,
  of,
  pairwise,
  queueScheduler,
  scheduled,
  startWith,
  switchMap,
  timer,
} from 'rxjs';
import { FieldDef } from '../../definitions/base/field-def';
import { FORM_OPTIONS } from '../../models/field-signal-context.token';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import { DEFAULT_DEBOUNCE_MS } from '../../utils/debounce/debounce';
import { getChangedKeys } from '../../utils/object-utils';
import { FunctionRegistryService } from '../registry';
import { DERIVATION_WARNING_TRACKER } from '../derivation/derivation-warning-tracker';
import { applyPropertyDerivationsForTrigger } from './property-derivation-applicator';
import { collectPropertyDerivations } from './property-derivation-collector';
import { PropertyDerivationCollection, PropertyDerivationEntry } from './property-derivation-types';
import { PropertyOverrideStore } from './property-override-store';

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
  private readonly functionRegistry = inject(FunctionRegistryService);
  private readonly formOptions = inject(FORM_OPTIONS);

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

      const collection = collectPropertyDerivations(fields);

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

      this.warnAboutWildcardDependencies(collection.entries, fields?.length ?? 0);
    });

    this.setupOnChangeStream();
    this.setupDebouncedStream();
  }

  private setupOnChangeStream(): void {
    const collection$ = toObservable(this.propertyDerivationCollection, { injector: this.injector });
    const formValue$ = toObservable(this.config.formValue, { injector: this.injector });

    collection$
      .pipe(
        filter((collection): collection is PropertyDerivationCollection => collection !== null),
        combineLatestWith(formValue$),
        auditTime(0),
        exhaustMap(([collection]) => {
          this.applyOnChangePropertyDerivations(collection);
          return scheduled([null], queueScheduler);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        error: (err) => this.logger.error('Property derivation onChange stream error', err),
      });
  }

  private setupDebouncedStream(): void {
    toObservable(this.config.formValue, { injector: this.injector })
      .pipe(
        debounceTime(DEFAULT_DEBOUNCE_MS),
        startWith(null as Record<string, unknown> | null),
        pairwise(),
        filter((pair): pair is [Record<string, unknown> | null, Record<string, unknown>] => pair[1] !== null),
        map(([previous, current]) => ({
          current,
          changedFields: getChangedKeys(previous, current),
        })),
        filter(({ changedFields }) => changedFields.size > 0),
        switchMap(({ changedFields }) => {
          const collection = untracked(() => this.propertyDerivationCollection());
          if (!collection) return of(null);

          const debouncePeriods = this.getDebouncePeriods(collection.entries);
          if (debouncePeriods.length === 0) return of(null);

          const periodStreams = debouncePeriods.map((debounceMs) => this.createPeriodStream(debounceMs, collection, changedFields));

          return merge(...periodStreams);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        error: (err) => this.logger.error('Property derivation debounced stream error', err),
      });
  }

  private createPeriodStream(debounceMs: number, collection: PropertyDerivationCollection, changedFields: Set<string>) {
    const additionalWait = Math.max(0, debounceMs - DEFAULT_DEBOUNCE_MS);

    return timer(additionalWait).pipe(
      map(() => {
        // For periods beyond DEFAULT_DEBOUNCE_MS, re-read collection as it may have changed during the wait.
        // For zero-wait periods, use the original collection directly since no time has elapsed.
        const currentCollection = additionalWait > 0 ? (untracked(() => this.propertyDerivationCollection()) ?? collection) : collection;
        this.applyDebouncedEntriesForPeriod(debounceMs, currentCollection, changedFields);
      }),
    );
  }

  private applyOnChangePropertyDerivations(collection: PropertyDerivationCollection): void {
    const applicatorContext = {
      formValue: this.config.formValue,
      store: this.config.store,
      propertyDerivationFunctions: this.functionRegistry.getPropertyDerivationFunctions(),
      customFunctions: this.functionRegistry.getCustomFunctions(),
      externalData: this.resolveExternalData(),
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
      propertyDerivationFunctions: this.functionRegistry.getPropertyDerivationFunctions(),
      customFunctions: this.functionRegistry.getCustomFunctions(),
      externalData: this.resolveExternalData(),
      logger: this.logger,
      warningTracker: this.warningTracker,
    };

    applyPropertyDerivationsForTrigger(filteredCollection, 'debounced', applicatorContext, changedFields);
  }

  private getDebouncePeriods(entries: PropertyDerivationEntry[]): number[] {
    const periods = new Set<number>();
    for (const entry of entries) {
      if (entry.trigger === 'debounced') {
        periods.add(entry.debounceMs ?? DEFAULT_DEBOUNCE_MS);
      }
    }
    return Array.from(periods);
  }

  private warnAboutWildcardDependencies(entries: PropertyDerivationEntry[], fieldCount: number): void {
    if (!isDevMode()) return;

    const implicitWildcards = entries.filter(
      (entry) =>
        entry.dependsOn.includes('*') &&
        entry.functionName &&
        (!entry.originalConfig?.dependsOn || entry.originalConfig.dependsOn.length === 0),
    );

    if (implicitWildcards.length > 0) {
      const derivationDescs = implicitWildcards.map((e) => `${e.fieldKey}.${e.targetProperty} (${e.functionName})`);

      this.logger.warn(
        '[PropertyDerivation] Property derivations using custom functions without explicit dependsOn detected. ' +
          `These run on EVERY form change, which may impact performance (form has ${fieldCount} fields). ` +
          'Consider specifying explicit dependsOn arrays for better performance.',
        derivationDescs,
      );
    }
  }

  /**
   * Resolves external data signals to their current values.
   *
   * Called on every onChange and debounced application. Each call iterates all
   * external data entries and resolves signals via untracked(). For forms with
   * many external data entries, this could be optimized by caching the resolved
   * record and only invalidating when external data signal values change.
   * In practice, external data entries are few, so the linear scan is acceptable.
   */
  private resolveExternalData(): Record<string, unknown> | undefined {
    const externalDataRecord = untracked(() => this.config.externalData?.());

    if (!externalDataRecord) return undefined;

    const resolved: Record<string, unknown> = {};
    for (const [key, signalValue] of Object.entries(externalDataRecord)) {
      if (isSignal(signalValue)) {
        resolved[key] = untracked(() => signalValue());
      } else {
        resolved[key] = signalValue;
      }
    }

    return resolved;
  }
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
