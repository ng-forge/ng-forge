import { inject, Injector, signal, Signal, untracked } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FieldContext, LogicFn } from '@angular/forms/signals';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs';
import { ConditionalExpression } from '../../models/expressions/conditional-expression';
import { FieldContextRegistryService } from '../registry/field-context-registry.service';
import { FunctionRegistryService } from '../registry/function-registry.service';
import { evaluateCondition } from './condition-evaluator';

/**
 * Cache key combining both services to represent the injection context.
 */
interface InjectionContextKey {
  functionRegistry: FunctionRegistryService;
  fieldContextRegistry: FieldContextRegistryService;
}

/**
 * Cache for memoized logic functions, keyed by injection context.
 * Uses WeakMap with FunctionRegistryService as outer key to automatically clean up.
 * Inner structure: Map<FieldContextRegistryService, Map<expressionKey, LogicFn>>
 */
const logicFunctionCache = new WeakMap<
  FunctionRegistryService,
  WeakMap<FieldContextRegistryService, Map<string, LogicFn<unknown, boolean>>>
>();

/**
 * Serializes a value to a deterministic string for cache key generation.
 * Unlike JSON.stringify, this sorts object keys to ensure consistent output
 * regardless of property insertion order.
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
 * Serializes a conditional expression to a deterministic string key for caching.
 * Uses stable stringification to ensure equivalent objects produce the same key
 * regardless of property order.
 */
function serializeExpression(expression: ConditionalExpression): string {
  return stableStringify(expression);
}

/**
 * Gets or creates the cache map for a specific injection context.
 */
function getContextCache(ctx: InjectionContextKey): Map<string, LogicFn<unknown, boolean>> {
  let outerCache = logicFunctionCache.get(ctx.functionRegistry);
  if (!outerCache) {
    outerCache = new WeakMap();
    logicFunctionCache.set(ctx.functionRegistry, outerCache);
  }

  let innerCache = outerCache.get(ctx.fieldContextRegistry);
  if (!innerCache) {
    innerCache = new Map();
    outerCache.set(ctx.fieldContextRegistry, innerCache);
  }

  return innerCache;
}

/**
 * Create a logic function from a conditional expression.
 *
 * This function is used for creating logic functions for hidden, readonly, disabled, and required.
 * It uses the REACTIVE evaluation context, which allows the logic function to create
 * reactive dependencies on form values. When dependent fields change, the logic function
 * will be automatically re-evaluated.
 *
 * NOTE: For validators, use createEvaluationContext directly (with untracked) to prevent
 * infinite reactive loops. Validators with cross-field dependencies should be hoisted
 * to form-level using validateTree.
 *
 * @param expression The conditional expression to evaluate
 * @returns A LogicFn that evaluates the condition in the context of a field
 */
export function createLogicFunction<TValue>(expression: ConditionalExpression): LogicFn<TValue, boolean> {
  // Inject services during factory creation, not during execution
  const functionRegistry = inject(FunctionRegistryService);
  const fieldContextRegistry = inject(FieldContextRegistryService);

  // Get cache for this injection context
  const contextCache = getContextCache({ functionRegistry, fieldContextRegistry });

  // Generate cache key from serialized expression
  const cacheKey = serializeExpression(expression);

  // Check cache first
  const cached = contextCache.get(cacheKey);
  if (cached) {
    return cached as LogicFn<TValue, boolean>;
  }

  const fn: LogicFn<TValue, boolean> = (ctx: FieldContext<TValue>) => {
    // Create REACTIVE evaluation context for logic functions
    // This allows logic to re-evaluate when dependent fields change
    const evaluationContext = fieldContextRegistry.createReactiveEvaluationContext(ctx, functionRegistry.getCustomFunctions());

    return evaluateCondition(expression, evaluationContext);
  };

  // Cache the function
  contextCache.set(cacheKey, fn as LogicFn<unknown, boolean>);
  return fn;
}

/**
 * Cache for debounced logic functions.
 * Keyed by injection context similar to logicFunctionCache, but includes debounceMs in the key.
 */
const debouncedLogicFunctionCache = new WeakMap<
  FunctionRegistryService,
  WeakMap<FieldContextRegistryService, Map<string, LogicFn<unknown, boolean>>>
>();

