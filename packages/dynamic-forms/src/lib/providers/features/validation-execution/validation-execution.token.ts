import { InjectionToken } from '@angular/core';
import { ResolvedValidationExecutionConfig } from '../../../models/validation-execution-config';

/**
 * Injection token for global validation execution defaults.
 *
 * @internal
 */
export const VALIDATION_EXECUTION_DEFAULTS = new InjectionToken<ResolvedValidationExecutionConfig>('VALIDATION_EXECUTION_DEFAULTS', {
  providedIn: 'root',
  factory: () => ({
    validateWhenHidden: false,
  }),
});
