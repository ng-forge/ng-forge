import { ValidationError } from '../models/validation-types';

/**
 * Interpolates {{param}} placeholders in message with error values
 *
 * @param message - Message template with {{param}} placeholders
 * @param error - Validation error containing parameter values
 * @returns Message with interpolated parameters
 *
 * @example
 * interpolateParams("Min value is {{min}}", { kind: 'min', min: 5 })
 * // Returns: "Min value is 5"
 */
export function interpolateParams(message: string, error: ValidationError): string {
  let result = message;
  const params = extractErrorParams(error);

  Object.entries(params).forEach(([key, value]) => {
    const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    result = result.replace(placeholder, String(value));
  });

  return result;
}

/**
 * Extracts parameter values from validation error
 * @internal
 */
function extractErrorParams(error: ValidationError): Record<string, unknown> {
  const params: Record<string, unknown> = {};

  // Common validation error parameters
  if ('min' in error) params.min = error.min;
  if ('max' in error) params.max = error.max;
  if ('requiredLength' in error) params.requiredLength = error.requiredLength;
  if ('actualLength' in error) params.actualLength = error.actualLength;
  if ('pattern' in error) params.pattern = error.pattern;
  if ('actual' in error) params.actual = error.actual;
  if ('expected' in error) params.expected = error.expected;

  // Include all custom properties from error object (for custom validators)
  // Skip 'kind' as it's the error type identifier, not a parameter
  Object.keys(error).forEach((key) => {
    if (key !== 'kind' && !(key in params)) {
      params[key] = error[key as keyof ValidationError];
    }
  });

  return params;
}
