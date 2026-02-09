import { DynamicFormError } from '../../errors/dynamic-form-error';

/**
 * Applies property overrides to a field's input record.
 *
 * Supports dot-notation for nested properties (max 2 levels):
 * - Simple: `overrides['minDate']` → `inputs['minDate'] = value`
 * - Nested (1 dot): `overrides['props.appearance']` → `inputs.props.appearance = value`
 * - Deeper paths (2+ dots): throws DynamicFormError
 *
 * Array-valued overrides replace wholesale (no merging).
 * Returns `inputs` unchanged if overrides is empty (no clone).
 *
 * @param inputs - The current field inputs record
 * @param overrides - Record of property names to override values
 * @returns Updated inputs record with overrides applied
 *
 * @public
 */
export function applyPropertyOverrides(inputs: Record<string, unknown>, overrides: Record<string, unknown>): Record<string, unknown> {
  const keys = Object.keys(overrides);
  if (keys.length === 0) {
    return inputs;
  }

  const result = { ...inputs };

  for (const key of keys) {
    const value = overrides[key];
    const dotIndex = key.indexOf('.');

    if (dotIndex === -1) {
      // Simple property: direct assignment
      result[key] = value;
    } else {
      // Nested property — split at first dot only
      const parentKey = key.substring(0, dotIndex);
      const childKey = key.substring(dotIndex + 1);

      // Validate max 2 levels (1 dot)
      if (childKey.includes('.')) {
        throw new DynamicFormError(
          `Property override path '${key}' exceeds maximum depth of 2 levels. ` +
            `Only simple ('minDate') and single-nested ('props.appearance') paths are supported.`,
        );
      }

      // Shallow-clone the parent object and set the child property
      const parentValue = result[parentKey];
      const clonedParent = parentValue && typeof parentValue === 'object' ? { ...(parentValue as Record<string, unknown>) } : {};
      clonedParent[childKey] = value;
      result[parentKey] = clonedParent;
    }
  }

  return result;
}
