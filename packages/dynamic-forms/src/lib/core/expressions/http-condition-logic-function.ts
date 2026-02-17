import { HttpClient } from '@angular/common/http';
import { inject, Injector, signal, Signal, untracked } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FieldContext, LogicFn } from '@angular/forms/signals';
import { catchError, debounceTime, distinctUntilChanged, filter, map, of, startWith, switchMap, tap } from 'rxjs';
import { HttpCondition } from '../../models/expressions/conditional-expression';
import { HttpResourceRequest } from '../validation/validator-types';
import { FieldContextRegistryService } from '../registry/field-context-registry.service';
import { FunctionRegistryService } from '../registry/function-registry.service';
import { HTTP_CONDITION_CACHE } from '../http/http-condition-cache';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import { Logger } from '../../providers/features/logger/logger.interface';
import { resolveHttpRequest } from '../http/http-request-resolver';
import { ExpressionParser } from './parser/expression-parser';

/**
 * Serializes a value to a deterministic string for cache key generation.
 * Sorts object keys to ensure consistent output regardless of property insertion order.
 */
function stableStringify(value: unknown): string {
  if (value === null || value === undefined) {
    return String(value);
  }

  if (typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return '[' + value.map(stableStringify).join(',') + ']';
  }

  const obj = value as Record<string, unknown>;
  const sortedKeys = Object.keys(obj).sort();
  const pairs = sortedKeys.map((key) => JSON.stringify(key) + ':' + stableStringify(obj[key]));
  return '{' + pairs.join(',') + '}';
}

/**
 * Per-field signal pair for HTTP condition resolution.
 * Created once per field context — LogicFn updates the resolvedRequest signal,
 * the pipeline reacts and updates resultValue.
 */
interface FieldSignalPair {
  resolvedRequest: ReturnType<typeof signal<HttpResourceRequest | undefined>>;
  resultValue: Signal<boolean>;
}

/**
 * Cache for HTTP condition logic functions, keyed by injection context.
 */
const httpConditionFunctionCache = new WeakMap<
  FunctionRegistryService,
  WeakMap<FieldContextRegistryService, Map<string, LogicFn<unknown, boolean>>>
>();

/**
 * Per-field signal store for HTTP condition resolution.
 */
const httpConditionSignalStore = new WeakMap<FunctionRegistryService, WeakMap<object, FieldSignalPair>>();

function getHttpConditionFunctionCache(
  functionRegistry: FunctionRegistryService,
  fieldContextRegistry: FieldContextRegistryService,
): Map<string, LogicFn<unknown, boolean>> {
  let outerCache = httpConditionFunctionCache.get(functionRegistry);
  if (!outerCache) {
    outerCache = new WeakMap();
    httpConditionFunctionCache.set(functionRegistry, outerCache);
  }

  let innerCache = outerCache.get(fieldContextRegistry);
  if (!innerCache) {
    innerCache = new Map();
    outerCache.set(fieldContextRegistry, innerCache);
  }

  return innerCache;
}

function getHttpConditionSignalStore(functionRegistry: FunctionRegistryService): WeakMap<object, FieldSignalPair> {
  let store = httpConditionSignalStore.get(functionRegistry);
  if (!store) {
    store = new WeakMap();
    httpConditionSignalStore.set(functionRegistry, store);
  }
  return store;
}

/**
 * Extracts a boolean from an HTTP response using an optional expression.
 * When `responseExpression` is provided, evaluates it with `{ response }` scope.
 * Otherwise, coerces the response to boolean.
 */
function extractBoolean(response: unknown, responseExpression: string | undefined): boolean {
  if (responseExpression) {
    const result = ExpressionParser.evaluate(responseExpression, { response });
    return !!result;
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
  const httpClient = inject(HttpClient);
  const functionRegistry = inject(FunctionRegistryService);
  const fieldContextRegistry = inject(FieldContextRegistryService);
  const injector = inject(Injector);
  const cache = inject(HTTP_CONDITION_CACHE);
  const logger = inject(DynamicFormLogger) as Logger;

  const pendingValue = condition.pendingValue ?? false;
  const cacheDurationMs = condition.cacheDurationMs ?? 30000;
  const debounceMs = condition.http.debounceMs ?? 300;

  // Check function cache
  const functionCache = getHttpConditionFunctionCache(functionRegistry, fieldContextRegistry);
  const cacheKey = stableStringify(condition);

  const cached = functionCache.get(cacheKey);
  if (cached) {
    return cached as LogicFn<TValue, boolean>;
  }

  const signalStore = getHttpConditionSignalStore(functionRegistry);

  const fn: LogicFn<TValue, boolean> = (ctx: FieldContext<TValue>) => {
    const contextKey = ctx as unknown as object;
    let signalPair = signalStore.get(contextKey);

    if (!signalPair) {
      const resolvedRequest = signal<HttpResourceRequest | undefined>(undefined);

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
            map((response) => extractBoolean(response, condition.responseExpression)),
            tap((value) => {
              const requestKey = stableStringify(request);
              cache.set(requestKey, value, cacheDurationMs);
            }),
            catchError((error) => {
              logger.warn('[Dynamic Forms] HTTP condition request failed:', error);
              return of(pendingValue);
            }),
          );
        }),
        startWith(pendingValue),
      );

      const resultValue = toSignal(pipeline, { injector, initialValue: pendingValue });

      signalPair = { resolvedRequest, resultValue };
      signalStore.set(contextKey, signalPair);
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

  functionCache.set(cacheKey, fn as LogicFn<unknown, boolean>);
  return fn;
}
