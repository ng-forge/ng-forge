import { ValueExclusionConfig } from '../../../models/value-exclusion-config';
import { createFeature, DynamicFormFeature } from '../dynamic-form-feature';
import { VALUE_EXCLUSION_DEFAULTS } from './value-exclusion.token';

/**
 * Configures global value exclusion defaults for form submission output.
 *
 * When enabled (default), field values are excluded from the `(submitted)` output
 * based on their reactive state. This does NOT affect two-way binding (`value` model /
 * `entity`) — fields retain their values internally.
 *
 * @example Default behavior (all exclusions enabled)
 * ```typescript
 * provideDynamicForm(
 *   ...withMaterialFields(),
 *   withValueExclusion()
 * )
 * ```
 *
 * @example Disable specific exclusions
 * ```typescript
 * provideDynamicForm(
 *   ...withMaterialFields(),
 *   withValueExclusion({ excludeValueIfReadonly: false })
 * )
 * ```
 *
 * @example Disable all exclusions (restore pre-v1 behavior)
 * ```typescript
 * provideDynamicForm(
 *   ...withMaterialFields(),
 *   withValueExclusion({
 *     excludeValueIfHidden: false,
 *     excludeValueIfDisabled: false,
 *     excludeValueIfReadonly: false,
 *   })
 * )
 * ```
 *
 * @remarks
 * **Precedence rules:**
 * 1. Per-field `excludeValueIf*` on `FieldDef` — wins for that field
 * 2. Per-form `excludeValueIf*` on `FormOptions` — wins for all fields in that form
 * 3. Global `withValueExclusion()` — baseline default
 * 4. No global feature — uses token default (all enabled)
 *
 * @param config - Partial override of exclusion rules. Unspecified properties default to `true`.
 * @returns A DynamicFormFeature that configures value exclusion defaults
 *
 * @public
 */
export function withValueExclusion(config?: Partial<ValueExclusionConfig>): DynamicFormFeature<'value-exclusion'> {
  const resolved = {
    excludeValueIfHidden: config?.excludeValueIfHidden ?? true,
    excludeValueIfDisabled: config?.excludeValueIfDisabled ?? true,
    excludeValueIfReadonly: config?.excludeValueIfReadonly ?? true,
  };

  return createFeature('value-exclusion', [{ provide: VALUE_EXCLUSION_DEFAULTS, useValue: resolved }]);
}
