import { ValueExclusionConfig } from '../../../models/value-exclusion-config';
import { createFeature, DynamicFormFeature } from '../dynamic-form-feature';
import { VALUE_EXCLUSION_DEFAULTS } from './value-exclusion.token';

/**
 * Configures global value exclusion defaults for form submission output.
 *
 * @remarks
 * **Precedence rules:**
 * 1. Per-field `excludeValueIf*` on `FieldDef` — wins for that field
 * 2. Per-form `excludeValueIf*` on `FormOptions` — wins for all fields in that form
 * 3. Global `withValueExclusionDefaults()` — baseline default
 * 4. No global feature — uses token default (all enabled)
 * @param config - Partial override of exclusion rules. Unspecified properties default to `true`.
 * @returns A DynamicFormFeature that configures value exclusion defaults
 */
export function withValueExclusionDefaults(config?: Partial<ValueExclusionConfig>): DynamicFormFeature<'value-exclusion'> {
  const resolved = {
    excludeValueIfHidden: config?.excludeValueIfHidden ?? true,
    excludeValueIfDisabled: config?.excludeValueIfDisabled ?? true,
    excludeValueIfReadonly: config?.excludeValueIfReadonly ?? true,
  };

  return createFeature('value-exclusion', [{ provide: VALUE_EXCLUSION_DEFAULTS, useValue: resolved }]);
}
