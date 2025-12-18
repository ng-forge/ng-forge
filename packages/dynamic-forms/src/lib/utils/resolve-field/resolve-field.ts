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
  /** The field registry to load components from */
  loadTypeComponent: (type: string) => Promise<Type<unknown>>;
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
 * @returns Observable that emits ResolvedField or undefined on error
 */
export function resolveField(fieldDef: FieldDef<unknown>, context: ResolveFieldContext): Observable<ResolvedField | undefined> {
  return from(context.loadTypeComponent(fieldDef.type)).pipe(
    map((component) => {
      // Check if component is destroyed before proceeding
      if (context.destroyRef.destroyed) {
        return undefined;
      }

      // Run mapper in injection context
      const inputs = runInInjectionContext(context.injector, () => mapFieldToInputs(fieldDef, context.registry));

      return {
        key: fieldDef.key,
        component,
        injector: context.injector,
        inputs,
      };
    }),
    catchError((error) => {
      // Only handle errors if component hasn't been destroyed
      if (!context.destroyRef.destroyed) {
        context.onError?.(fieldDef, error);
      }
      return of(undefined);
    }),
  );
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

    if (existing && existing.component === field.component) {
      // Same key & type - reuse existing injector, update inputs
      return {
        ...field,
        injector: existing.injector,
      };
    }

    // New field or type changed - use new injector
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
