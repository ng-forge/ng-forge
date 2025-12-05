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

/**
 * Options for creating an array item injector.
 */
export interface CreateArrayItemInjectorOptions<TModel> {
  /** The field tree for this item (may be null for object items) */
  fieldTree: FieldTree<unknown> | null;
  /** The field template for this array item */
  template: FieldDef<unknown>;
  /** Signal containing the current index of this item */
  indexSignal: Signal<number>;
  /** The parent field signal context */
  parentFieldSignalContext: FieldSignalContext<TModel>;
  /** The parent injector */
  parentInjector: Injector;
  /** The field registry */
  registry: Map<string, FieldTypeDefinition>;
  /** The array field definition */
  arrayField: ArrayField;
}

/**
 * Result of creating an array item injector.
 */
export interface ArrayItemInjectorResult {
  /** The injector for this array item */
  injector: Injector;
  /** Inputs signal for ngComponentOutlet */
  inputs: Signal<Record<string, unknown>>;
}

/**
 * Creates an injector and inputs for an array item.
 * Returns both the injector (with ARRAY_CONTEXT and FIELD_SIGNAL_CONTEXT) and the inputs signal.
 *
 * @param options - Configuration options for creating the injector
 * @returns Object containing the injector and inputs signal
 */
export function createArrayItemInjectorAndInputs<TModel>(options: CreateArrayItemInjectorOptions<TModel>): ArrayItemInjectorResult {
  const { fieldTree, template, indexSignal, parentFieldSignalContext, parentInjector, registry, arrayField } = options;

  const valueHandling = registry.get(template.type)?.valueHandling || 'include';

  // Determine the form reference and create injector
  let formRef: FieldTree<unknown> | ReturnType<typeof form<unknown>>;

  if (valueHandling === 'flatten' && 'fields' in template && template.fields) {
    // Flatten types (row/page) or groups
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
    // Group types inside arrays
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
    // Regular types with FieldTree
    formRef = fieldTree;
  } else {
    // Object items without FieldTree
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

  // Map field to inputs using the scoped injector
  const inputs = runInInjectionContext(injector, () => {
    return mapFieldToInputs(template, registry);
  });

  return { injector, inputs };
}

/**
 * Options for creating an object item form.
 */
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
 */
function createObjectItemForm<TModel>(options: CreateObjectItemFormOptions<TModel>): ReturnType<typeof form<unknown>> {
  const { template, indexSignal, parentFieldSignalContext, parentInjector, registry, arrayKey } = options;

  // Create entity signal that reads from the array at the signal's current index
  const itemEntity = linkedSignal(() => {
    const parentValue = parentFieldSignalContext.value();
    const arrayValue = getArrayValue(parentValue as Partial<TModel>, arrayKey);
    return arrayValue[indexSignal()] ?? {};
  });

  // Get nested fields for schema creation (if available)
  const nestedFields = 'fields' in template && Array.isArray(template.fields) ? template.fields : [];

  // Create form with schema if we have nested fields
  return runInInjectionContext(parentInjector, () => {
    if (nestedFields.length > 0) {
      const flattenedFields = flattenFields(nestedFields, registry);
      const schema = createSchemaFromFields(flattenedFields, registry);
      return untracked(() => form(itemEntity, schema));
    }
    return untracked(() => form(itemEntity));
  });
}

/**
 * Options for creating an item injector.
 */
interface CreateItemInjectorOptions<TModel> {
  formRef: FieldTree<unknown> | ReturnType<typeof form<unknown>>;
  indexSignal: Signal<number>;
  parentFieldSignalContext: FieldSignalContext<TModel>;
  parentInjector: Injector;
  arrayField: ArrayField;
}

/**
 * Core helper to create an injector for an array item.
 * Provides both FIELD_SIGNAL_CONTEXT and ARRAY_CONTEXT to child components.
 *
 * @param options - Configuration options for the injector
 * @returns The created injector
 */
function createItemInjector<TModel>(options: CreateItemInjectorOptions<TModel>): Injector {
  const { formRef, indexSignal, parentFieldSignalContext, parentInjector, arrayField } = options;

  const arrayContext: ArrayContext = {
    arrayKey: arrayField.key,
    index: indexSignal,
    formValue: parentFieldSignalContext.value(),
    field: arrayField,
  };

  // Create context with placeholder injector (will be set after Injector.create)
  // Wrap formRef in a function to make it callable (FieldSignalContext.form must be callable)
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

  // Complete the circular reference
  itemFieldSignalContext.injector = injector;

  return injector;
}
