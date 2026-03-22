import { HttpClient } from '@angular/common/http';
import { inject, Injector, Resource, resource, signal, untracked, WritableSignal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FieldContext, LogicFn } from '@angular/forms/signals';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { HttpCondition } from '../../models/expressions/conditional-expression';
import { stableStringify } from '../../utils/stable-stringify';
import { HttpResourceRequest } from '../validation/validator-types';
import { FieldContextRegistryService } from '../registry/field-context-registry.service';
import { FunctionRegistryService } from '../registry/function-registry.service';
import { HTTP_CONDITION_CACHE } from '../http/http-condition-cache';
import { DynamicFormError } from '../../errors/dynamic-form-error';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import { Logger } from '../../providers/features/logger/logger.interface';
import { resolveHttpRequest } from '../http/http-request-resolver';
import { ExpressionParser } from './parser/expression-parser';
import { HttpConditionFunctionCacheService } from './http-condition-function-cache.service';
import { safeReadPathKeys } from '../../utils/safe-read-path-keys';
import { withPreviousValue } from '../../utils/resource-composition/with-previous-value';

/**
 * Extracts a boolean from an HTTP response using an optional expression.
 * When `responseExpression` is provided, evaluates it with `{ response }` scope.
 * Truthy values are treated as `true` — non-boolean results trigger a warning to encourage explicit boolean expressions.
 * Otherwise, coerces the response to boolean.
 */
function extractBoolean(response: unknown, responseExpression: string | undefined, pendingValue: boolean, logger: Logger): boolean {
  if (responseExpression) {
    try {
      const result = ExpressionParser.evaluate(responseExpression, { response });
      if (typeof result !== 'boolean') {
        logger.warn(
          `responseExpression "${responseExpression}" returned non-boolean value:`,
          result,
          'Consider returning a boolean explicitly.',
        );
      }
      return !!result;
    } catch (error) {
      logger.warn(`Failed to evaluate responseExpression '${responseExpression}':`, error);
      return pendingValue;
    }
  }
  return !!response;
}

/**
 * Creates a logic function for an HTTP condition.
 *
 * Uses Angular's `resource()` API with snapshot composition for async resolution:
 * the LogicFn updates a `resolvedRequest` signal, a debounced version feeds into
 * a `resource()` that manages the HTTP lifecycle, and `withPreviousValue()` preserves
 * the last resolved boolean during re-fetching to prevent UI flicker.
 *
 * Must be called in injection context (same as `createLogicFunction`).
 */
