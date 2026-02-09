import { computed, inject, isSignal, Signal } from '@angular/core';
import { FieldDef } from '../../definitions/base/field-def';
import { FieldMeta } from '../../definitions/base/field-meta';
import { FieldTypeDefinition } from '../../models/field-type';
import { ARRAY_CONTEXT } from '../../models/field-signal-context.token';
import { ArrayContext } from '../../mappers/types';
import { baseFieldMapper } from '../../mappers/base/base-field-mapper';
import { PROPERTY_OVERRIDE_STORE } from '../../core/property-derivation/property-override-store';
import { applyPropertyOverrides } from '../../core/property-derivation/apply-property-overrides';
import { buildPropertyOverrideKey, PLACEHOLDER_INDEX } from '../../core/property-derivation/property-override-key';

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
 * Property overrides from the PropertyOverrideStore are applied AFTER all static
 * mapper logic, so they always take precedence. Only fields with registered property
 * derivations incur the overhead of reading from the store.
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
  // Optional because ARRAY_CONTEXT is only provided inside array item injectors
  const arrayContext = inject(ARRAY_CONTEXT, { optional: true });

  // Inject the property override store for property derivation overrides
  // Always available — provided at the DynamicForm component level via provideDynamicFormDI
  const store = inject(PROPERTY_OVERRIDE_STORE);

  // Get the base mapper result
  const mapperResult: Signal<Record<string, unknown>> = fieldType?.mapper ? fieldType.mapper(fieldDef) : baseFieldMapper(fieldDef);

  const propsToMeta = fieldType?.propsToMeta;
  const hasPropsForwarding = propsToMeta && propsToMeta.length > 0;
  // Check that arrayContext exists and has a valid index signal (guards against mock injectors)
  const indexSignal = arrayContext?.index;
  const hasArrayContext = indexSignal !== undefined && isSignal(indexSignal);

  // Fast-path check for property overrides: only fields with registered derivations
  // enter the computed() wrapper for overrides. hasField() is a non-reactive Map.has() — O(1).
  // Uses PLACEHOLDER_INDEX to produce the wildcard format (e.g., 'items.$.endDate') matching
  // what the collector/orchestrator registers. The computed block below uses a concrete index instead.
  const hasOverrides =
    store?.hasField(buildPropertyOverrideKey(arrayContext?.arrayKey, arrayContext ? PLACEHOLDER_INDEX : undefined, fieldDef.key)) ?? false;

  // Fast path: no transformations needed
  if (!hasPropsForwarding && !hasArrayContext && !hasOverrides) {
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

    // Apply property overrides from the store (AFTER all static transformations)
    if (hasOverrides) {
      // Build the store key inside computed() so index signal read establishes reactive dependency
      // Safe to access arrayContext/indexSignal directly — hasArrayContext already confirmed they exist
      const key = hasArrayContext
        ? buildPropertyOverrideKey((arrayContext as ArrayContext).arrayKey, (indexSignal as Signal<number>)(), fieldDef.key)
        : fieldDef.key;
      const overrides = store.getOverrides(key)();
      inputs = applyPropertyOverrides(inputs, overrides);
    }

    return inputs;
  });
}
