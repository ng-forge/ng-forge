import { HttpClient } from '@angular/common/http';
import { Signal, untracked } from '@angular/core';
import { EMPTY, Observable, debounceTime, filter, map, pairwise, startWith, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EvaluationContext } from '@ng-forge/dynamic-forms/internal';
import { getChangedKeys } from '@ng-forge/dynamic-forms/internal';
import { isArrayPlaceholderPath } from '../../utils/path-utils/path-utils';
import { CustomFunction } from '@ng-forge/dynamic-forms/internal';
import { evaluateCondition } from '@ng-forge/dynamic-forms/internal';
import { ExpressionParser } from '@ng-forge/dynamic-forms/internal';
import { getNestedValue } from '@ng-forge/dynamic-forms/internal';
import { resolveHttpRequest } from '@ng-forge/dynamic-forms/internal';
import { Logger } from '@ng-forge/dynamic-forms/internal';
import { PropertyDerivationEntry } from './property-derivation-types';
import { PropertyOverrideStore } from './property-override-store';

/**
 * Context required for creating HTTP property-derivation streams.
 *
 * @internal
 */
export interface HttpPropertyDerivationStreamContext {
  /** Signal containing the current form value */
  formValue: Signal<Record<string, unknown>>;

  /** The property override store to write into */
  store: PropertyOverrideStore;

  /** Angular HttpClient for making requests */
  httpClient: HttpClient;

  /** Logger for diagnostic output */
  logger: Logger;

  /** Lazy resolver for custom functions — called per-emission to get fresh values */
  customFunctions?: () => Record<string, CustomFunction> | undefined;

  /** Lazy resolver for external data — called per-emission to get fresh values */
  externalData?: () => Record<string, unknown> | undefined;
}

const LOG_PREFIX = 'HTTP Property Derivation -';
const DEFAULT_HTTP_DEBOUNCE_MS = 300;

/**
 * Creates an RxJS Observable stream that processes an HTTP property-derivation entry.
 *
 * @internal
 */
export function createHttpPropertyDerivationStream(
  entry: PropertyDerivationEntry,
  formValue$: Observable<Record<string, unknown>>,
  context: HttpPropertyDerivationStreamContext,
): Observable<void> {
  // Guard: no array support yet for HTTP property derivations (mirrors value pipeline).
  if (isArrayPlaceholderPath(entry.fieldKey)) {
    context.logger.warn(
      `${LOG_PREFIX} HTTP property derivation for array field '${entry.fieldKey}' is not supported. ` +
        `Array HTTP property derivations will be supported in a future release.`,
    );
    return EMPTY;
  }

  if (!entry.http || !entry.responseExpression) {
    return EMPTY;
  }

  const responseExpression = entry.responseExpression;
  const debounceMs = entry.debounceMs ?? DEFAULT_HTTP_DEBOUNCE_MS;

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
        const externalData = context.externalData?.();

        const fieldValue = getNestedValue(current, entry.fieldKey);

        const evalContext: EvaluationContext = {
          fieldValue,
          formValue: current,
          fieldPath: entry.fieldKey,
          customFunctions,
          externalData,
          logger: context.logger,
        };

        // Evaluate condition — skip if false
        if (entry.condition !== true) {
          const conditionMet = typeof entry.condition === 'boolean' ? entry.condition : evaluateCondition(entry.condition, evalContext);
          if (!conditionMet) {
            subscriber.complete();
            return;
          }
        }

        // Returns null when a path param is undefined — suppress the request
        const resolvedRequest = resolveHttpRequest(entry.http!, evalContext);
        if (!resolvedRequest) {
          subscriber.complete();
          return;
        }

        const method = (resolvedRequest.method ?? 'GET').toUpperCase();
        // Inner cancellation is handled declaratively by the orchestrator's
        // outer switchMap: when the entry set changes, the outer stream
        // unsubscribes from this inner observable, which triggers the
        // cleanup callback below and cancels the in-flight HTTP request.
        const httpSub = context.httpClient
          .request(method, resolvedRequest.url, {
            body: resolvedRequest.body,
            headers: resolvedRequest.headers as Record<string, string>,
          })
          .subscribe({
            next: (response) => {
              try {
                const newValue = ExpressionParser.evaluate(responseExpression, { response });

                // `setOverride` performs its own deep-equality check, so we don't need to
                // compare with the current store value here.
                untracked(() => context.store.setOverride(entry.fieldKey, entry.targetProperty, newValue));

                subscriber.complete();
              } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                context.logger.warn(`${LOG_PREFIX} Failed to process response for '${entry.fieldKey}.${entry.targetProperty}': ${message}`);
                subscriber.complete();
              }
            },
            error: (error) => {
              const message = error instanceof Error ? error.message : String(error);
              context.logger.warn(`${LOG_PREFIX} HTTP request failed for '${entry.fieldKey}.${entry.targetProperty}': ${message}`);
              subscriber.complete();
            },
          });

        return () => {
          httpSub.unsubscribe();
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