/**
 * Gets or creates the cache map for debounced functions in a specific injection context.
 */
function getDebouncedContextCache(ctx: InjectionContextKey): Map<string, LogicFn<unknown, boolean>> {
  let outerCache = debouncedLogicFunctionCache.get(ctx.functionRegistry);
  if (!outerCache) {
    outerCache = new WeakMap();
    debouncedLogicFunctionCache.set(ctx.functionRegistry, outerCache);
  }

  let innerCache = outerCache.get(ctx.fieldContextRegistry);
  if (!innerCache) {
    innerCache = new Map();
    outerCache.set(ctx.fieldContextRegistry, innerCache);
  }

  return innerCache;
}

/**
 * Store for debounced signals per field context.
 * Uses WeakMap with FieldContext objects as keys to automatically clean up
 * when the context is garbage collected.
 */
const debouncedSignalStore = new WeakMap<
  FunctionRegistryService,
  WeakMap<object, { immediateValue: ReturnType<typeof signal<boolean>>; debouncedValue: Signal<boolean | undefined> }>
>();

/**
 * Gets or creates the debounced signal store for a function registry.
 */
function getDebouncedSignalStore(functionRegistry: FunctionRegistryService) {
  let store = debouncedSignalStore.get(functionRegistry);
  if (!store) {
    store = new WeakMap();
    debouncedSignalStore.set(functionRegistry, store);
  }
  return store;
}

/**
 * Create a debounced logic function from a conditional expression.
 *
 * This function wraps the condition evaluation in a debounce mechanism,
 * so state changes only take effect after the specified delay.
 * Useful for avoiding UI flicker during rapid typing.
 *
 * @param expression The conditional expression to evaluate
 * @param debounceMs The debounce duration in milliseconds
 * @returns A LogicFn that evaluates the condition with debouncing
 */
export function createDebouncedLogicFunction<TValue>(expression: ConditionalExpression, debounceMs: number): LogicFn<TValue, boolean> {
  // Inject services during factory creation, not during execution
  const functionRegistry = inject(FunctionRegistryService);
  const fieldContextRegistry = inject(FieldContextRegistryService);
  const injector = inject(Injector);

  // Get cache for this injection context
  const contextCache = getDebouncedContextCache({ functionRegistry, fieldContextRegistry });

  // Generate cache key including debounceMs
  const cacheKey = `${serializeExpression(expression)}:${debounceMs}`;

  // Check cache first
  const cached = contextCache.get(cacheKey);
  if (cached) {
    return cached as LogicFn<TValue, boolean>;
  }

  // Get or create the signal store for this context
  const signalStore = getDebouncedSignalStore(functionRegistry);

  const fn: LogicFn<TValue, boolean> = (ctx: FieldContext<TValue>) => {
    // Create a unique key using the context object itself as identifier
    // Since FieldContext doesn't have a path property, we use a WeakMap approach
    // by storing the debounced signal directly on the context
    const contextKey = ctx as unknown as object;
    let signalPair = signalStore.get(contextKey);

    if (!signalPair) {
      // Create a signal to hold the immediate evaluation result
      const immediateValue = signal(false);

      // Create a debounced signal using RxJS
      const immediateValue$ = toObservable(immediateValue, { injector }).pipe(
        debounceTime(debounceMs),
        distinctUntilChanged(),
        startWith(false),
      );

      const debouncedValue = toSignal(immediateValue$, { injector, initialValue: false });

      signalPair = { immediateValue, debouncedValue };
      signalStore.set(contextKey, signalPair);
    }

    // Create REACTIVE evaluation context for logic functions
    const evaluationContext = fieldContextRegistry.createReactiveEvaluationContext(ctx, functionRegistry.getCustomFunctions());

    // Evaluate the condition and update the immediate signal
    const result = evaluateCondition(expression, evaluationContext);

    // Update immediate value (this triggers the debounce chain)
    // signalPair is guaranteed to exist here due to the initialization above
    const { immediateValue, debouncedValue } = signalPair;
    untracked(() => {
      if (immediateValue() !== result) {
        immediateValue.set(result);
      }
    });

    // Return the debounced value
    return debouncedValue() ?? false;
  };

  // Cache the function
  contextCache.set(cacheKey, fn as LogicFn<unknown, boolean>);
  return fn;
}
