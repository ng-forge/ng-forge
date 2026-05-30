import { computed, DestroyRef, Injector, runInInjectionContext, Signal, Type } from '@angular/core';
import type { FieldTree } from '@angular/forms/signals';
import { catchError, forkJoin, from, map, Observable, of, OperatorFunction, pipe, scan, switchMap } from 'rxjs';
import { FieldDef } from '@ng-forge/dynamic-forms/internal';
import { FieldTypeDefinition } from '@ng-forge/dynamic-forms/internal';
import { mapFieldToInputs } from '../field-mapper/field-mapper';

/** Resolved field ready for rendering with ngComponentOutlet / DfFieldOutlet. */
export interface ResolvedField {
  key: string;
  /** The original field definition (used by DfFieldOutlet to resolve wrappers). */
  fieldDef: FieldDef<unknown>;
  component: Type<unknown>;
  injector: Injector;
  inputs: Signal<Record<string, unknown>>;
  renderReady: Signal<boolean>;
  /**
   * Whether the field is currently hidden. Sourced from the FieldTree's
   * `state.hidden()` for value-bearing fields (set by Angular Signal Forms in
   * response to `hidden(path, …)` calls), or from the mapper's explicit
   * `hidden` input for non-value fields (button, text, container, …). Consumers
   * must `@if (!field.hidden())` around `*dfFieldOutlet` so hidden fields are
   * removed from the DOM — Angular Signal Forms warns (NG01916) otherwise.
   */
  hidden: Signal<boolean>;
}

export function createRenderReadySignal(
  inputs: Signal<Record<string, unknown>>,
  definition: FieldTypeDefinition | undefined,
): Signal<boolean> {
  const explicitRenderReadyWhen = definition?.renderReadyWhen;
  const requiredInputs = definition?.mapper && explicitRenderReadyWhen === undefined ? ['field'] : (explicitRenderReadyWhen ?? []);

  if (requiredInputs.length === 0) {
    return computed(() => true);
  }

  return computed(() => {
    const currentInputs = inputs();
    return requiredInputs.every((inputName) => currentInputs[inputName] !== undefined);
  });
}

/**
 * Reads the current hidden state from mapper inputs. Uniform across all field
 * types — value-bearing leaves source from the `FieldTree`'s `state.hidden()`
 * (where Angular Signal Forms cascades `hidden(path, …)`), and non-field outputs
 * (button/text/containers) source from the mapper's explicit `inputs.hidden`.
 */
export function createHiddenSignal(inputs: Signal<Record<string, unknown>>): Signal<boolean> {
  return computed(() => {
    const currentInputs = inputs();
    const fieldCandidate = currentInputs['field'];
    // Value-bearing leaves expose `field` as a callable `FieldTree` whose invocation returns a
    // `FieldState` with a `hidden` accessor. `isSignal()` doesn't recognise the Proxy-wrapped
    // FieldTree (no SIGNAL symbol), so we duck-type the shape and call `state.hidden()` directly.
    if (typeof fieldCandidate === 'function') {
      const state = (fieldCandidate as FieldTree<unknown>)();
      if (state && typeof state.hidden === 'function') {
        return state.hidden() === true;
      }
    }
    // Non-value fields (button, text, containers) carry an explicit `hidden` input set by
    // `applyHiddenLogic` based on the mapper-side evaluation.
    return currentInputs['hidden'] === true;
  });
}

/** Context required to resolve a field. */
export interface ResolveFieldContext {
  /**
   * The field registry to load components from.
   * Returns undefined for componentless fields (e.g., hidden fields).
   */
  loadTypeComponent: (type: string) => Promise<Type<unknown> | undefined>;
  /** The raw field registry map for mappers */
  registry: Map<string, FieldTypeDefinition>;
  /** The injector to use for the resolved field */
  injector: Injector;
  /** DestroyRef to check if component is destroyed */
  destroyRef: DestroyRef;
  /** Optional error handler for logging */
  onError?: (fieldDef: FieldDef<unknown>, error: unknown) => void;
}

/**
 * Resolves a single field definition to a ResolvedField using RxJS.
 * Loads the component asynchronously and maps inputs in the injection context.
 *
 * @param fieldDef - The field definition to resolve
 * @param context - The context containing dependencies for resolution
 * @returns Observable that emits ResolvedField or undefined (for componentless fields or on error)
 */
