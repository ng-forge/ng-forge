import { ResolvedValidationExecutionConfig, ValidationExecutionConfig } from '../../../models/validation-execution-config';
import { createFeature, DynamicFormFeature } from '../dynamic-form-feature';
import { VALIDATION_EXECUTION_DEFAULTS } from './validation-execution.token';

/**
 * Configures global validation execution defaults — when validators should run
 * relative to a field's reactive state.
 *
 * @remarks
 * **Precedence rules:**
 * 1. Per-field `FieldDef.validateWhenHidden` — wins for that field; inherits down to descendants
 *    that don't override.
 * 2. Per-form `FormOptions.validateWhenHidden` — root inherited value for the form.
 * 3. Global `withValidationExecutionDefaults()` — fallback when no form/field setting.
 * 4. No feature configured — uses token default (`validateWhenHidden: false`).
 * @param config - Partial override. Unspecified properties keep their defaults.
 * @returns A `DynamicFormFeature` that configures validation execution defaults.
 */
export function withValidationExecutionDefaults(config?: Partial<ValidationExecutionConfig>): DynamicFormFeature<'validation-execution'> {
  const resolved: ResolvedValidationExecutionConfig = {
    validateWhenHidden: config?.validateWhenHidden ?? false,
  };

  return createFeature('validation-execution', [{ provide: VALIDATION_EXECUTION_DEFAULTS, useValue: resolved }]);
}
