import { computed, inject, isSignal, Signal } from '@angular/core';
import { FieldDef } from '../../definitions/base/field-def';
import { FieldMeta } from '../../definitions/base/field-meta';
import { FieldTypeDefinition } from '../../models/field-type';
import { ARRAY_CONTEXT } from '../../models/field-signal-context.token';
import { ArrayContext } from '../../mappers/types';
import { baseFieldMapper } from '../../mappers/base/base-field-mapper';

/**
 * Merges forwarded props into meta, with meta taking precedence.
 *
 * @param inputs The current inputs record
 * @param propsToMeta Array of prop keys to forward to meta
 * @returns Updated inputs record with merged meta
 */
function mergeForwardedPropsToMeta(inputs: Record<string, unknown>, propsToMeta: string[]): Record<string, unknown> {
  const props = inputs['props'] as Record<string, unknown> | undefined;
  if (!props || propsToMeta.length === 0) {
    return inputs;
  }

  // Extract values to forward from props
  // Values are typed as FieldMeta-compatible since they're forwarded attributes (type, rows, cols, etc.)
  const forwardedValues: FieldMeta = {};
  for (const key of propsToMeta) {
    const value = props[key];
    if (value !== undefined && value !== null) {
      // Props being forwarded are known HTML attributes (string, number, boolean)
      forwardedValues[key] = value as string | number | boolean;
    }
  }

  // If nothing to forward, return inputs unchanged
  if (Object.keys(forwardedValues).length === 0) {
    return inputs;
  }

  // Merge: forwarded props first, then meta (meta wins)
  const existingMeta = inputs['meta'] as FieldMeta | undefined;
  const mergedMeta: FieldMeta = {
    ...forwardedValues,
    ...existingMeta,
  };

  return {
    ...inputs,
    meta: mergedMeta,
  };
}

/**
 * Applies index suffix to the key property for array items.
 * This ensures unique DOM IDs while keeping form schema keys clean.
 *
 * @param inputs The current inputs record
 * @param index The array item index
 * @returns Updated inputs record with suffixed key
 */
function applyIndexSuffix(inputs: Record<string, unknown>, index: number): Record<string, unknown> {
  const key = inputs['key'];
  if (typeof key !== 'string') {
    return inputs;
  }

  return {
    ...inputs,
    key: `${key}_${index}`,
  };
}

/**
 * Main field mapper function that uses the field registry to get the appropriate mapper
 * based on the field's type property.
 *
 * This function must be called within an injection context where FIELD_SIGNAL_CONTEXT
 * is provided, as mappers inject the context to access form state.
 *
 * For componentless fields (no loadComponent and no mapper), returns undefined
 * since there's no component to bind inputs to. Callers should check for undefined
 * and skip rendering logic for such fields.
 *
 * If the field type definition specifies `propsToMeta`, the specified props
 * will be merged into the meta object (with meta taking precedence).
 *
 * When running inside an array item context (ARRAY_CONTEXT is provided), the key
 * is automatically suffixed with the item index to ensure unique DOM IDs. The form
 * schema keys remain clean (unsuffixed) so derivations and validations work correctly.
 *
 * @param fieldDef The field definition to map
 * @param fieldRegistry The registry of field type definitions
 * @returns Signal containing Record of input names to values, or undefined for componentless fields
 */
export function mapFieldToInputs(
  fieldDef: FieldDef<unknown>,
  fieldRegistry: Map<string, FieldTypeDefinition>,
): Signal<Record<string, unknown>> | undefined {
  // Get the field type definition from registry
  const fieldType = fieldRegistry.get(fieldDef.type);

  // Componentless field (no mapper and no loadComponent) - nothing to map
  if (fieldType && !fieldType.loadComponent && !fieldType.mapper) {
    return undefined;
  }

  // Check if we're inside an array item context - if so, we need to suffix keys
  // Use try-catch because inject() throws when called outside an injection context
  let arrayContext: ArrayContext | null = null;
  try {
    arrayContext = inject(ARRAY_CONTEXT, { optional: true });
  } catch {
    // Not in an injection context or ARRAY_CONTEXT not provided
  }

  // Get the base mapper result
  const mapperResult: Signal<Record<string, unknown>> = fieldType?.mapper ? fieldType.mapper(fieldDef) : baseFieldMapper(fieldDef);

  const propsToMeta = fieldType?.propsToMeta;
  const hasPropsForwarding = propsToMeta && propsToMeta.length > 0;
  // Check that arrayContext exists and has a valid index signal (guards against mock injectors)
  const indexSignal = arrayContext?.index;
  const hasArrayContext = indexSignal !== undefined && isSignal(indexSignal);

  // Fast path: no transformations needed
  if (!hasPropsForwarding && !hasArrayContext) {
    return mapperResult;
  }

  // Wrap in computed to apply transformations
  return computed(() => {
    let inputs = mapperResult();

    // Apply props forwarding if configured
    if (hasPropsForwarding) {
      inputs = mergeForwardedPropsToMeta(inputs, propsToMeta);
    }

    // Apply index suffix for array items
    if (hasArrayContext) {
      const index = indexSignal();
      inputs = applyIndexSuffix(inputs, index);
    }

    return inputs;
  });
}
