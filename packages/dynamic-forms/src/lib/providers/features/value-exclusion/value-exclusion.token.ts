import { InjectionToken } from '@angular/core';
import { ResolvedValueExclusionConfig } from '../../../models/value-exclusion-config';

/**
 * Injection token for global value exclusion defaults.
 *
 * Controls which field values are excluded from form submission output
 * based on their reactive state (hidden, disabled, readonly).
 *
 * By default, all three exclusion rules are enabled:
 * - Hidden fields are excluded from submission
 * - Disabled fields are excluded from submission
 * - Readonly fields are excluded from submission
 *
 * This token is configured via `withValueExclusionDefaults()` feature function.
 * Per-form overrides can be set via `FormOptions`.
 * Per-field overrides can be set on individual `FieldDef` entries.
 *
 * **Resolution order:** Field > Form > Global (most specific wins).
 *
 * @internal
 */
export const VALUE_EXCLUSION_DEFAULTS = new InjectionToken<ResolvedValueExclusionConfig>('VALUE_EXCLUSION_DEFAULTS', {
  providedIn: 'root',
  factory: () => ({
    excludeValueIfHidden: true,
    excludeValueIfDisabled: true,
    excludeValueIfReadonly: true,
  }),
});