export function createHttpConditionLogicFunction<TValue>(condition: HttpCondition): LogicFn<TValue, boolean> {
  const httpClient = inject(HttpClient, { optional: true });
  if (!httpClient) {
    throw new DynamicFormError('HttpClient is required for HTTP conditions. Add provideHttpClient() to your providers.');
  }
  const fieldContextRegistry = inject(FieldContextRegistryService);
  const functionRegistry = inject(FunctionRegistryService);
  const injector = inject(Injector);
  const cache = inject(HTTP_CONDITION_CACHE);
  const logger = inject(DynamicFormLogger) as Logger;
  const cacheService = inject(HttpConditionFunctionCacheService);

  const pendingValue = condition.pendingValue ?? false;
  const cacheDurationMs = condition.cacheDurationMs ?? 30000;
  const debounceMs = condition.debounceMs ?? 300;

  // Check function cache
  const cacheKey = stableStringify(condition);

  const cached = cacheService.httpConditionFunctionCache.get(cacheKey);
  if (cached) {
    return cached as LogicFn<TValue, boolean>;
  }

  // Each condition needs its own per-field signal store. A shared store would collide
  // when multiple HTTP conditions exist on the same field (same FieldContext / path).
  const perFunctionSignalStore = new Map<
    string,
    { resolvedRequest: WritableSignal<HttpResourceRequest | undefined>; resultResource: Resource<boolean> }
  >();

  const fn: LogicFn<TValue, boolean> = (ctx: FieldContext<TValue>) => {
    const contextKey = safeReadPathKeys(ctx as FieldContext<unknown>).join('.');
    let signalPair = perFunctionSignalStore.get(contextKey);

    if (!signalPair) {
      const resolvedRequest = signal<HttpResourceRequest | undefined>(undefined);

      // Wrap in untracked() to avoid NG0602: resource() internally creates effects,
      // which cannot be created inside a reactive context (computed). The LogicFn runs
      // inside Angular Signal Forms' BooleanOrLogic.compute (a computed), so we must
      // clear the active reactive consumer before creating the resource pipeline.
      const resultResource = untracked(() => {
        // Create a debounced, stabilized version of the request signal.
        // This prevents rapid re-fetches when form values change quickly.
        const debouncedRequest = toSignal(
          toObservable(resolvedRequest, { injector }).pipe(
            debounceTime(debounceMs),
            distinctUntilChanged((prev, curr) => stableStringify(prev) === stableStringify(curr)),
          ),
          { injector },
        );

        // resource() manages the HTTP lifecycle: auto-cancellation via AbortSignal,
        // loading/resolved/error status tracking, and signal-based reactivity.
        const httpResource = resource({
          params: () => debouncedRequest() ?? undefined,
          // When params() returns undefined, resource() enters idle state and skips the loader.
          loader: ({ params: request, abortSignal }) => {
            const method = request.method ?? 'GET';
            const options: Record<string, unknown> = {};
            if (request.body) options['body'] = request.body;
            if (request.headers) options['headers'] = request.headers;

            return new Promise<boolean>((resolve) => {
              const sub = httpClient.request(method, request.url, options).subscribe({
                next: (response) => {
                  const result = extractBoolean(response, condition.responseExpression, pendingValue, logger);
                  const requestKey = stableStringify(request);
                  cache.set(requestKey, result, cacheDurationMs);
                  resolve(result);
                },
                error: (error) => {
                  logger.warn('HTTP condition request failed:', error);
                  resolve(pendingValue);
                },
                // Resolve on complete without emission (e.g., empty response body)
                // to prevent the Promise from hanging indefinitely.
                complete: () => resolve(pendingValue),
              });

              // Cancel the HTTP request when the resource aborts (params changed or destroyed)
              abortSignal.addEventListener('abort', () => sub.unsubscribe());
            });
          },
          defaultValue: pendingValue,
          injector,
        });

        // Snapshot composition: preserve the previous boolean result during re-fetching.
        // Without this, the condition would briefly flash to pendingValue when params change,
        // causing visible UI flicker (e.g., a conditionally visible field briefly disappearing).
        return withPreviousValue(httpResource);
      });

      signalPair = { resolvedRequest, resultResource };
      perFunctionSignalStore.set(contextKey, signalPair);
    }

    // Build reactive evaluation context (creates signal dependencies on form values)
    const evaluationContext = fieldContextRegistry.createReactiveEvaluationContext(ctx, functionRegistry.getCustomFunctions());

    // Returns null when a path param is undefined — skip the request and return pending value
    const resolved = resolveHttpRequest(condition.http, evaluationContext);
    if (!resolved) {
      return signalPair.resultResource.value();
    }
    const requestKey = stableStringify(resolved);

    // Check response cache first
    const cachedResult = cache.get(requestKey);
    if (cachedResult !== undefined) {
      return cachedResult;
    }

    // Update the resolved request signal (triggers resource if request changed)
    const { resolvedRequest, resultResource } = signalPair;
    untracked(() => {
      const current = resolvedRequest();
      if (stableStringify(current) !== requestKey) {
        resolvedRequest.set(resolved);
      }
    });

    return resultResource.value();
  };

  cacheService.httpConditionFunctionCache.set(cacheKey, fn as LogicFn<unknown, boolean>);
  return fn;
}