export function resolveField(fieldDef: FieldDef<unknown>, context: ResolveFieldContext): Observable<ResolvedField | undefined> {
  return from(context.loadTypeComponent(fieldDef.type)).pipe(
    map((component) => {
      // Check if component is destroyed before proceeding
      if (context.destroyRef.destroyed) {
        return undefined;
      }

      // Componentless fields (e.g., hidden) return undefined - nothing to render
      if (!component) {
        return undefined;
      }

      // Run mapper in injection context
      const inputs = runInInjectionContext(context.injector, () => mapFieldToInputs(fieldDef, context.registry));
      const definition = context.registry.get(fieldDef.type);

      // Fields with components should always have inputs (componentless fields are handled above)
      if (!inputs) {
        return undefined;
      }

      return {
        key: fieldDef.key,
        fieldDef,
        component,
        injector: context.injector,
        inputs,
        renderReady: createRenderReadySignal(inputs, definition),
        hidden: createHiddenSignal(inputs),
      };
    }),
    catchError((error) => {
      // Only call onError if component is not destroyed to avoid accessing cleaned-up state
      if (!context.destroyRef.destroyed) {
        context.onError?.(fieldDef, error);
      }
      return of(undefined);
    }),
  );
}

/** Context for synchronous field resolution when components are already cached. */
export interface SyncResolveFieldContext {
  /** Returns a previously loaded component, or undefined if not cached */
  getLoadedComponent: (type: string) => Type<unknown> | undefined;
  /** The raw field registry map for mappers */
  registry: Map<string, FieldTypeDefinition>;
  /** The injector to use for the resolved field */
  injector: Injector;
}

/**
 * Synchronously resolves a field definition to a ResolvedField using cached components.
 *
 * @param fieldDef - The field definition to resolve
 * @param context - The context containing cached components and dependencies
 * @returns ResolvedField or undefined (for componentless fields)
 */
export function resolveFieldSync(fieldDef: FieldDef<unknown>, context: SyncResolveFieldContext): ResolvedField | undefined {
  const component = context.getLoadedComponent(fieldDef.type);

  if (!component) {
    return undefined;
  }

  const inputs = runInInjectionContext(context.injector, () => mapFieldToInputs(fieldDef, context.registry));
  const definition = context.registry.get(fieldDef.type);

  if (!inputs) {
    return undefined;
  }

  return {
    key: fieldDef.key,
    fieldDef,
    component,
    injector: context.injector,
    inputs,
    renderReady: createRenderReadySignal(inputs, definition),
    hidden: createHiddenSignal(inputs),
  };
}

/**
 * Reconciles previous and current resolved fields to preserve injector instances
 * for fields that haven't changed type, preventing unnecessary component recreation.
 *
 * @param prev - Previous resolved fields array
 * @param curr - Current resolved fields array
 * @returns Reconciled fields with preserved injectors where applicable
 */
export function reconcileFields(prev: ResolvedField[], curr: ResolvedField[]): ResolvedField[] {
  const prevMap = new Map(prev.map((f) => [f.key, f]));

  return curr.map((field) => {
    const existing = prevMap.get(field.key);

    if (existing && existing.component === field.component && existing.injector === field.injector) {
      if (existing.fieldDef === field.fieldDef) {
        // Truly unchanged - preserve object identity for signal stability
        return existing;
      }

      // Same component instance + injector, but the field definition changed.
      // Preserve component identity (so ngComponentOutlet keeps the same instance)
      // while swapping in the freshly-mapped inputs/renderReady/hidden signals
      // so prop updates (e.g. select options) reach the component.
      return {
        ...existing,
        fieldDef: field.fieldDef,
        inputs: field.inputs,
        renderReady: field.renderReady,
        hidden: field.hidden,
      };
    }

    // New field, type changed, or context changed (new injector) - use new field
    return field;
  });
}

/**
 * Creates an RxJS pipe for resolving field definitions to rendered components.
 * Used by container components (page, group) to resolve their child fields.
 */
export function createFieldResolutionPipe(getContext: () => ResolveFieldContext): OperatorFunction<FieldDef<unknown>[], ResolvedField[]> {
  return pipe(
    switchMap((fields) => {
      if (!fields || fields.length === 0) {
        return of([] as (ResolvedField | undefined)[]);
      }
      const context = getContext();
      return forkJoin(fields.map((f) => resolveField(f, context)));
    }),
    map((fields) => fields.filter((f): f is ResolvedField => f !== undefined)),
    scan(reconcileFields, [] as ResolvedField[]),
  );
}
