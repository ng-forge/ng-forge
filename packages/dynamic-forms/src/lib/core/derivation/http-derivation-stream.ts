import { HttpClient } from '@angular/common/http';
import { Signal, untracked } from '@angular/core';
import type { FieldTree } from '@angular/forms/signals';
import { EMPTY, Observable, debounceTime, filter, map, pairwise, startWith, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EvaluationContext } from '../../models/expressions/evaluation-context';
import { getChangedKeys, isEqual } from '../../utils/object-utils';
import { isArrayPlaceholderPath } from '../../utils/path-utils/path-utils';
import { CustomFunction } from '../expressions/custom-function-types';
import { evaluateCondition } from '../expressions/condition-evaluator';
import { ExpressionParser } from '../expressions/parser/expression-parser';
import { getNestedValue } from '../expressions/value-utils';
import { resolveHttpRequest } from '../http/http-request-resolver';
import { Logger } from '../../providers/features/logger/logger.interface';
import { DerivationEntry } from './derivation-types';
import { DerivationLogger } from './derivation-logger.service';
import { readFieldDirty, applyValueToForm } from './field-value-utils';
import { readFieldStateInfo, createFormFieldStateMap } from './field-state-extractor';
import type { FieldTreeRecord } from '../field-tree-utils';

/**
 * Context required for creating HTTP derivation streams.
 *
 * @internal
 */
export interface HttpDerivationStreamContext {
  /** Signal containing the current form value */
  formValue: Signal<Record<string, unknown>>;

  /** Signal containing the form accessor */
  form: Signal<FieldTree<unknown>>;

  /** Angular HttpClient for making requests */
  httpClient: HttpClient;

  /** Logger for diagnostic output */
  logger: Logger;

  /** Signal containing the derivation logger */
  derivationLogger: Signal<DerivationLogger>;

  /** Custom functions for expression evaluation */
  customFunctions?: Record<string, CustomFunction>;

  /** External data for expression evaluation */
  externalData?: Record<string, unknown>;
}

const LOG_PREFIX = '[HTTP Derivation]';
const DEFAULT_HTTP_DEBOUNCE_MS = 300;

/**
 * Creates an RxJS Observable stream that processes an HTTP derivation entry.
 *
 * Each HTTP derivation gets its own stream with:
 * - `debounceTime` to batch rapid changes
 * - `switchMap` to auto-cancel in-flight requests
 * - `catchError` inside the switchMap projection to prevent stream termination
 *
 * @param entry - The derivation entry with HTTP configuration
 * @param formValue$ - Observable of form value changes
 * @param context - Context with HttpClient, logger, etc.
 * @returns Observable that applies HTTP-derived values to the form
 *
 * @internal
 */
export function createHttpDerivationStream(
  entry: DerivationEntry,
  formValue$: Observable<Record<string, unknown>>,
  context: HttpDerivationStreamContext,
): Observable<void> {
  // Guard: no array support for HTTP derivations
  if (isArrayPlaceholderPath(entry.fieldKey)) {
    context.logger.warn(
      `${LOG_PREFIX} HTTP derivation for array field '${entry.fieldKey}' is not supported. ` +
        `Array HTTP derivations will be supported in a future release.`,
    );
    return EMPTY;
  }

  if (!entry.http) {
    return EMPTY;
  }

  const debounceMs = entry.http.debounceMs ?? DEFAULT_HTTP_DEBOUNCE_MS;

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
      return entry.dependsOn.some((dep) => dep === '*' || changedFields.has(dep));
    }),
    debounceTime(debounceMs),
    switchMap(({ current }) => {
      return new Observable<void>((subscriber) => {
        const formAccessor = untracked(() => context.form());

        // Check stopOnUserOverride — skip if the user has manually edited the target field
        if (entry.stopOnUserOverride) {
          const isDirty = readFieldDirty(formAccessor, entry.fieldKey);
          if (isDirty) {
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

        // Build evaluation context for condition check and request resolution
        const fieldValue = getNestedValue(current, entry.fieldKey);
        const fieldAccessor = (formAccessor as FieldTreeRecord)[entry.fieldKey];
        const fieldState = fieldAccessor ? readFieldStateInfo(fieldAccessor, false) : undefined;

        const evalContext: EvaluationContext = {
          fieldValue,
          formValue: current,
          fieldPath: entry.fieldKey,
          customFunctions: context.customFunctions,
          externalData: context.externalData,
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

        // Resolve the HTTP request (evaluates expressions in queryParams/body)
        const resolvedRequest = resolveHttpRequest(entry.http!, evalContext);

        // Make the HTTP request
        const method = (resolvedRequest.method ?? 'GET').toUpperCase();
        const httpSub = context.httpClient
          .request(method, resolvedRequest.url, {
            body: resolvedRequest.body,
            headers: resolvedRequest.headers as Record<string, string>,
          })
          .subscribe({
            next: (response) => {
              try {
                // Extract value from response using responseExpression
                const newValue = ExpressionParser.evaluate(entry.responseExpression!, { response });

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
                applyValueToForm(entry.fieldKey, newValue, currentForm, context.logger);

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
                context.logger.warn(`${LOG_PREFIX} Failed to process response for '${entry.fieldKey}': ${message}`);
                subscriber.complete();
              }
            },
            error: (error) => {
              const message = error instanceof Error ? error.message : String(error);
              context.logger.warn(`${LOG_PREFIX} HTTP request failed for '${entry.fieldKey}': ${message}`);
              subscriber.complete();
            },
          });

        // Cleanup subscription on unsubscribe (switchMap cancellation)
        return () => {
          httpSub.unsubscribe();
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
