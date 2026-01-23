import { Injector, runInInjectionContext, Signal, untracked, linkedSignal } from '@angular/core';
import { FieldTree, form } from '@angular/forms/signals';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { ArrayField } from '../../definitions/default/array-field';
import { FieldDef } from '../../definitions/base/field-def';
import { ArrayContext, FieldSignalContext } from '../../mappers/types';
import { ARRAY_CONTEXT, FIELD_SIGNAL_CONTEXT } from '../../models/field-signal-context.token';
import { FieldTypeDefinition } from '../../models/field-type';
import { mapFieldToInputs } from '../field-mapper/field-mapper';
import { flattenFields } from '../flattener/field-flattener';
import { createSchemaFromFields } from '../../core/schema-builder';
import { getArrayValue } from './array-field.types';
import { isEqual } from '../object-utils';
import { EMPTY_OBJECT } from '../frozen-values';

/**
 * Options for creating an array item injector.
 */
export interface CreateArrayItemInjectorOptions<TModel extends Record<string, unknown>> {
  /** The field tree for this item (null for object items without existing FieldTree). */
  fieldTree: FieldTree<unknown> | null;
  /** The field template defining the array item structure. */
  template: FieldDef<unknown>;
  /** Signal containing the current index (uses linkedSignal for auto-updates). */
  indexSignal: Signal<number>;
  /** Parent context for accessing form state and values. */
  parentFieldSignalContext: FieldSignalContext<TModel>;
  /** Parent injector for creating scoped child injector. */
  parentInjector: Injector;
  /** Field registry for looking up field type definitions. */
  registry: Map<string, FieldTypeDefinition>;
  /** The array field definition containing this item. */
  arrayField: ArrayField;
}

/**
 * Result of creating an array item injector.
 */
export interface ArrayItemInjectorResult {
  /** Scoped injector providing ARRAY_CONTEXT and FIELD_SIGNAL_CONTEXT. */
  injector: Injector;
  /** Inputs signal for ngComponentOutlet, mapped from the field template. Undefined for componentless fields. */
  inputs: Signal<Record<string, unknown>> | undefined;
}

/**
 * Syncs item form value changes back to the parent form's array.
 * This effect watches the item form value and updates the parent array when changes occur.
 */
function syncItemToParent<TModel extends Record<string, unknown>>(
  itemFormInstance: ReturnType<typeof form<unknown>>,
  parentFieldSignalContext: FieldSignalContext<TModel>,
  arrayKey: string,
  indexSignal: Signal<number>,
  injector: Injector,
): void {
  // Track if we're currently syncing to prevent loops
  let isSyncing = false;

  runInInjectionContext(injector, () => {
    // The form instance is callable - call it to get the form state with .value()
    explicitEffect([() => itemFormInstance().value()], ([itemValue]) => {
      if (isSyncing) return;

      const parentForm = parentFieldSignalContext.form;
      const parentValue = untracked(() => parentForm().value()) as TModel;
      const currentArray = getArrayValue(parentValue as Partial<TModel>, arrayKey);
      const idx = untracked(() => indexSignal());

      // Only sync if value actually changed
      if (idx >= 0 && idx < currentArray.length && currentArray[idx] !== itemValue) {
        isSyncing = true;
        const newArray = [...currentArray];
        newArray[idx] = itemValue;
        // Update the parent form with the new array value
        // The `as any` is required due to Angular Signal Forms' complex conditional types
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        parentForm().value.set({ ...parentValue, [arrayKey]: newArray } as any);
        isSyncing = false;
      }
    });
  });
}

/**
 * Creates an injector and inputs for an array item.
 *
 * Handles different item types (flatten, group, regular) by creating appropriate
 * form references and scoped injectors with ARRAY_CONTEXT and FIELD_SIGNAL_CONTEXT.
 * Sets up two-way sync to propagate item form changes back to the parent form.
 */
