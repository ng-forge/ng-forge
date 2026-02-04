import { DestroyRef, Injector, linkedSignal, Signal, Type } from '@angular/core';
import { catchError, forkJoin, from, map, Observable, of } from 'rxjs';
import { ArrayField } from '../../definitions/default/array-field';
import { FieldDef } from '../../definitions/base/field-def';
import { FieldSignalContext } from '../../mappers/types';
import { FieldTypeDefinition } from '../../models/field-type';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import { ResolvedArrayItem, ResolvedArrayItemField } from './array-field.types';
import { createArrayItemInjectorAndInputs } from './create-array-item-injector';

/**
 * Options for resolving an array item.
 */
export interface ResolveArrayItemOptions<TModel extends Record<string, unknown>> {
  /** The initial index of this item in the array. */
  index: number;
  /** The field templates defining the array item structure (supports multiple sibling fields). */
  templates: FieldDef<unknown>[];
  /** The array field definition containing this item. */
  arrayField: ArrayField;
  /** Map signal for O(1) position lookup. Keys are item IDs, values are indices. */
  itemPositionMap: Signal<Map<string, number>>;
  /** Parent context for accessing form state and values. */
  parentFieldSignalContext: FieldSignalContext<TModel>;
  /** Parent injector for creating scoped child injector. */
  parentInjector: Injector;
  /** Field registry for looking up field type definitions. */
  registry: Map<string, FieldTypeDefinition>;
  /** DestroyRef to abort resolution if component is destroyed. */
  destroyRef: DestroyRef;
  /**
   * Function to async load the component for the field type.
   * Returns undefined for componentless fields (e.g., hidden fields).
   */
  loadTypeComponent: (type: string) => Promise<Type<unknown> | undefined>;
  /**
   * Function to generate unique item IDs. Scoped to the array component instance
   * to ensure SSR hydration compatibility (server and client generate same IDs).
   */
  generateItemId: () => string;
}

/**
 * Resolves a single array item with all its fields for declarative rendering.
 *
 * Uses linkedSignal for the index, which automatically updates when itemOrderSignal changes.
 * This enables position-aware updates without recreating components when items are reordered.
 * Supports multiple sibling templates (e.g., name + email without a wrapper).
 */
export function resolveArrayItem<TModel extends Record<string, unknown>>(
  options: ResolveArrayItemOptions<TModel>,
): Observable<ResolvedArrayItem | undefined> {
  const {
    index,
    templates,
    arrayField,
    itemPositionMap,
    parentFieldSignalContext,
    parentInjector,
    registry,
    destroyRef,
    loadTypeComponent,
    generateItemId,
  } = options;

  if (templates.length === 0) {
    return of(undefined);
  }

  // Generate ONE id for this array item (shared by all fields for tracking)
  const itemId = generateItemId();

  // O(1) position lookup via Map instead of O(n) indexOf()
  const indexSignal = linkedSignal(() => {
    const positionMap = itemPositionMap();
    return positionMap.get(itemId) ?? index;
  });

  // Resolve all templates in parallel
  const fieldObservables = templates.map((template) =>
    from(loadTypeComponent(template.type)).pipe(
      map((component): ResolvedArrayItemField | undefined => {
        if (destroyRef.destroyed) {
          return undefined;
        }

        // Componentless fields (e.g., hidden) return undefined - nothing to render
        if (!component) {
          return undefined;
        }

        const { injector, inputs } = createArrayItemInjectorAndInputs({
          template,
          indexSignal,
          parentFieldSignalContext,
          parentInjector,
          registry,
          arrayField,
        });

        // Array item templates should always have inputs (componentless fields are handled above)
        if (!inputs) {
          return undefined;
        }

        return {
          component,
          injector,
          inputs,
        };
      }),
      catchError((error) => {
        if (!destroyRef.destroyed) {
          const logger = parentInjector.get(DynamicFormLogger);
          logger.error(
            `Failed to load component for field type '${template.type}' at index ${index} ` +
              `within array '${arrayField.key}'. Ensure the field type is registered in your field registry.`,
            error,
          );
        }
        return of(undefined);
      }),
    ),
  );

  return forkJoin(fieldObservables).pipe(
    map((fields) => {
      const validFields = fields.filter((f): f is ResolvedArrayItemField => f !== undefined);

      // If no fields resolved, return undefined
      if (validFields.length === 0) {
        return undefined;
      }

      return {
        id: itemId,
        fields: validFields,
      };
    }),
  );
}
