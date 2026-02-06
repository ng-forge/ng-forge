import { DestroyRef, Injector, runInInjectionContext, Signal, Type } from '@angular/core';
import { catchError, forkJoin, from, map, Observable, of, OperatorFunction, pipe, scan, switchMap } from 'rxjs';
import { FieldDef } from '../../definitions/base/field-def';
import { FieldTypeDefinition } from '../../models/field-type';
import { mapFieldToInputs } from '../field-mapper/field-mapper';

/**
 * Resolved field ready for rendering with ngComponentOutlet.
 */
export interface ResolvedField {
  key: string;
  component: Type<unknown>;
  injector: Injector;
  inputs: Signal<Record<string, unknown>>;
}

/**
 * Context required to resolve a field.
 */
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
 * For componentless fields (e.g., hidden fields), returns undefined since
 * there's nothing to render. These fields still contribute to form values
 * through the form schema.
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

      // Fields with components should always have inputs (componentless fields are handled above)
      if (!inputs) {
        return undefined;
      }

      return {
        key: fieldDef.key,
        component,
        injector: context.injector,
        inputs,
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

/**
 * Context for synchronous field resolution when components are already cached.
 */
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
 * This is the fast path for fields whose components have already been loaded.
 * Returns undefined for componentless fields (e.g., hidden fields).
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

  if (!inputs) {
    return undefined;
  }

  return {
    key: fieldDef.key,
    component,
    injector: context.injector,
    inputs,
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
      // Truly unchanged - preserve object identity for signal stability
      return existing;
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
