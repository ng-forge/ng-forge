import { InjectionToken } from '@angular/core';
import { ResolvedValidationExecutionConfig } from '../../../models/validation-execution-config';

/**
 * Injection token for global validation execution defaults.
 *
 * Controls whether validators run on hidden fields. By default, validation is
 * skipped when a field is hidden (`validateWhenHidden: false`).
 *
 * Configured via `withValidationExecutionDefaults()`. Per-form overrides via
 * `FormOptions.validateWhenHidden`. Per-field overrides via `FieldDef.validateWhenHidden`,
 * which inherits down the field tree.
 *
 * **Resolution order:** Field (with parent inheritance) > Form > Global.
 *
 * @internal
 */
export const VALIDATION_EXECUTION_DEFAULTS = new InjectionToken<ResolvedValidationExecutionConfig>('VALIDATION_EXECUTION_DEFAULTS', {
  providedIn: 'root',
  factory: () => ({
    validateWhenHidden: false,
  }),
});
