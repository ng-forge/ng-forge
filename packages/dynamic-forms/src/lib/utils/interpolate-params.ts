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
    result = result.replace(placeholder, safeToString(value));
  });

  return result;
}

/**
 * Safely converts a value to a string, handling complex objects
 * @internal
 */
function safeToString(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  // Handle primitives directly
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  // Handle RegExp (has its own toString)
  if (value instanceof RegExp) {
    return value.toString();
  }

  // Handle Date
  if (value instanceof Date) {
    return value.toISOString();
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return value.join(', ');
  }

  // For objects, try JSON.stringify first, fall back to empty string
  try {
    // Check if object has a custom toString that's not Object.prototype.toString
    if (typeof value === 'object' && value.toString !== Object.prototype.toString) {
      return value.toString();
    }
    // Otherwise use JSON representation
    return JSON.stringify(value);
  } catch {
    // If JSON.stringify fails (circular reference, etc.), return empty string
    return '[object]';
  }
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
  if ('pattern' in error) params.pattern = error.pattern;
  if ('actual' in error) params.actual = error.actual;
  if ('expected' in error) params.expected = error.expected;

  // Handle length validation parameters
  // Angular Signal Forms uses 'minLength'/'maxLength' properties
  // Angular Classic Forms uses 'requiredLength'/'actualLength' properties
  // We support both formats and normalize to 'requiredLength' for message templates
  if ('requiredLength' in error) {
    params.requiredLength = error.requiredLength;
  } else if ('minLength' in error) {
    // Angular Signal Forms: minLength property maps to requiredLength for templates
    params.requiredLength = error.minLength;
    params.minLength = error.minLength;
  } else if ('maxLength' in error) {
    // Angular Signal Forms: maxLength property maps to requiredLength for templates
    params.requiredLength = error.maxLength;
    params.maxLength = error.maxLength;
  }
  if ('actualLength' in error) params.actualLength = error.actualLength;

  // Include all custom properties from error object (for custom validators)
  // Skip 'kind' as it's the error type identifier, not a parameter
  Object.keys(error).forEach((key) => {
    if (key !== 'kind' && !(key in params)) {
      params[key] = error[key as keyof ValidationError];
    }
  });

  return params;
}
