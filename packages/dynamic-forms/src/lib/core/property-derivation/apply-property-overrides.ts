import { isDevMode } from '@angular/core';
import { DynamicFormError } from '../../errors/dynamic-form-error';

/**
 * Applies property overrides to a field's input record.
 *
 * Supports dot-notation for nested properties (max 2 levels):
 * - Simple: `overrides['minDate']` → `inputs['minDate'] = value`
 * - Nested (1 dot): `overrides['props.appearance']` → `inputs.props.appearance = value`
 * - Deeper paths (2+ dots): throws DynamicFormError
 *
 * **Important:** Only simple (e.g., `'minDate'`) and single-nested (e.g., `'props.appearance'`)
 * paths are supported. Paths with 2+ dots will throw a `DynamicFormError` at runtime.
 * This is an architectural constraint — deeper nesting would require recursive cloning
 * and complicate the override merging strategy.
 *
 * Array-valued overrides replace wholesale (no merging).
 * Returns `inputs` unchanged if overrides is empty (no clone).
 *
 * In dev mode, warns when an override key doesn't match any existing input property,
 * which may indicate a typo in the `targetProperty` configuration.
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

    // Dev-mode check: warn if the override key doesn't match any existing input property.
    // This catches typos like 'mindata' instead of 'minDate'. False positives are possible
    // for properties intentionally added by derivations that aren't in the initial config.
    if (isDevMode()) {
      const topLevelKey = dotIndex === -1 ? key : key.substring(0, dotIndex);
      if (!(topLevelKey in inputs)) {
        console.warn(
          `[Dynamic Forms] Property override '${key}' does not match any existing input property. ` +
            'This may indicate a typo in the targetProperty configuration. ' +
            `Available properties: ${Object.keys(inputs).join(', ')}`,
        );
      }
    }

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
