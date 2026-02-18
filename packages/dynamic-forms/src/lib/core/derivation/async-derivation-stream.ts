import { Signal, untracked } from '@angular/core';
import type { FieldTree } from '@angular/forms/signals';
import { EMPTY, from, Observable, debounceTime, filter, map, pairwise, startWith, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EvaluationContext } from '../../models/expressions/evaluation-context';
import { getChangedKeys, isEqual } from '../../utils/object-utils';
import { isArrayPlaceholderPath } from '../../utils/path-utils/path-utils';
import { CustomFunction } from '../expressions/custom-function-types';
import type { AsyncDerivationFunction } from '../expressions/async-custom-function-types';
import { evaluateCondition } from '../expressions/condition-evaluator';
import { getNestedValue } from '../expressions/value-utils';
import { Logger } from '../../providers/features/logger/logger.interface';
import { DerivationEntry } from './derivation-types';
import { DerivationLogger } from './derivation-logger.service';
import { DerivationWarningTracker } from './derivation-warning-tracker';
import { readFieldDirty, resetFieldState, applyValueToForm } from './field-value-utils';
import { readFieldStateInfo, createFormFieldStateMap } from './field-state-extractor';
import type { FieldTreeRecord } from '../field-tree-utils';

/**
 * Context required for creating async derivation streams.
 *
 * @internal
 */
export interface AsyncDerivationStreamContext {
  /** Signal containing the current form value */
  formValue: Signal<Record<string, unknown>>;

  /** Signal containing the form accessor */
  form: Signal<FieldTree<unknown>>;

  /** Logger for diagnostic output */
  logger: Logger;

  /** Signal containing the derivation logger */
  derivationLogger: Signal<DerivationLogger>;

  /** Lazy resolver for custom functions — called per-emission to get fresh values */
  customFunctions?: () => Record<string, CustomFunction> | undefined;

  /** Lazy resolver for async derivation functions — called per-emission to get fresh values */
  asyncDerivationFunctions?: () => Record<string, AsyncDerivationFunction> | undefined;

  /** Lazy resolver for external data — called per-emission to get fresh values */
  externalData?: () => Record<string, unknown> | undefined;

  /** Warning tracker to suppress duplicate missing-field warnings */
  warningTracker?: DerivationWarningTracker;
}

const LOG_PREFIX = 'Async Derivation -';
const DEFAULT_ASYNC_DEBOUNCE_MS = 300;

/**
 * Creates an RxJS Observable stream that processes an async derivation entry.
 *
 * Each async derivation gets its own stream with:
 * - `debounceTime` to batch rapid changes
 * - `switchMap` to auto-cancel in-flight async operations
 * - `catchError` inside the switchMap projection to prevent stream termination
 *
 * @param entry - The derivation entry with asyncFunctionName
 * @param formValue$ - Observable of form value changes
 * @param context - Context with logger, etc.
 * @returns Observable that applies async-derived values to the form
 *
 * @internal
 */
