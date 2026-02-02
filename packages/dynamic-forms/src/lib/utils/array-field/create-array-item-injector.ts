import { Injector, runInInjectionContext, Signal, untracked, linkedSignal, signal } from '@angular/core';
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
import { addKeySuffixToField, addKeySuffixToValue, stripKeySuffixFromValue } from './key-suffix';
import { getFieldDefaultValue } from '../default-value/default-value';

/**
 * Options for creating an array item injector.
 */
export interface CreateArrayItemInjectorOptions<TModel extends Record<string, unknown>> {
  /** The field tree for this item (null for object items without existing FieldTree). */
  fieldTree: FieldTree<unknown> | null;
  /** The field template defining the array item structure. */
  template: FieldDef<unknown>;
  /** 8-char suffix for key uniqueness (derived from item UUID). */
  suffix: string;
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
  /**
   * Optional explicit default value for new items added via events.
   * When provided, this value is used instead of reading from the parent array.
   */
  explicitDefaultValue?: unknown;
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
 * Strips the key suffix from item values before syncing to maintain clean parent data.
 */
function syncItemToParent<TModel extends Record<string, unknown>>(
  itemFormInstance: ReturnType<typeof form<unknown>>,
  parentFieldSignalContext: FieldSignalContext<TModel>,
  arrayKey: string,
  indexSignal: Signal<number>,
  suffix: string,
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

      // Strip suffix from item value before syncing to parent
      // Internal form uses suffixed keys (name_a1b2c3d4), parent expects clean keys (name)
      const cleanItemValue = stripKeySuffixFromValue(itemValue, suffix);

      // Only sync if value actually changed
      if (idx >= 0 && idx < currentArray.length && currentArray[idx] !== cleanItemValue) {
        isSyncing = true;
        const newArray = [...currentArray];
        newArray[idx] = cleanItemValue;
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
 *
 * Always creates a local form with suffixed keys for array items. This ensures:
 * - Unique DOM IDs across all array items (via UUID-based suffixes)
 * - Consistent form structure that mappers can rely on
 * - Proper two-way sync with parent form
 *
 * Note: The fieldTree parameter from parent is intentionally not used directly
 * because it may not have the structure needed by valueFieldMapper (bracket notation access).
 * Instead, we create our own form with a linkedSignal that derives from parent values.
 */
export function createArrayItemInjectorAndInputs<TModel extends Record<string, unknown>>(
  options: CreateArrayItemInjectorOptions<TModel>,
): ArrayItemInjectorResult {
  const { template, suffix, indexSignal, parentFieldSignalContext, parentInjector, registry, arrayField, explicitDefaultValue } = options;

  // Apply suffix to template keys for unique DOM IDs across array items
  const suffixedTemplate = addKeySuffixToField(template, suffix);

  // Always create our own form for array items with suffixed schema
  // This ensures the form structure matches what valueFieldMapper expects (bracket notation access)
  const formRef = createObjectItemForm({
    template: suffixedTemplate,
    suffix,
    indexSignal,
    parentFieldSignalContext,
    parentInjector,
    registry,
    arrayKey: arrayField.key,
    explicitDefaultValue,
  });

  const injector = createItemInjector({
    formRef,
    indexSignal,
    parentFieldSignalContext,
    parentInjector,
    arrayField,
  });

  // Set up two-way sync: item form changes -> parent form array
  syncItemToParent(formRef as ReturnType<typeof form<unknown>>, parentFieldSignalContext, arrayField.key, indexSignal, suffix, injector);

  const inputs = runInInjectionContext(injector, () => {
    return mapFieldToInputs(suffixedTemplate, registry);
  });

  return { injector, inputs };
}

interface CreateObjectItemFormOptions<TModel extends Record<string, unknown>> {
  template: FieldDef<unknown>;
  /** 8-char suffix for key uniqueness - used to transform values to match suffixed schema keys. */
  suffix: string;
  indexSignal: Signal<number>;
  parentFieldSignalContext: FieldSignalContext<TModel>;
  parentInjector: Injector;
  registry: Map<string, FieldTypeDefinition>;
  arrayKey: string;
  /**
   * Optional explicit default value for new items added via events.
   * When provided, this value is used instead of reading from the parent array.
   */
  explicitDefaultValue?: unknown;
}

/**
 * Creates a local form for an object array item.
 *
 * The form is initialized with the current parent array item value (with suffixed keys),
 * but does NOT reactively track parent changes. This prevents infinite loops where:
 * - Item changes -> sync to parent -> parent changes -> linkedSignal recomputes -> cycle
 *
 * Instead, values flow one-way: item form -> parent (via syncItemToParent effect).
 *
 * For array items, we always create a form with a schema to ensure proper field structure.
 * This is needed for valueFieldMapper to find fields via bracket notation.
 *
 * Value transformation:
 * - Parent stores clean values: { name: 'John', email: 'j@e.com' }
 * - Form schema uses suffixed keys: { name_a1b2c3d4: 'John', email_a1b2c3d4: 'j@e.com' }
 */
function createObjectItemForm<TModel extends Record<string, unknown>>(
  options: CreateObjectItemFormOptions<TModel>,
): ReturnType<typeof form<unknown>> {
  const { template, suffix, indexSignal, parentFieldSignalContext, parentInjector, registry, arrayKey, explicitDefaultValue } = options;

  const nestedFields = 'fields' in template && Array.isArray(template.fields) ? template.fields : [];

  // Determine which fields will be in the schema
  const isGroupTemplate = template.type === 'group' && template.key;
  const schemaFields = isGroupTemplate || nestedFields.length === 0 ? [template] : nestedFields;

  // Get initial value (untracked to avoid reactive dependency)
  // IMPORTANT: Angular Signal Forms requires the entity to have keys that match the schema.
  // If the entity is empty, the form won't have child field accessors.
  const initialValue = untracked(() => {
    // When explicitDefaultValue is provided (for new items added via events),
    // use it instead of reading from the parent array. This is necessary because
    // when prepending/inserting items, the parent array hasn't been updated yet.
    let cleanValue: unknown;
    if (explicitDefaultValue !== undefined) {
      cleanValue = explicitDefaultValue;
    } else {
      // Read from parent array for existing items during initial render
      const parentValue = parentFieldSignalContext.value();
      const arrayValue = getArrayValue(parentValue as Partial<TModel>, arrayKey);
      cleanValue = arrayValue[indexSignal()] ?? {};
    }

    // Add suffix to value keys to match the suffixed schema keys
    const suffixedValue = addKeySuffixToValue(cleanValue, suffix) as Record<string, unknown>;

    // Ensure the entity has all keys defined in the schema (with default values if missing)
    // This is required for Angular Signal Forms to create child field accessors
    const entityWithSchemaKeys = { ...suffixedValue };
    for (const field of schemaFields) {
      // The template is already suffixed, so field.key is already 'email_a1b2c3d4'
      if (field.key && !(field.key in entityWithSchemaKeys)) {
        entityWithSchemaKeys[field.key] = getFieldDefaultValue(field, registry);
      }
    }

    return entityWithSchemaKeys;
  });

  // Use a regular signal - no reactive dependency on parent
  const itemEntity = signal(initialValue);

  return runInInjectionContext(parentInjector, () => {
    // Determine which fields to include in the schema
    // - Groups with keys create data nesting, so preserve the group wrapper: [template]
    // - Rows are layout-only, so use their children directly: nestedFields
    // - Leaf fields use themselves: [template]
    const isGroupTemplate = template.type === 'group' && template.key;
    const schemaFields = isGroupTemplate || nestedFields.length === 0 ? [template] : nestedFields;
    const flattenedFields = flattenFields(schemaFields, registry);
    const schema = createSchemaFromFields(flattenedFields, registry);
    const formInstance = untracked(() => form(itemEntity, schema));
    // Initialize the form structure by calling it - this populates child FieldTrees
    // accessible via bracket notation (formRef['key'])
    untracked(() => formInstance());

    return formInstance;
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