export function createArrayItemInjectorAndInputs<TModel extends Record<string, unknown>>(
  options: CreateArrayItemInjectorOptions<TModel>,
): ArrayItemInjectorResult {
  const { fieldTree, template, indexSignal, parentFieldSignalContext, parentInjector, registry, arrayField } = options;

  // Create item form - uses linkedSignal that derives from parent
  const formRef =
    fieldTree ??
    createObjectItemForm({
      template,
      indexSignal,
      parentFieldSignalContext,
      parentInjector,
      registry,
      arrayKey: arrayField.key,
    });

  const injector = createItemInjector({
    formRef,
    indexSignal,
    parentFieldSignalContext,
    parentInjector,
    arrayField,
  });

  // Set up two-way sync: item form changes -> parent form array
  // Only sync for locally created forms (not external FieldTrees)
  if (!fieldTree) {
    syncItemToParent(formRef as ReturnType<typeof form<unknown>>, parentFieldSignalContext, arrayField.key, indexSignal, injector);
  }

  const inputs = runInInjectionContext(injector, () => {
    return mapFieldToInputs(template, registry);
  });

  return { injector, inputs };
}

interface CreateObjectItemFormOptions<TModel extends Record<string, unknown>> {
  template: FieldDef<unknown>;
  indexSignal: Signal<number>;
  parentFieldSignalContext: FieldSignalContext<TModel>;
  parentInjector: Injector;
  registry: Map<string, FieldTypeDefinition>;
  arrayKey: string;
}

/**
 * Creates a local form for an object array item using linkedSignal.
 * The linkedSignal derives from the parent array at the current index.
 *
 * For array items, we always create a form with a schema to ensure proper field structure.
 * This is needed for valueFieldMapper to find fields via bracket notation.
 */
function createObjectItemForm<TModel extends Record<string, unknown>>(
  options: CreateObjectItemFormOptions<TModel>,
): ReturnType<typeof form<unknown>> {
  const { template, indexSignal, parentFieldSignalContext, parentInjector, registry, arrayKey } = options;

  const itemEntity = linkedSignal(
    () => {
      const parentValue = parentFieldSignalContext.value();
      const arrayValue = getArrayValue(parentValue as Partial<TModel>, arrayKey);
      return arrayValue[indexSignal()] ?? EMPTY_OBJECT;
    },
    {
      equal: isEqual,
    },
  );

  const nestedFields = 'fields' in template && Array.isArray(template.fields) ? template.fields : [];

  return runInInjectionContext(parentInjector, () => {
    // Determine which fields to include in the schema
    // - If template has nested fields (e.g., row with children), use those
    // - Otherwise use the template itself as a single-field schema
    const schemaFields = nestedFields.length > 0 ? nestedFields : [template];
    const flattenedFields = flattenFields(schemaFields, registry);
    const schema = createSchemaFromFields(flattenedFields, registry);
    return untracked(() => form(itemEntity, schema));
  });
}

interface CreateItemInjectorOptions<TModel extends Record<string, unknown>> {
  formRef: FieldTree<unknown> | ReturnType<typeof form<unknown>>;
  indexSignal: Signal<number>;
  parentFieldSignalContext: FieldSignalContext<TModel>;
  parentInjector: Injector;
  arrayField: ArrayField;
}

/**
 * Creates a scoped injector for an array item.
 * Provides both FIELD_SIGNAL_CONTEXT (for form access) and ARRAY_CONTEXT (for position awareness).
 */
function createItemInjector<TModel extends Record<string, unknown>>(options: CreateItemInjectorOptions<TModel>): Injector {
  const { formRef, indexSignal, parentFieldSignalContext, parentInjector, arrayField } = options;

  const arrayContext: ArrayContext = {
    arrayKey: arrayField.key,
    index: indexSignal,
    formValue: parentFieldSignalContext.value(),
    field: arrayField,
  };

  const itemFieldSignalContext: FieldSignalContext<Record<string, unknown>> = {
    injector: undefined as unknown as Injector,
    value: parentFieldSignalContext.value,
    defaultValues: () => ({}),
    form: formRef as FieldTree<Record<string, unknown>>,
  };

  const injector = Injector.create({
    parent: parentInjector,
    providers: [
      { provide: FIELD_SIGNAL_CONTEXT, useValue: itemFieldSignalContext },
      { provide: ARRAY_CONTEXT, useValue: arrayContext },
    ],
  });

  itemFieldSignalContext.injector = injector;

  return injector;
}
