import { isDevMode } from '@angular/core';
import { DynamicFormError } from '../../errors/dynamic-form-error';
import { BaseValueField } from '../../definitions/base/base-value-field';
import { FieldWithValidation } from '../../definitions/base/field-with-validation';

/** Properties defined by individual field components, not part of the shared base interfaces. */
type AdapterFieldKey = 'options' | 'hint' | 'tooltip' | 'prefix' | 'suffix' | 'step' | 'rows' | 'cols' | 'multiple' | 'appearance';

/**
 * Known standard field properties where a missing key likely indicates a typo.
 * Override keys not in this set are assumed to be intentional dynamic properties
 * and will not trigger dev-mode warnings.
 */
const KNOWN_FIELD_PROPERTY_NAMES = [
  'label',
  'placeholder',
  'disabled',
  'readonly',
  'required',
  'className',
  'tabIndex',
  'validationMessages',
  'options',
  'props',
  'hint',
  'tooltip',
  'prefix',
  'suffix',
  'min',
  'max',
  'minLength',
  'maxLength',
  'step',
  'pattern',
  'rows',
  'cols',
  'multiple',
  'appearance',
] as const satisfies ReadonlyArray<keyof BaseValueField<unknown, unknown> | keyof FieldWithValidation | AdapterFieldKey>;

const KNOWN_FIELD_PROPERTIES = new Set<string>(KNOWN_FIELD_PROPERTY_NAMES);

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
 * In dev mode, warns when a known standard field property override key doesn't match
 * any existing input property, which may indicate a typo in the `targetProperty`
 * configuration. Dynamic/custom property keys are silently accepted.
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

    // Dev-mode check: warn only when a known standard field property is missing from inputs,
    // which likely indicates a typo. Dynamic/custom keys are intentionally skipped to avoid
    // false positives for properties added by derivations that aren't in the initial config.
    if (isDevMode()) {
      const topLevelKey = dotIndex === -1 ? key : key.substring(0, dotIndex);
      if (KNOWN_FIELD_PROPERTIES.has(topLevelKey) && !(topLevelKey in inputs)) {
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
