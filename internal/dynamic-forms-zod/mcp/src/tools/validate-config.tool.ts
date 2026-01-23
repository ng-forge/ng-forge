import { z, ZodError } from 'zod';

// Import form config schemas
import { MatFormConfigSchema } from '../../../material/src';
import { BsFormConfigSchema } from '../../../bootstrap/src';
import { PrimeFormConfigSchema } from '../../../primeng/src';
import { IonicFormConfigSchema } from '../../../ionic/src';

import type { UiIntegration } from '../json-schema/form-config-json-schema';

/**
 * Map of UI integration to form config schema.
 */
const formConfigSchemas: Record<UiIntegration, z.ZodType> = {
  material: MatFormConfigSchema,
  bootstrap: BsFormConfigSchema,
  primeng: PrimeFormConfigSchema,
  ionic: IonicFormConfigSchema,
};

/**
 * Validation result for form configuration.
 */
export interface ValidationResult {
  /**
   * Whether the configuration is valid.
   */
  valid: boolean;

  /**
   * Parsed configuration if valid, undefined otherwise.
   */
  data?: unknown;

  /**
   * Validation errors if invalid.
   */
  errors?: FormattedValidationError[];

  /**
   * Human-readable error summary.
   */
  errorSummary?: string;
}

/**
 * Formatted validation error for easy consumption.
 */
export interface FormattedValidationError {
  /**
   * Path to the invalid field (e.g., 'fields[0].props.type').
   */
  path: string;

  /**
   * Error message.
   */
  message: string;

  /**
   * Expected value or type.
   */
  expected?: string;

  /**
   * Received value.
   */
  received?: string;
}

/**
 * Format a Zod error into user-friendly validation errors.
 */
function formatZodError(error: ZodError): FormattedValidationError[] {
  return error.errors.map((err) => ({
    path: err.path.join('.') || 'root',
    message: err.message,
    expected: 'expected' in err ? String(err.expected) : undefined,
    received: 'received' in err ? String(err.received) : undefined,
  }));
}

/**
 * Generate a human-readable error summary.
 */
function generateErrorSummary(errors: FormattedValidationError[]): string {
  if (errors.length === 0) return '';

  if (errors.length === 1) {
    const err = errors[0];
    return `Validation error at '${err.path}': ${err.message}`;
  }

  const summary = errors.slice(0, 3).map((err) => `  - ${err.path}: ${err.message}`);
  const remaining = errors.length - 3;

  if (remaining > 0) {
    summary.push(`  ... and ${remaining} more error(s)`);
  }

  return `Found ${errors.length} validation errors:\n${summary.join('\n')}`;
}

/**
 * Validate a form configuration against the schema for a UI integration.
 *
 * @param uiIntegration - The UI framework to validate against
 * @param config - The form configuration to validate
 * @returns Validation result with detailed error information
 *
 * @example
 * ```typescript
 * const result = validateFormConfig('material', {
 *   fields: [
 *     { key: 'email', type: 'input', label: 'Email' },
 *   ],
 * });
 *
 * if (result.valid) {
 *   console.log('Valid config:', result.data);
 * } else {
 *   console.error(result.errorSummary);
 * }
 * ```
 */
export function validateFormConfig(uiIntegration: UiIntegration, config: unknown): ValidationResult {
  const schema = formConfigSchemas[uiIntegration];

  if (!schema) {
    return {
      valid: false,
      errors: [
        {
          path: 'uiIntegration',
          message: `Unknown UI integration: ${uiIntegration}. Valid options: material, bootstrap, primeng, ionic`,
        },
      ],
      errorSummary: `Unknown UI integration: ${uiIntegration}`,
    };
  }

  const result = schema.safeParse(config);

  if (result.success) {
    return {
      valid: true,
      data: result.data,
    };
  }

  const errors = formatZodError(result.error);

  return {
    valid: false,
    errors,
    errorSummary: generateErrorSummary(errors),
  };
}

/**
 * Type guard for checking if a value is a valid form config for an integration.
 */
export function isValidFormConfig(uiIntegration: UiIntegration, config: unknown): boolean {
  return validateFormConfig(uiIntegration, config).valid;
}
