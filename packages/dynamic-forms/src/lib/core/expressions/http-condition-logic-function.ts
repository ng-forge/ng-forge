import { HttpClient } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { LogicFn } from '@angular/forms/signals';
import { catchError, map, of, tap } from 'rxjs';
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
import { createDebouncedResourceLogicFn } from './debounced-resource-logic-fn';

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
 * Delegates lifecycle (per-field signal store, debouncing, rxResource +
 * withPreviousValue) to {@link createDebouncedResourceLogicFn}; this function
 * just supplies the HTTP-specific bits: the trigger payload is the resolved
 * `HttpResourceRequest`, the stream fires the request, and the resolver
 * short-circuits via the response-cache before the resource gets touched.
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

  // Function cache: across-condition reuse for identical condition shapes.
  const cacheKey = stableStringify(condition);
  const cached = cacheService.httpConditionFunctionCache.get(cacheKey);
  if (cached) {
    return cached as LogicFn<TValue, boolean>;
  }

  const fn = createDebouncedResourceLogicFn<TValue, HttpResourceRequest, boolean>({
    pendingValue,
    debounceMs,
    injector,
    resolve: (ctx) => {
      const evaluationContext = fieldContextRegistry.createReactiveEvaluationContext(ctx, functionRegistry.getCustomFunctions());
      const resolved = resolveHttpRequest(condition.http, evaluationContext);
      // Hold the previous resolved value rather than flicker to pendingValue while a path
      // param is temporarily undefined between two valid states.
      if (!resolved) return { kind: 'holdPrevious' };

      const requestKey = stableStringify(resolved);
      const cachedResult = cache.get(requestKey);
      if (cachedResult !== undefined) return { kind: 'returnEarly', value: cachedResult };

      return { kind: 'trigger', key: requestKey, payload: resolved };
    },
    buildStream: (request) => {
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
    },
  });

  cacheService.httpConditionFunctionCache.set(cacheKey, fn as LogicFn<unknown, boolean>);
  return fn;
}
