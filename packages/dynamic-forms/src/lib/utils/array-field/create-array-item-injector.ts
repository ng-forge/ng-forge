import { Injector, runInInjectionContext, Signal, untracked, linkedSignal } from '@angular/core';
import { FieldTree, form } from '@angular/forms/signals';
import { ArrayField } from '../../definitions/default/array-field';
import { FieldDef } from '../../definitions/base/field-def';
import { ArrayContext, FieldSignalContext } from '../../mappers/types';
import { ARRAY_CONTEXT, FIELD_SIGNAL_CONTEXT } from '../../models/field-signal-context.token';
import { FieldTypeDefinition } from '../../models/field-type';
import { mapFieldToInputs } from '../field-mapper/field-mapper';
import { flattenFields } from '../flattener/field-flattener';
import { createSchemaFromFields } from '../../core/schema-builder';
import { getArrayValue } from './array-field.types';
import { getChildFieldTree } from '../form-internals/form-internals';

/**
 * Options for creating an array item injector.
 */
export interface CreateArrayItemInjectorOptions<TModel> {
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
  /** Inputs signal for ngComponentOutlet, mapped from the field template. */
  inputs: Signal<Record<string, unknown>>;
}

/**
 * Tries to get the nested FieldTree from the parent form for this array item.
 * This allows child fields to update the parent form directly.
 */
function getNestedItemFieldTree<TModel>(
  parentFieldSignalContext: FieldSignalContext<TModel>,
  arrayKey: string,
  index: number,
): FieldTree<unknown> | null {
  // First get the array FieldTree from parent
  const arrayFieldTree = getChildFieldTree(parentFieldSignalContext.form(), arrayKey);
  if (!arrayFieldTree) return null;

  // Then get the item's FieldTree using stringified index
  return getChildFieldTree(arrayFieldTree, String(index));
}

/**
 * Creates an injector and inputs for an array item.
 *
 * Handles different item types (flatten, group, regular) by creating appropriate
 * form references and scoped injectors with ARRAY_CONTEXT and FIELD_SIGNAL_CONTEXT.
 * Prefers using the parent form's nested FieldTree to ensure changes propagate directly.
 */
export function createArrayItemInjectorAndInputs<TModel>(options: CreateArrayItemInjectorOptions<TModel>): ArrayItemInjectorResult {
  const { fieldTree, template, indexSignal, parentFieldSignalContext, parentInjector, registry, arrayField } = options;

  const valueHandling = registry.get(template.type)?.valueHandling || 'include';
  const currentIndex = untracked(() => indexSignal());

  // Try to get the nested FieldTree from parent form first
  const nestedItemFieldTree = getNestedItemFieldTree(parentFieldSignalContext, arrayField.key, currentIndex);

  let formRef: FieldTree<unknown> | ReturnType<typeof form<unknown>>;

  // Prefer using the nested FieldTree from parent if available
  if (nestedItemFieldTree) {
    formRef = nestedItemFieldTree;
  } else if (valueHandling === 'flatten' && 'fields' in template && template.fields) {
    formRef =
      fieldTree ??
      createObjectItemForm({
        template,
        indexSignal,
        parentFieldSignalContext,
        parentInjector,
        registry,
        arrayKey: arrayField.key,
      });
  } else if (template.type === 'group' && valueHandling === 'include') {
    formRef =
      fieldTree ??
      createObjectItemForm({
        template,
        indexSignal,
        parentFieldSignalContext,
        parentInjector,
        registry,
        arrayKey: arrayField.key,
      });
  } else if (fieldTree) {
    formRef = fieldTree;
  } else {
    formRef = createObjectItemForm({
      template,
      indexSignal,
      parentFieldSignalContext,
      parentInjector,
      registry,
      arrayKey: arrayField.key,
    });
  }

  const injector = createItemInjector({
    formRef,
    indexSignal,
    parentFieldSignalContext,
    parentInjector,
    arrayField,
  });

  const inputs = runInInjectionContext(injector, () => {
    return mapFieldToInputs(template, registry);
  });

  return { injector, inputs };
}

interface CreateObjectItemFormOptions<TModel> {
  template: FieldDef<unknown>;
  indexSignal: Signal<number>;
  parentFieldSignalContext: FieldSignalContext<TModel>;
  parentInjector: Injector;
  registry: Map<string, FieldTypeDefinition>;
  arrayKey: string;
}

/**
 * Creates a local form for an object array item using a signal-based index.
 * Uses linkedSignal to derive the item value from the parent array at the current index.
 */
function createObjectItemForm<TModel>(options: CreateObjectItemFormOptions<TModel>): ReturnType<typeof form<unknown>> {
  const { template, indexSignal, parentFieldSignalContext, parentInjector, registry, arrayKey } = options;

  const itemEntity = linkedSignal(() => {
    const parentValue = parentFieldSignalContext.value();
    const arrayValue = getArrayValue(parentValue as Partial<TModel>, arrayKey);
    return arrayValue[indexSignal()] ?? {};
  });

  const nestedFields = 'fields' in template && Array.isArray(template.fields) ? template.fields : [];

  return runInInjectionContext(parentInjector, () => {
    if (nestedFields.length > 0) {
      const flattenedFields = flattenFields(nestedFields, registry);
      const schema = createSchemaFromFields(flattenedFields, registry);
      return untracked(() => form(itemEntity, schema));
    }
    return untracked(() => form(itemEntity));
  });
}

interface CreateItemInjectorOptions<TModel> {
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
function createItemInjector<TModel>(options: CreateItemInjectorOptions<TModel>): Injector {
  const { formRef, indexSignal, parentFieldSignalContext, parentInjector, arrayField } = options;

  const arrayContext: ArrayContext = {
    arrayKey: arrayField.key,
    index: indexSignal,
    formValue: parentFieldSignalContext.value(),
    field: arrayField,
  };

  const itemFieldSignalContext: FieldSignalContext<unknown> = {
    injector: undefined as unknown as Injector,
    value: parentFieldSignalContext.value,
    defaultValues: () => ({}),
    form: (() => formRef) as unknown as ReturnType<typeof form<unknown>>,
    defaultValidationMessages: parentFieldSignalContext.defaultValidationMessages,
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
