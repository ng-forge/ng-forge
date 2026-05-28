import { InjectionToken } from '@angular/core';
import { ResolvedValueExclusionConfig } from '../../../models/value-exclusion-config';

/**
 * Injection token for global value exclusion defaults.
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
