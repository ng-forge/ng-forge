import { computed, Injector, runInInjectionContext, Signal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { ArrayField } from '../../definitions/default/array-field';
import { FieldDef } from '../../definitions/base/field-def';
import { ArrayContext, FieldSignalContext } from '../../mappers/types';
import { ARRAY_CONTEXT, FIELD_SIGNAL_CONTEXT } from '../../models/field-signal-context.token';
import { FieldTypeDefinition } from '../../models/field-type';
import { mapFieldToInputs } from '../field-mapper/field-mapper';
import { RootFormRegistryService } from '../../core/registry/root-form-registry.service';
import { isEqual } from '../object-utils';

/**
 * Options for creating an array item injector.
 */
export interface CreateArrayItemInjectorOptions<TModel extends Record<string, unknown>> {
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
 * Creates an injector and inputs for an array item.
 *
 * Uses direct root form binding - components bind directly to the root form's
 * FieldTree for array items (rootForm['arrayKey'][index]). This architecture:
 *
 * - Eliminates the need for local forms and bidirectional sync
 * - Allows Zod/StandardSchema validation errors to flow naturally to components
 * - Reduces complexity by having a single source of truth (the root form)
 *
 * The FieldSignalContext.form property uses a getter that evaluates a computed
 * signal, making form access reactive to index changes (when items reorder,
 * the component points to the correct array position).
 */
export function createArrayItemInjectorAndInputs<TModel extends Record<string, unknown>>(
  options: CreateArrayItemInjectorOptions<TModel>,
): ArrayItemInjectorResult {
  const { template, indexSignal, parentFieldSignalContext, parentInjector, registry, arrayField } = options;

  // Get root form registry - it's guaranteed to be available since root form
  // is registered before resolvedFields computes (dependency chain ensures this)
  const rootFormRegistry = parentInjector.get(RootFormRegistryService);

  // Create a computed that derives the array item's FieldTree from root form.
  // Uses isEqual to prevent unnecessary re-computation when index changes but value is same.
  const itemFormAccessor = computed(
    () => {
      const rootForm = rootFormRegistry.rootForm();
      if (!rootForm) {
        return undefined;
      }

      const index = indexSignal();
      // Navigate: rootForm['arrayKey'][index]
      const arrayFieldTree = (rootForm as Record<string, unknown>)[arrayField.key];
      if (!arrayFieldTree) {
        return undefined;
      }

      return (arrayFieldTree as unknown[])[index] as FieldTree<unknown> | undefined;
    },
    { equal: isEqual },
  );

  const injector = createItemInjector({
    itemFormAccessor,
    indexSignal,
    parentFieldSignalContext,
    parentInjector,
    arrayField,
  });

  // mapFieldToInputs automatically reads ARRAY_CONTEXT from the injector
  // and applies the index suffix to keys for unique DOM IDs
  const inputs = runInInjectionContext(injector, () => {
    return mapFieldToInputs(template, registry);
  });

  return { injector, inputs };
}

interface CreateItemInjectorOptions<TModel extends Record<string, unknown>> {
  itemFormAccessor: Signal<FieldTree<unknown> | undefined>;
  indexSignal: Signal<number>;
  parentFieldSignalContext: FieldSignalContext<TModel>;
  parentInjector: Injector;
  arrayField: ArrayField;
}

/**
 * Creates a scoped injector for an array item.
 * Provides both FIELD_SIGNAL_CONTEXT (for form access) and ARRAY_CONTEXT (for position awareness).
 *
 * The FIELD_SIGNAL_CONTEXT.form uses a getter that evaluates itemFormAccessor() on access.
 * This makes form access reactive - when mappers access context.form['fieldKey'], the getter runs,
 * evaluating the computed which tracks indexSignal as a dependency. This ensures components
 * automatically update when array items reorder.
 */
function createItemInjector<TModel extends Record<string, unknown>>(options: CreateItemInjectorOptions<TModel>): Injector {
  const { itemFormAccessor, indexSignal, parentFieldSignalContext, parentInjector, arrayField } = options;

  // Use getter for formValue to ensure it's always current, not a stale snapshot.
  // Components accessing arrayContext.formValue will get the current value.
  const arrayContext: ArrayContext = {
    arrayKey: arrayField.key,
    index: indexSignal,
    get formValue() {
      return parentFieldSignalContext.value();
    },
    field: arrayField,
  };

  // Use object with getter to make form access reactive.
  // When mappers access context.form, the getter evaluates itemFormAccessor().
  // If this is inside another computed (like mapper's return), dependency tracking works correctly.
  const itemFieldSignalContext: FieldSignalContext<Record<string, unknown>> = {
    injector: undefined as unknown as Injector,
    value: parentFieldSignalContext.value,
    defaultValues: () => ({}),
    get form(): FieldTree<Record<string, unknown>> {
      return itemFormAccessor() as FieldTree<Record<string, unknown>>;
    },
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
