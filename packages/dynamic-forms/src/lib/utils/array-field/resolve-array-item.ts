import { DestroyRef, Injector, linkedSignal, Signal, Type } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { catchError, forkJoin, from, map, Observable, of } from 'rxjs';
import { ArrayField } from '../../definitions/default/array-field';
import { FieldDef } from '../../definitions/base/field-def';
import { FieldSignalContext } from '../../mappers/types';
import { FieldTypeDefinition } from '../../models/field-type';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import { generateArrayItemId, ResolvedArrayItem, ResolvedArrayItemField } from './array-field.types';
import { createArrayItemInjectorAndInputs } from './create-array-item-injector';

/**
 * Options for resolving an array item.
 */
export interface ResolveArrayItemOptions<TModel extends Record<string, unknown>> {
  /** The field tree for this item (null for object items). */
  fieldTree: FieldTree<unknown> | null;
  /** The initial index of this item in the array. */
  index: number;
  /** The field templates defining the array item structure (supports multiple sibling fields). */
  templates: FieldDef<unknown>[];
  /** The array field definition containing this item. */
  arrayField: ArrayField;
  /** Signal containing ordered item IDs for reactive index derivation. */
  itemOrderSignal: Signal<string[]>;
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
   * Optional explicit default value for new items added via events (append, prepend, insert).
   * When provided, this value is used instead of reading from the parent array.
   * This is necessary because when adding items, the parent array hasn't been updated yet.
   */
  explicitDefaultValue?: unknown;
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
    fieldTree,
    index,
    templates,
    arrayField,
    itemOrderSignal,
    parentFieldSignalContext,
    parentInjector,
    registry,
    destroyRef,
    loadTypeComponent,
    explicitDefaultValue,
  } = options;

  if (templates.length === 0) {
    return of(undefined);
  }

  // Generate ONE id for this array item (shared by all fields for tracking)
  const itemId = generateArrayItemId();

  const indexSignal = linkedSignal(() => {
    const order = itemOrderSignal();
    const idx = order.indexOf(itemId);
    return idx >= 0 ? idx : index;
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
          fieldTree,
          template,
          indexSignal,
          parentFieldSignalContext,
          parentInjector,
          registry,
          arrayField,
          explicitDefaultValue,
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
