import { Signal, untracked } from '@angular/core';
import { EMPTY, from, Observable, debounceTime, filter, map, pairwise, startWith, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EvaluationContext } from '../../models/expressions/evaluation-context';
import { getChangedKeys } from '../../utils/object-utils';
import { isArrayPlaceholderPath } from '../../utils/path-utils/path-utils';
import { CustomFunction } from '../expressions/custom-function-types';
import type { AsyncDerivationFunction } from '../expressions/async-custom-function-types';
import { evaluateCondition } from '../expressions/condition-evaluator';
import { getNestedValue } from '../expressions/value-utils';
import { Logger } from '../../providers/features/logger/logger.interface';
import { PropertyDerivationEntry } from './property-derivation-types';
import { PropertyOverrideStore } from './property-override-store';

/**
 * Context required for creating async-function property-derivation streams.
 *
 * Mirrors `AsyncDerivationStreamContext` from the value-derivation pipeline,
 * minus the form-accessor and dirty-state plumbing — property derivations
 * don't have a user-override concept.
 *
 * @internal
 */
export interface AsyncPropertyDerivationStreamContext {
  /** Signal containing the current form value */
  formValue: Signal<Record<string, unknown>>;

  /** The property override store to write into */
  store: PropertyOverrideStore;

  /** Logger for diagnostic output */
  logger: Logger;

  /** Lazy resolver for custom functions — called per-emission to get fresh values */
  customFunctions?: () => Record<string, CustomFunction> | undefined;

  /** Lazy resolver for async derivation functions — called per-emission to get fresh values */
  asyncDerivationFunctions?: () => Record<string, AsyncDerivationFunction> | undefined;

  /** Lazy resolver for external data — called per-emission to get fresh values */
  externalData?: () => Record<string, unknown> | undefined;
}

const LOG_PREFIX = 'Async Property Derivation -';
const DEFAULT_ASYNC_DEBOUNCE_MS = 300;

/**
 * Creates an RxJS Observable stream that processes an async-function property-derivation entry.
 *
 * Mirrors `createAsyncDerivationStream` (value pipeline) but writes the result via
 * `store.setOverride(fieldKey, targetProperty, value)` instead of patching the form.
 *
 * @internal
 */
export function createAsyncPropertyDerivationStream(
  entry: PropertyDerivationEntry,
  formValue$: Observable<Record<string, unknown>>,
  context: AsyncPropertyDerivationStreamContext,
): Observable<void> {
  if (isArrayPlaceholderPath(entry.fieldKey)) {
    context.logger.warn(
      `${LOG_PREFIX} Async property derivation for array field '${entry.fieldKey}' is not supported. ` +
        `Array async property derivations will be supported in a future release.`,
    );
    return EMPTY;
  }

  if (!entry.asyncFunctionName && !entry.asyncFn) {
    context.logger.warn(
      `${LOG_PREFIX} Property derivation for '${entry.fieldKey}.${entry.targetProperty}' has neither "asyncFunctionName" nor "asyncFn". ` +
        `One of the two is required for source: 'asyncFunction'.`,
    );
    return EMPTY;
  }

  if (entry.asyncFn && entry.asyncFunctionName) {
    context.logger.warn(
      `${LOG_PREFIX} Both "asyncFn" and "asyncFunctionName" are set on property derivation for '${entry.fieldKey}.${entry.targetProperty}'. ` +
        `Inline "asyncFn" takes precedence; "asyncFunctionName" is ignored.`,
    );
  }

  const inlineAsyncFn = entry.asyncFn;
  const asyncFunctionName = entry.asyncFunctionName;
  const debounceMs = entry.debounceMs ?? DEFAULT_ASYNC_DEBOUNCE_MS;

  return formValue$.pipe(
    startWith(null as Record<string, unknown> | null),
    pairwise(),
    map(([previous, current]) => ({
      current: current!,
      changedFields: getChangedKeys(previous, current!),
    })),
    filter(({ changedFields }) => {
      if (changedFields.size === 0) return false;
      return entry.dependsOn.some((dep) => changedFields.has(dep));
    }),
    debounceTime(debounceMs),
    switchMap(({ current }) => {
      return new Observable<void>((subscriber) => {
        const customFunctions = context.customFunctions?.();
        const asyncDerivationFunctions = context.asyncDerivationFunctions?.();
        const externalData = context.externalData?.();

        const asyncFn = inlineAsyncFn ?? (asyncFunctionName ? asyncDerivationFunctions?.[asyncFunctionName] : undefined);
        if (!asyncFn) {
          context.logger.warn(
            `${LOG_PREFIX} Async derivation function '${asyncFunctionName}' not found for '${entry.fieldKey}.${entry.targetProperty}'. ` +
              `Register it in customFnConfig.asyncDerivations.`,
          );
          subscriber.complete();
          return;
        }

        const fieldValue = getNestedValue(current, entry.fieldKey);

        const evalContext: EvaluationContext = {
          fieldValue,
          formValue: current,
          fieldPath: entry.fieldKey,
          customFunctions,
          externalData,
          logger: context.logger,
        };

        if (entry.condition !== true) {
          const conditionMet = typeof entry.condition === 'boolean' ? entry.condition : evaluateCondition(entry.condition, evalContext);
          if (!conditionMet) {
            subscriber.complete();
            return;
          }
        }

        const result$ = from(asyncFn(evalContext));

        const asyncSub = result$.subscribe({
          next: (newValue) => {
            try {
              untracked(() => context.store.setOverride(entry.fieldKey, entry.targetProperty, newValue));
              subscriber.complete();
            } catch (error) {
              const message = error instanceof Error ? error.message : String(error);
              context.logger.warn(`${LOG_PREFIX} Failed to process result for '${entry.fieldKey}.${entry.targetProperty}': ${message}`);
              subscriber.complete();
            }
          },
          error: (error) => {
            const message = error instanceof Error ? error.message : String(error);
            context.logger.warn(`${LOG_PREFIX} Async function failed for '${entry.fieldKey}.${entry.targetProperty}': ${message}`);
            subscriber.complete();
          },
          complete: () => {
            subscriber.complete();
          },
        });

        return () => {
          asyncSub.unsubscribe();
        };
      });
    }),
    catchError((error) => {
      const message = error instanceof Error ? error.message : String(error);
      context.logger.warn(`${LOG_PREFIX} Unexpected stream error for '${entry.fieldKey}.${entry.targetProperty}': ${message}`);
      return EMPTY;
    }),
  );
}
