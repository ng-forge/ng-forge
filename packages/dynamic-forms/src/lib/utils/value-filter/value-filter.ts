import { FieldTree } from '@angular/forms/signals';
import { FieldDef } from '../../definitions/base/field-def';
import { isGroupField } from '../../definitions/default/group-field';
import { isArrayField } from '../../definitions/default/array-field';
import { FieldTypeDefinition, getFieldValueHandling } from '../../models/field-type';
import { ResolvedValueExclusionConfig, ValueExclusionConfig } from '../../models/value-exclusion-config';

/**
 * Resolves the effective exclusion config for a field using the 3-tier hierarchy:
 * Field > Form > Global. For each property, the most specific defined value wins.
 *
 * @param global - Global defaults from VALUE_EXCLUSION_DEFAULTS token
 * @param form - Form-level overrides from FormOptions (may be undefined per property)
 * @param field - Field-level overrides from FieldDef (may be undefined per property)
 * @returns Fully resolved config with all properties defined
 */
export function resolveExclusionConfig(
  global: ResolvedValueExclusionConfig,
  form: ValueExclusionConfig | undefined,
  field: ValueExclusionConfig | undefined,
): ResolvedValueExclusionConfig {
  return {
    excludeValueIfHidden: field?.excludeValueIfHidden ?? form?.excludeValueIfHidden ?? global.excludeValueIfHidden,
    excludeValueIfDisabled: field?.excludeValueIfDisabled ?? form?.excludeValueIfDisabled ?? global.excludeValueIfDisabled,
    excludeValueIfReadonly: field?.excludeValueIfReadonly ?? form?.excludeValueIfReadonly ?? global.excludeValueIfReadonly,
  };
}

/**
 * Determines whether a field's value should be excluded based on its reactive state
 * and the resolved exclusion config.
 */
function shouldExcludeField(fieldState: FieldTree<unknown>, config: ResolvedValueExclusionConfig): boolean {
  const state = fieldState();

  if (config.excludeValueIfHidden && state.hidden()) {
    return true;
  }

  if (config.excludeValueIfDisabled && state.disabled()) {
    return true;
  }

  if (config.excludeValueIfReadonly && state.readonly()) {
    return true;
  }

  return false;
}

/**
 * Filters form values based on field reactive state (hidden, disabled, readonly)
 * and the 3-tier exclusion config hierarchy.
 *
 * Only affects submission output — internal form state and two-way binding are unaffected.
 *
 * @param rawValue - The unfiltered form value object
 * @param schemaFields - Flattened schema fields from FormSetup (groups/arrays preserved, pages/rows unwrapped)
 * @param formTree - The Angular Signal Forms FieldTree, accessed as `formInstance[key]`
 * @param registry - Field type registry for valueHandling mode lookup
 * @param globalDefaults - Global exclusion defaults from VALUE_EXCLUSION_DEFAULTS
 * @param formOptions - Form-level exclusion overrides from FormOptions
 * @returns Filtered value with excluded field values omitted
 */
export function filterFormValue<T extends Record<string, unknown>>(
  rawValue: T,
  schemaFields: FieldDef<unknown>[],
  formTree: Record<string, FieldTree<unknown>>,
  registry: Map<string, FieldTypeDefinition>,
  globalDefaults: ResolvedValueExclusionConfig,
  formOptions: ValueExclusionConfig | undefined,
): Partial<T> {
  const result: Record<string, unknown> = {};

  for (const field of schemaFields) {
    const key = field.key;
    if (!key) continue;

    // Skip fields that don't contribute to form values
    const valueHandling = getFieldValueHandling(field.type, registry);
    if (valueHandling === 'exclude' || valueHandling === 'flatten') continue;

    // If the key doesn't exist in the raw value, skip
    if (!(key in rawValue)) continue;

    // Try to access the field state from the form tree
    const fieldState = formTree[key] as FieldTree<unknown> | undefined;

    // If no field state is available (e.g., componentless hidden fields),
    // include the value as-is since we can't determine reactive state
    if (!fieldState || typeof fieldState !== 'function') {
      result[key] = rawValue[key];
      continue;
    }

    // Resolve per-field exclusion config
    const fieldExclusion: ValueExclusionConfig = {
      excludeValueIfHidden: field.excludeValueIfHidden,
      excludeValueIfDisabled: field.excludeValueIfDisabled,
      excludeValueIfReadonly: field.excludeValueIfReadonly,
    };
    const resolvedConfig = resolveExclusionConfig(globalDefaults, formOptions, fieldExclusion);

    // Check if this field should be excluded based on its state
    if (shouldExcludeField(fieldState, resolvedConfig)) {
      continue;
    }

    // Handle group fields: recurse into nested structure
    if (isGroupField(field) && field.fields) {
      const groupValue = rawValue[key] as Record<string, unknown> | undefined;
      if (groupValue && typeof groupValue === 'object') {
        const childFields = Object.values(field.fields) as FieldDef<unknown>[];
        const nestedTree = fieldState as unknown as Record<string, FieldTree<unknown>>;
        result[key] = filterFormValue(
          groupValue as Record<string, unknown>,
          childFields,
          nestedTree,
          registry,
          globalDefaults,
          formOptions,
        );
      } else {
        result[key] = groupValue;
      }
      continue;
    }

    // Handle array fields: if not excluded at array level, include entire array value
    // (v1: no per-item filtering)
    if (isArrayField(field)) {
      result[key] = rawValue[key];
      continue;
    }

    // Leaf field: include value
    result[key] = rawValue[key];
  }

  return result as Partial<T>;
}
