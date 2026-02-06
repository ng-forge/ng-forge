import { computed, DestroyRef, inject, InjectionToken, Injector, isDevMode, isSignal, Signal, untracked } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FieldTree } from '@angular/forms/signals';
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
import { applyDerivationsForTrigger } from './derivation-applicator';
import { collectDerivations } from './derivation-collector';
import { validateNoCycles } from './cycle-detector';
import { DerivationCollection, DerivationEntry } from './derivation-types';
import { DerivationLogger } from './derivation-logger.service';
import { DERIVATION_WARNING_TRACKER } from './derivation-warning-tracker';

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
      this.warnAboutWildcardDependencies(collection.entries, fields.length);

      return collection;
    });

    this.setupOnChangeStream();
    this.setupDebouncedStream();
  }

  private setupOnChangeStream(): void {
    const collection$ = toObservable(this.derivationCollection, { injector: this.injector });
    const formValue$ = toObservable(this.config.formValue, { injector: this.injector });
    const form$ = toObservable(this.config.form, { injector: this.injector });

    collection$
      .pipe(
        filter((collection): collection is DerivationCollection => collection !== null),
        combineLatestWith(formValue$, form$),

        // auditTime(0): Batch synchronous emissions from Angular's change detection.
        // When a single user action triggers multiple signal updates, this ensures
        // we only process derivations once after all updates complete (microtask timing).
        auditTime(0),

        // exhaustMap: Prevents re-entry while processing derivations.
        // If form value changes DURING derivation processing (from our own setValue calls),
        // we ignore those emissions and complete the current cycle first.
        // switchMap would cancel mid-processing, causing incomplete derivation chains.
        exhaustMap(([collection, , formAccessor]) => {
          this.applyOnChangeDerivations(collection, formAccessor);

          // scheduled with queueScheduler: Ensures the observable completes
          // in the next microtask, allowing exhaustMap to accept new emissions.
          // Without this, exhaustMap would block indefinitely.
          return scheduled([null], queueScheduler);
        }),

        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        error: (err) => this.logger.error('Derivation onChange stream error', err),
      });
  }

  private setupDebouncedStream(): void {
    toObservable(this.config.formValue, { injector: this.injector })
      .pipe(
        // debounceTime: Wait for value to stabilize before detecting changes.
        // Uses DEFAULT_DEBOUNCE_MS as the minimum debounce period.
        debounceTime(DEFAULT_DEBOUNCE_MS),

        // startWith + pairwise: Track previous and current values to detect changes.
        // startWith(null) ensures pairwise has an initial value to pair with.
        startWith(null as Record<string, unknown> | null),
        pairwise(),
        filter((pair): pair is [Record<string, unknown> | null, Record<string, unknown>] => pair[1] !== null),
        map(([previous, current]) => ({
          current,
          changedFields: getChangedKeys(previous, current),
        })),
        filter(({ changedFields }) => changedFields.size > 0),

        // switchMap: For debounced derivations, it's OK to cancel pending work
        // if new changes come in - we want the latest debounced values.
        // (Unlike onChange which uses exhaustMap to prevent cancellation)
        switchMap(({ changedFields }) => {
          const collection = untracked(() => this.derivationCollection());
          const formAccessor = untracked(() => this.config.form());

          if (!collection || !formAccessor) return of(null);

          // Get unique debounce periods from entries with trigger 'debounced'
          const debouncePeriods = this.getDebouncePeriods(collection.entries);
          if (debouncePeriods.length === 0) return of(null);

          // merge: Process multiple debounce periods concurrently.
          // Each period stream handles its own timing independently.
          const periodStreams = debouncePeriods.map((debounceMs) =>
            this.createPeriodStream(debounceMs, collection, formAccessor, changedFields),
          );

          return merge(...periodStreams);
        }),

        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        error: (err) => this.logger.error('Derivation debounced stream error', err),
      });
  }

  private createPeriodStream(
    debounceMs: number,
    collection: DerivationCollection,
    formAccessor: FieldTree<unknown>,
    changedFields: Set<string>,
  ) {
    const additionalWait = Math.max(0, debounceMs - DEFAULT_DEBOUNCE_MS);

    if (additionalWait === 0) {
      return of(null).pipe(
        map(() => {
          this.applyDebouncedEntriesForPeriod(debounceMs, collection, formAccessor, changedFields);
        }),
      );
    }

    return timer(additionalWait).pipe(
      map(() => {
        const currentCollection = untracked(() => this.derivationCollection());
        const currentFormAccessor = untracked(() => this.config.form());
        if (currentCollection && currentFormAccessor) {
          this.applyDebouncedEntriesForPeriod(debounceMs, currentCollection, currentFormAccessor, changedFields);
        }
      }),
    );
  }

  private applyOnChangeDerivations(collection: DerivationCollection, formAccessor: FieldTree<unknown>): void {
    const applicatorContext = {
      formValue: this.config.formValue,
      rootForm: formAccessor,
      derivationFunctions: this.functionRegistry.getDerivationFunctions(),
      customFunctions: this.functionRegistry.getCustomFunctions(),
      externalData: this.resolveExternalData(),
      logger: this.logger,
      warningTracker: this.warningTracker,
      derivationLogger: untracked(() => this.config.derivationLogger()),
      maxIterations: untracked(() => this.formOptions()?.maxDerivationIterations),
    };

    const result = applyDerivationsForTrigger(collection, 'onChange', applicatorContext);

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
      externalData: this.resolveExternalData(),
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
   * Gets all unique debounce periods from entries with trigger 'debounced'.
   */
  private getDebouncePeriods(entries: DerivationEntry[]): number[] {
    const periods = new Set<number>();
    for (const entry of entries) {
      if (entry.trigger === 'debounced') {
        periods.add(entry.debounceMs ?? DEFAULT_DEBOUNCE_MS);
      }
    }
    return Array.from(periods);
  }

  private warnAboutWildcardDependencies(entries: DerivationEntry[], fieldCount: number): void {
    if (!isDevMode()) return;

    // Find entries with wildcard dependency
    const wildcardEntries = entries.filter((entry) => entry.dependsOn.includes('*'));
    if (wildcardEntries.length === 0) return;

    // Find implicit wildcards (custom functions without explicit dependsOn)
    const implicitWildcards = wildcardEntries.filter(
      (entry) => entry.functionName && (!entry.originalConfig?.dependsOn || entry.originalConfig.dependsOn.length === 0),
    );

    if (implicitWildcards.length > 0) {
      const derivationDescs = implicitWildcards.map((e) => `${e.fieldKey} (${e.functionName})`);

      this.logger.warn(
        '[Derivation] Derivations using custom functions without explicit dependsOn detected. ' +
          `These run on EVERY form change, which may impact performance (form has ${fieldCount} fields). ` +
          'Consider specifying explicit dependsOn arrays for better performance.',
        derivationDescs,
      );
    }
  }

  /**
   * Resolves external data signals to their current values without creating dependencies.
   *
   * Uses `untracked()` to read signals without establishing reactive dependencies,
   * which is important for derivations that shouldn't re-trigger on every external data change.
   *
   * @returns Record of resolved external data values, or undefined if no external data.
   */
  private resolveExternalData(): Record<string, unknown> | undefined {
    const externalDataRecord = untracked(() => this.config.externalData?.());

    if (!externalDataRecord) {
      return undefined;
    }

    const resolved: Record<string, unknown> = {};
    for (const [key, signal] of Object.entries(externalDataRecord)) {
      if (isSignal(signal)) {
        resolved[key] = untracked(() => signal());
      } else {
        resolved[key] = signal;
      }
    }

    return resolved;
  }
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
