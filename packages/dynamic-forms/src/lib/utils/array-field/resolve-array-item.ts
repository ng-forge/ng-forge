import { DestroyRef, Injector, linkedSignal, Signal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { catchError, from, map, Observable, of } from 'rxjs';
import { ArrayField } from '../../definitions/default/array-field';
import { FieldDef } from '../../definitions/base/field-def';
import { FieldSignalContext } from '../../mappers/types';
import { FieldTypeDefinition } from '../../models/field-type';
import { createValueSnapshot, generateArrayItemId, getArrayValue, ResolvedArrayItem } from './array-field.types';
import { createArrayItemInjectorAndInputs } from './create-array-item-injector';

/**
 * Options for resolving an array item.
 */
export interface ResolveArrayItemOptions<TModel> {
  /** The field tree for this item (may be null for object items) */
  fieldTree: FieldTree<unknown> | null;
  /** The index of this item in the array */
  index: number;
  /** The field template for array items */
  template: FieldDef<unknown>;
  /** The array field definition */
  arrayField: ArrayField;
  /** Signal containing ordered item IDs for index derivation */
  itemOrderSignal: Signal<string[]>;
  /** The parent field signal context */
  parentFieldSignalContext: FieldSignalContext<TModel>;
  /** The parent injector */
  parentInjector: Injector;
  /** The field registry */
  registry: Map<string, FieldTypeDefinition>;
  /** DestroyRef to check if component is destroyed */
  destroyRef: DestroyRef;
  /** Function to load component for a field type */
  loadTypeComponent: (type: string) => Promise<unknown>;
}

/**
 * Resolves a single array item for declarative rendering.
 * Uses linkedSignal for the index, which automatically updates when itemOrderSignal changes.
 *
 * @param options - Configuration options for resolving the item
 * @returns Observable that emits the resolved item or undefined on error
 */
export function resolveArrayItem<TModel>(options: ResolveArrayItemOptions<TModel>): Observable<ResolvedArrayItem | undefined> {
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

      // Generate unique ID for this item using pure function
      const itemId = generateArrayItemId();

      // Create a linkedSignal that derives its index from itemOrderSignal
      // When itemOrderSignal is updated (e.g., items removed), this automatically updates
      const indexSignal = linkedSignal(() => {
        const order = itemOrderSignal();
        const idx = order.indexOf(itemId);
        return idx >= 0 ? idx : index; // Fallback to initial index if not yet in order
      });

      // Create the injector and inputs for this array item
      const { injector, inputs } = createArrayItemInjectorAndInputs({
        fieldTree,
        template,
        indexSignal,
        parentFieldSignalContext,
        parentInjector,
        registry,
        arrayField,
      });

      // Get current value for this item to create snapshot
      const currentValue = parentFieldSignalContext.value() as Partial<TModel>;
      const arrayValue = getArrayValue(currentValue, arrayField.key);
      const itemValue = arrayValue[index];

      return {
        id: itemId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component: component as any,
        injector,
        inputs,
        valueSnapshot: createValueSnapshot(itemValue),
      };
    }),
    catchError((error) => {
      if (!destroyRef.destroyed) {
        console.error(
          `[Dynamic Forms] Failed to load component for field type '${template.type}' at index ${index} ` +
            `within array '${arrayField.key}'. Ensure the field type is registered in your field registry.`,
          error,
        );
      }
      return of(undefined);
    }),
  );
}
