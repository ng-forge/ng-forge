import { DestroyRef, Injector, linkedSignal, Signal, Type } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { catchError, from, map, Observable, of } from 'rxjs';
import { ArrayField } from '../../definitions/default/array-field';
import { FieldDef } from '../../definitions/base/field-def';
import { FieldSignalContext } from '../../mappers/types';
import { FieldTypeDefinition } from '../../models/field-type';
import { DYNAMIC_FORM_LOGGER } from '../../providers/features/logger/logger.token';
import { generateArrayItemId, ResolvedArrayItem } from './array-field.types';
import { createArrayItemInjectorAndInputs } from './create-array-item-injector';

/**
 * Options for resolving an array item.
 */
export interface ResolveArrayItemOptions<TModel extends Record<string, unknown>> {
  /** The field tree for this item (null for object items). */
  fieldTree: FieldTree<unknown> | null;
  /** The initial index of this item in the array. */
  index: number;
  /** The field template defining the array item structure. */
  template: FieldDef<unknown>;
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
  /** Function to async load the component for the field type. */
  loadTypeComponent: (type: string) => Promise<unknown>;
}

/**
 * Resolves a single array item for declarative rendering.
 *
 * Uses linkedSignal for the index, which automatically updates when itemOrderSignal changes.
 * This enables position-aware updates without recreating components when items are reordered.
 */
export function resolveArrayItem<TModel extends Record<string, unknown>>(
  options: ResolveArrayItemOptions<TModel>,
): Observable<ResolvedArrayItem | undefined> {
  const {
    fieldTree,
    index,
    template,
    arrayField,
    itemOrderSignal,
    parentFieldSignalContext,
    parentInjector,
    registry,
    destroyRef,
    loadTypeComponent,
  } = options;

  return from(loadTypeComponent(template.type)).pipe(
    map((component) => {
      if (destroyRef.destroyed) {
        return undefined;
      }

      const itemId = generateArrayItemId();

      const indexSignal = linkedSignal(() => {
        const order = itemOrderSignal();
        const idx = order.indexOf(itemId);
        return idx >= 0 ? idx : index;
      });

      const { injector, inputs } = createArrayItemInjectorAndInputs({
        fieldTree,
        template,
        indexSignal,
        parentFieldSignalContext,
        parentInjector,
        registry,
        arrayField,
      });

      return {
        id: itemId,
        component: component as Type<unknown>,
        injector,
        inputs,
      };
    }),
    catchError((error) => {
      if (!destroyRef.destroyed) {
        const logger = parentInjector.get(DYNAMIC_FORM_LOGGER);
        logger.error(
          `Failed to load component for field type '${template.type}' at index ${index} ` +
            `within array '${arrayField.key}'. Ensure the field type is registered in your field registry.`,
          error,
        );
      }
      return of(undefined);
    }),
  );
}
