import { computed, Signal } from '@angular/core';
import { FieldDef } from '../../definitions/base/field-def';
import { getGridClassString } from '../../utils/grid-classes/grid-classes';

/**
 * Builds base input properties from a field definition.
 *
 * @param fieldDef The field definition to extract properties from
 * @param defaultProps Optional form-level default props to merge with field props
 * @returns Record of input names to values
 */
export function buildBaseInputs(fieldDef: FieldDef<unknown>, defaultProps?: Record<string, unknown>): Record<string, unknown> {
  const { key, label, className, tabIndex, props, meta, addons } = fieldDef;
  const inputs: Record<string, unknown> = {};

  // Always include key — required by components for accessibility and identification.
  // `type` is intentionally NOT propagated to the field component (it's the
  // registry discriminant, not a component input); wrappers and addons read it
  // from `WrapperFieldInputs.type` which is injected at the buildFieldInputs()
  // boundary by `DfFieldOutlet`.
  inputs['key'] = key;

  if (label !== undefined) {
    inputs['label'] = label;
  }

  // Combine user className with generated grid classes
  const gridClassString = getGridClassString(fieldDef);
  const allClasses: string[] = [];

  if (gridClassString) {
    allClasses.push(gridClassString);
  }

  if (className) {
    allClasses.push(className);
  }

  if (allClasses.length > 0) {
    inputs['className'] = allClasses.join(' ');
  }

  if (tabIndex !== undefined) {
    inputs['tabIndex'] = tabIndex;
  }

  // Merge props: form-level defaultProps as base, field-level props override
  // Cast props to Record since it's typed as unknown but always represents an object at runtime
  const fieldProps = props as Record<string, unknown> | undefined;
  const mergedProps =
    fieldProps !== undefined || defaultProps !== undefined ? { ...(defaultProps ?? {}), ...(fieldProps ?? {}) } : undefined;

  if (mergedProps !== undefined) {
    inputs['props'] = mergedProps;
  }

  if (meta !== undefined) {
    inputs['meta'] = meta;
  }

  // Forward addons. Field components that don't declare an `addons` input
  // signal (Tier 3 — toggle, checkbox, radio, slider) ignore this key via
  // Angular's `setInput` no-op-on-unknown behaviour, so it's safe to forward
  // unconditionally.
  if (addons !== undefined) {
    inputs['addons'] = addons;
  }

  return inputs;
}

/**
 * Base field mapper that extracts common field properties into component inputs.
 *
 * @param fieldDef The field definition to map
 * @returns Signal containing Record of input names to values
 */
export function baseFieldMapper(fieldDef: FieldDef<unknown>): Signal<Record<string, unknown>> {
  // For base mapper, inputs are static (no reactive dependencies)
  // Wrap in computed for consistency with the MapperFn type
  return computed(() => buildBaseInputs(fieldDef));
}
