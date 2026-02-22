import { HttpClient } from '@angular/common/http';
import { inject, Injector, Signal, WritableSignal, signal, untracked } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FieldContext, LogicFn } from '@angular/forms/signals';
import { catchError, debounceTime, distinctUntilChanged, filter, map, of, startWith, switchMap, tap } from 'rxjs';
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

/**
 * Extracts a boolean from an HTTP response using an optional expression.
 * When `responseExpression` is provided, evaluates it with `{ response }` scope.
 * Otherwise, coerces the response to boolean.
 */
function extractBoolean(response: unknown, responseExpression: string | undefined, pendingValue: boolean, logger: Logger): boolean {
  if (responseExpression) {
    try {
      const result = ExpressionParser.evaluate(responseExpression, { response });
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
 * Uses a signal-based async resolution pattern: the LogicFn updates a `resolvedRequest` signal,
 * a reactive pipeline fetches the response and updates a `resultValue` signal.
 * The LogicFn returns the current `resultValue()`, which starts as `pendingValue` and
 * transitions to the actual HTTP result.
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
    { resolvedRequest: WritableSignal<HttpResourceRequest | undefined>; resultValue: Signal<boolean> }
  >();

  const fn: LogicFn<TValue, boolean> = (ctx: FieldContext<TValue>) => {
    const contextKey = safeReadPathKeys(ctx as FieldContext<unknown>).join('.');
    let signalPair = perFunctionSignalStore.get(contextKey);

    if (!signalPair) {
      const resolvedRequest = signal<HttpResourceRequest | undefined>(undefined);

      // Wrap in untracked() to avoid NG0602: toObservable() internally calls effect(),
      // which cannot be created inside a reactive context (computed). The LogicFn runs
      // inside Angular Signal Forms' BooleanOrLogic.compute (a computed), so we must
      // clear the active reactive consumer before creating the observable pipeline.
      const resultValue = untracked(() => {
        const pipeline = toObservable(resolvedRequest, { injector }).pipe(
          debounceTime(debounceMs),
          distinctUntilChanged((prev, curr) => stableStringify(prev) === stableStringify(curr)),
          filter((request): request is HttpResourceRequest => request !== undefined),
          switchMap((request) => {
            const method = request.method ?? 'GET';
            const options: Record<string, unknown> = {};
            if (request.body) options['body'] = request.body;
            if (request.headers) options['headers'] = request.headers;

            return httpClient.request(method, request.url, options).pipe(
              map((response) => extractBoolean(response, condition.responseExpression, pendingValue, logger)),
              tap((value) => {
                const requestKey = stableStringify(request);
                cache.set(requestKey, value, cacheDurationMs);
              }),
              catchError((error) => {
                logger.warn('HTTP condition request failed:', error);
                return of(pendingValue);
              }),
            );
          }),
          startWith(pendingValue),
        );

        return toSignal(pipeline, { injector, initialValue: pendingValue });
      });

      signalPair = { resolvedRequest, resultValue };
      perFunctionSignalStore.set(contextKey, signalPair);
    }

    // Build reactive evaluation context (creates signal dependencies on form values)
    const evaluationContext = fieldContextRegistry.createReactiveEvaluationContext(ctx, functionRegistry.getCustomFunctions());

    // Resolve the HTTP request config into a concrete request
    const resolved = resolveHttpRequest(condition.http, evaluationContext);
    const requestKey = stableStringify(resolved);

    // Check response cache first
    const cachedResult = cache.get(requestKey);
    if (cachedResult !== undefined) {
      return cachedResult;
    }

    // Update the resolved request signal (triggers pipeline if request changed)
    const { resolvedRequest, resultValue } = signalPair;
    untracked(() => {
      const current = resolvedRequest();
      if (stableStringify(current) !== requestKey) {
        resolvedRequest.set(resolved);
      }
    });

    return resultValue();
  };

  cacheService.httpConditionFunctionCache.set(cacheKey, fn as LogicFn<unknown, boolean>);
  return fn;
}