export function createAsyncDerivationStream(
  entry: DerivationEntry,
  formValue$: Observable<Record<string, unknown>>,
  context: AsyncDerivationStreamContext,
): Observable<void> {
  // Guard: no array support for async derivations
  if (isArrayPlaceholderPath(entry.fieldKey)) {
    context.logger.warn(
      `${LOG_PREFIX} Async derivation for array field '${entry.fieldKey}' is not supported. ` +
        `Array async derivations will be supported in a future release.`,
    );
    return EMPTY;
  }

  if (!entry.asyncFunctionName) {
    return EMPTY;
  }

  const asyncFunctionName = entry.asyncFunctionName;
  const debounceMs = entry.debounceMs ?? DEFAULT_ASYNC_DEBOUNCE_MS;

  return formValue$.pipe(
    startWith(null as Record<string, unknown> | null),
    pairwise(),
    map(([previous, current]) => ({
      current: current!,
      changedFields: getChangedKeys(previous, current!),
    })),
    // Only proceed when a dependency in entry.dependsOn changed
    filter(({ changedFields }) => {
      if (changedFields.size === 0) return false;
      return entry.dependsOn.some((dep) => changedFields.has(dep));
    }),
    debounceTime(debounceMs),
    switchMap(({ current, changedFields }) => {
      return new Observable<void>((subscriber) => {
        const formAccessor = untracked(() => context.form());

        // Check stopOnUserOverride — skip if the user has manually edited the target field
        if (entry.stopOnUserOverride) {
          const isDirty = readFieldDirty(formAccessor, entry.fieldKey);
          if (isDirty) {
            // Re-engage: if a dependency changed, clear dirty state so derivation resumes
            if (entry.reEngageOnDependencyChange && changedFields.size > 0) {
              if (entry.dependsOn.some((dep) => changedFields.has(dep))) {
                resetFieldState(formAccessor, entry.fieldKey);
                // Fall through — proceed with the async call
              } else {
                const derivationLogger = untracked(() => context.derivationLogger());
                derivationLogger.evaluation({
                  debugName: entry.debugName,
                  fieldKey: entry.fieldKey,
                  result: 'skipped',
                  skipReason: 'user-override',
                });
                subscriber.complete();
                return;
              }
            } else {
              const derivationLogger = untracked(() => context.derivationLogger());
              derivationLogger.evaluation({
                debugName: entry.debugName,
                fieldKey: entry.fieldKey,
                result: 'skipped',
                skipReason: 'user-override',
              });
              subscriber.complete();
              return;
            }
          }
        }

        // Resolve lazy context values per-emission
        const customFunctions = context.customFunctions?.();
        const asyncDerivationFunctions = context.asyncDerivationFunctions?.();
        const externalData = context.externalData?.();

        // Look up the async function
        const asyncFn = asyncDerivationFunctions?.[asyncFunctionName];
        if (!asyncFn) {
          context.logger.warn(
            `${LOG_PREFIX} Async derivation function '${asyncFunctionName}' not found for field '${entry.fieldKey}'. ` +
              `Register it in customFnConfig.asyncDerivations.`,
          );
          subscriber.complete();
          return;
        }

        // Build evaluation context for condition check
        const fieldValue = getNestedValue(current, entry.fieldKey);
        const fieldAccessor = (formAccessor as FieldTreeRecord)[entry.fieldKey];
        const fieldState = fieldAccessor ? readFieldStateInfo(fieldAccessor, false) : undefined;

        const evalContext: EvaluationContext = {
          fieldValue,
          formValue: current,
          fieldPath: entry.fieldKey,
          customFunctions,
          externalData,
          logger: context.logger,
          fieldState,
          formFieldState: createFormFieldStateMap(formAccessor, false),
        };

        // Evaluate condition — skip if false
        if (entry.condition !== true) {
          const conditionMet = typeof entry.condition === 'boolean' ? entry.condition : evaluateCondition(entry.condition, evalContext);
          if (!conditionMet) {
            const derivationLogger = untracked(() => context.derivationLogger());
            derivationLogger.evaluation({
              debugName: entry.debugName,
              fieldKey: entry.fieldKey,
              result: 'skipped',
              skipReason: 'condition-false',
            });
            subscriber.complete();
            return;
          }
        }

        // Call the async function (normalize Promise → Observable)
        const result$ = from(asyncFn(evalContext));

        const asyncSub = result$.subscribe({
          next: (newValue) => {
            try {
              // Compare with current value — skip if unchanged
              const currentFormValue = untracked(() => context.formValue());
              const currentValue = getNestedValue(currentFormValue, entry.fieldKey);

              if (isEqual(currentValue, newValue)) {
                const derivationLogger = untracked(() => context.derivationLogger());
                derivationLogger.evaluation({
                  debugName: entry.debugName,
                  fieldKey: entry.fieldKey,
                  result: 'skipped',
                  skipReason: 'value-unchanged',
                });
                subscriber.complete();
                return;
              }

              // Apply the value to the form
              const currentForm = untracked(() => context.form());
              applyValueToForm(entry.fieldKey, newValue, currentForm, context.logger, context.warningTracker);

              const derivationLogger = untracked(() => context.derivationLogger());
              derivationLogger.evaluation({
                debugName: entry.debugName,
                fieldKey: entry.fieldKey,
                result: 'applied',
                previousValue: currentValue,
                newValue,
              });
              subscriber.complete();
            } catch (error) {
              const message = error instanceof Error ? error.message : String(error);
              context.logger.warn(`${LOG_PREFIX} Failed to process result for '${entry.fieldKey}': ${message}`);
              subscriber.complete();
            }
          },
          error: (error) => {
            const message = error instanceof Error ? error.message : String(error);
            context.logger.warn(`${LOG_PREFIX} Async function failed for '${entry.fieldKey}': ${message}`);
            subscriber.complete();
          },
        });

        // Cleanup subscription on unsubscribe (switchMap cancellation)
        return () => {
          asyncSub.unsubscribe();
        };
      });
    }),
    catchError((error) => {
      // Safety net — should not normally be reached since inner errors are caught
      const message = error instanceof Error ? error.message : String(error);
      context.logger.warn(`${LOG_PREFIX} Unexpected stream error for '${entry.fieldKey}': ${message}`);
      return EMPTY;
    }),
  );
}
