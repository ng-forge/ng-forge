import { computed, DestroyRef, inject, InjectionToken, Injector, isDevMode, Signal, untracked } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FieldTree } from '@angular/forms/signals';
import {
  combineLatestWith,
  debounceTime,
  exhaustMap,
  filter,
  map,
  merge,
  of,
  pairwise,
  scheduled,
  startWith,
  switchMap,
  timer,
} from 'rxjs';
import { queueScheduler } from 'rxjs';
import { FieldDef } from '../../definitions/base/field-def';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import { DEFAULT_DEBOUNCE_MS } from '../../utils/debounce/debounce';
import { getChangedKeys } from '../../utils/object-utils';
import { FunctionRegistryService } from '../registry';
import {
  applyDerivationsForTrigger,
  collectDerivations,
  DerivationCollection,
  getDebouncedCollection,
  getDebouncePeriods,
  validateNoCycles,
} from './index';
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
      this.warnAboutWildcardDependencies(collection);

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
        exhaustMap(([collection, , formAccessor]) => {
          this.applyOnChangeDerivations(collection, formAccessor);
          return scheduled([null], queueScheduler);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
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
          const collection = untracked(() => this.derivationCollection());
          const formAccessor = untracked(() => this.config.form());

          if (!collection || !formAccessor) return of(null);

          const debouncePeriods = getDebouncePeriods(collection);
          if (debouncePeriods.length === 0) return of(null);

          const periodStreams = debouncePeriods.map((debounceMs) =>
            this.createPeriodStream(debounceMs, collection, formAccessor, changedFields),
          );

          return merge(...periodStreams);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
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
      logger: this.logger,
      warningTracker: this.warningTracker,
      derivationLogger: untracked(() => this.config.derivationLogger()),
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
    const cachedCollection = getDebouncedCollection(collection, debounceMs);
    if (!cachedCollection || cachedCollection.entries.length === 0) {
      return;
    }

    const applicatorContext = {
      formValue: this.config.formValue,
      rootForm: formAccessor,
      derivationFunctions: this.functionRegistry.getDerivationFunctions(),
      customFunctions: this.functionRegistry.getCustomFunctions(),
      logger: this.logger,
      warningTracker: this.warningTracker,
      derivationLogger: untracked(() => this.config.derivationLogger()),
    };

    const result = applyDerivationsForTrigger(cachedCollection, 'debounced', applicatorContext, changedFields);

    if (result.maxIterationsReached) {
      this.logger.warn(
        `Debounced derivation processing reached max iterations (${debounceMs}ms). ` +
          `Applied: ${result.appliedCount}, Skipped: ${result.skippedCount}, Errors: ${result.errorCount}`,
      );
    }
  }

  private warnAboutWildcardDependencies(collection: DerivationCollection): void {
    if (!isDevMode()) return;

    const wildcardEntries = collection.wildcardEntries;
    if (wildcardEntries.length === 0) return;

    const implicitWildcards = wildcardEntries.filter(
      (entry) => entry.functionName && (!entry.originalConfig?.dependsOn || entry.originalConfig.dependsOn.length === 0),
    );

    if (implicitWildcards.length > 0) {
      const derivationDescs = implicitWildcards.map((e) => `${e.sourceFieldKey} -> ${e.targetFieldKey} (${e.functionName})`);

      this.logger.warn(
        '[Derivation] Derivations using custom functions without explicit dependsOn detected. ' +
          'These run on EVERY form change, which may impact performance in large forms. ' +
          'Consider specifying explicit dependsOn arrays for better performance.',
        derivationDescs,
      );
    }
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
