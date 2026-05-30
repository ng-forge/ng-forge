import { computed, inject, isSignal, Signal } from '@angular/core';
import { FieldDef } from '@ng-forge/dynamic-forms/internal';
import { FieldWithValidation } from '@ng-forge/dynamic-forms/internal';
import { FieldMeta } from '@ng-forge/dynamic-forms/internal';
import { FieldTypeDefinition } from '@ng-forge/dynamic-forms/internal';
import { ARRAY_CONTEXT, FORM_ID_PREFIX, GROUP_CONTEXT } from '@ng-forge/dynamic-forms/internal';
import { ArrayContext } from '@ng-forge/dynamic-forms/internal';
import { baseFieldMapper } from '@ng-forge/dynamic-forms/internal';
import { PROPERTY_OVERRIDE_STORE } from '../../core/property-derivation/property-override-store';
import { applyPropertyOverrides } from '../../core/property-derivation/apply-property-overrides';
import { buildPropertyOverrideKey } from '../../core/property-derivation/property-override-key';
import { hasTargetProperty, isDerivationLogicConfig } from '@ng-forge/dynamic-forms/internal';

/**
 * Returns true if the field has any property-derivation logic entries
 * (type: 'derivation' with a non-empty targetProperty). Mirrors the inclusion
 * rule used by `collectPropertyDerivations`, so the mapper and orchestrator
 * agree on which fields participate in property overrides — without depending
 * on whether the orchestrator's registration effect has run yet (which it
 * hasn't on the resolveFieldSync path with a warm COMPONENT_CACHE).
 */
function fieldHasPropertyDerivations(fieldDef: FieldDef<unknown>): boolean {
  // Match the collector's keyless guard (property-derivation-collector.ts):
  // keyless fields are never registered in the store, so the mapper must skip
  // them too — otherwise getOverrides() would be called with an undefined key.
  if (!fieldDef.key) return false;
  const logic = (fieldDef as FieldDef<unknown> & FieldWithValidation).logic;
  if (!logic || logic.length === 0) return false;
  for (const entry of logic) {
    if (isDerivationLogicConfig(entry) && hasTargetProperty(entry)) return true;
  }
  return false;
}

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
 * Prefixes the key with the underscored group ancestor path so that the same
 * leaf key inside different groups produces distinct DOM IDs (issue #401).
 * Form-schema keys remain clean — only the rendered `key` input is rewritten.
 */
function applyGroupPrefix(inputs: Record<string, unknown>, groupPath: string): Record<string, unknown> {
  const key = inputs['key'];
  if (typeof key !== 'string' || groupPath.length === 0) {
    return inputs;
  }

  return {
    ...inputs,
    key: `${groupPath.replace(/\./g, '_')}_${key}`,
  };
}

/**
 * Prepends the form-level id prefix as the outermost key segment so the same key
 * across two forms on one page yields distinct DOM IDs. Rewrites only the rendered
 * `key`; schema/override-store keys stay clean. No-op when prefix is empty.
 */
function applyFormPrefix(inputs: Record<string, unknown>, prefix: string): Record<string, unknown> {
  const key = inputs['key'];
  if (typeof key !== 'string' || prefix.length === 0) {
    return inputs;
  }

  return {
    ...inputs,
    key: `${prefix}_${key}`,
  };
}

/**
 * Main field mapper function that uses the field registry to get the appropriate mapper
 * based on the field's type property.
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

  // Check if we're inside a group context - if so, prefix the key with the group path
  // so overlapping leaf keys across groups produce distinct DOM IDs (issue #401).
  // Optional because GROUP_CONTEXT is only provided by GroupFieldComponent.
  const groupContext = inject(GROUP_CONTEXT, { optional: true });

  // Form-level DOM-id prefix (scopes ids to one form instance). Optional: absent under mock injectors.
  const formPrefixSignal = inject(FORM_ID_PREFIX, { optional: true });

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
  const hasGroupContext = groupContext != null;
  // Bypasses the fast path so fields stay subscribed to a prefix that can flip
  // when a sibling form mounts (gating on its current value would miss the flip).
  const hasFormPrefix = formPrefixSignal != null;

  // Fast-path check for property overrides: only fields whose definition declares
  // a property-derivation enter the computed() wrapper. We inspect the FieldDef
  // directly rather than asking the store, because the store's registration
  // effect may not have fired yet when the mapper runs in the resolveFieldSync
  // path (warm COMPONENT_CACHE). Both the mapper and the orchestrator's
  // collector apply the same inclusion rule, so the answers always agree.
  const hasOverrides = fieldHasPropertyDerivations(fieldDef);

  // Fast path: no transformations needed
  if (!hasPropsForwarding && !hasArrayContext && !hasGroupContext && !hasOverrides && !hasFormPrefix) {
    return mapperResult;
  }

  // Wrap in computed to apply transformations
  return computed(() => {
    let inputs = mapperResult();

    // Apply props forwarding if configured
    if (hasPropsForwarding) {
      inputs = mergeForwardedPropsToMeta(inputs, propsToMeta);
    }

    // Apply group prefix BEFORE array suffix so the resulting key reads as
    // `{groupPath}_{key}_{index}` (e.g. `address_street_0`) — matching the
    // form-value path order: group → leaf → array index.
    if (hasGroupContext) {
      // Non-null after the hasGroupContext guard.
      inputs = applyGroupPrefix(inputs, groupContext!.groupPath());
    }

    // Apply index suffix for array items
    if (hasArrayContext) {
      const index = indexSignal();
      inputs = applyIndexSuffix(inputs, index);
    }

    // Outermost key segment; reading the signal here re-renders ids if the prefix flips.
    if (hasFormPrefix) {
      inputs = applyFormPrefix(inputs, formPrefixSignal!());
    }

    // Apply property overrides from the store (AFTER all static transformations).
    //
    // INVARIANT: the store key MUST be built from `fieldDef.key` + the group/array
    // ancestry (via buildPropertyOverrideKey) — NEVER from the DOM-scoped
    // `inputs['key']` produced by applyGroupPrefix/applyIndexSuffix above. The
    // collector (property-derivation-collector.ts) registers using the same
    // shape; if these drift, overrides silently miss their target.
    if (hasOverrides) {
      // Build inside computed() so the index/group signals establish reactive deps.
      // GROUP_CONTEXT resets at array boundaries (see create-array-item-injector.ts),
      // so groupPath() represents ancestors inside the current array item (or
      // top-level groups when not in an array) — matching the collector.
      const groupPath = hasGroupContext ? groupContext!.groupPath() : undefined;
      const key = hasArrayContext
        ? buildPropertyOverrideKey(
            (arrayContext as ArrayContext).arrayKey,
            (indexSignal as Signal<number>)(),
            fieldDef.key,
            groupPath || undefined,
          )
        : buildPropertyOverrideKey(undefined, undefined, fieldDef.key, groupPath || undefined);
      const overrides = store.getOverrides(key)();
      inputs = applyPropertyOverrides(inputs, overrides);
    }

    return inputs;
  });
}
