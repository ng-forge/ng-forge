import { isSignal, Pipe, PipeTransform } from '@angular/core';
import { WithOptionalField } from '@angular/forms/signals';
import { isObservable } from 'rxjs';
import { ValidationError, ValidationMessages } from '../../models/validation-types';
import { DynamicText } from '../index';

/**
 * Pipe that processes validation errors and applies custom validation messages.
 *
 * Transforms ValidationError[] into ValidationError[] with custom messages, supporting:
 * - Parameter interpolation using error values (min, max, etc.)
 * - Custom validation messages from field configuration
 * - Static strings, Signals, and Observables for custom messages
 * - Fallback to original error message if no custom message provided
 *
 * @example
 * ```html
 * <!-- Basic usage -->
 * @for (error of (field.errors() | validationErrors); track error) {
 * <mat-error>
 *   {{ error.message }}
 * </mat-error>
 * }
 *
 * <!-- With custom validation messages -->
 * @for (error of (field.errors() | validationErrors:field.validationMessages()); track error) {
 * <mat-error>
 *   {{ error.message }}
 * </mat-error>
 * }
 * ```
 *
 * Custom validation messages example:
 * ```typescript
 * {
 *   required: "This field is required",
 *   email: "Please enter a valid email address",
 *   min: "Value must be at least {{min}}",
 *   max: "Value must be at most {{max}}",
 *   minLength: "Must be at least {{requiredLength}} characters",
 *   maxLength: "Must be at most {{requiredLength}} characters",
 *   pattern: "Invalid format"
 * }
 * ```
 *
 * @public
 */
@Pipe({
  name: 'validationErrors',
  standalone: true,
})
export class ValidationErrorsPipe implements PipeTransform {
  /**
   * Transforms validation errors with custom validation messages
   *
   * @param errors - Array of validation errors to process
   * @param validationMessages - Optional validation messages from field configuration
   * @returns Array of validation errors with custom messages applied
   */
  transform(
    errors: readonly WithOptionalField<ValidationError>[] | ValidationError[] | null,
    validationMessages?: ValidationMessages
  ): ValidationError[] {
    if (!errors) {
      return [];
    }

    return this.processErrors(errors as ValidationError[], validationMessages);
  }

  private processErrors(errors: ValidationError[], validationMessages?: ValidationMessages): ValidationError[] {
    if (!validationMessages) {
      // No validation messages, return as-is
      return errors;
    }

    return errors.map((error) => {
      const customMessage = validationMessages[error.kind];

      if (customMessage !== undefined) {
        // Use custom validation message
        const message = this.resolveMessage(customMessage, error);
        return { ...error, message };
      } else {
        // No custom message for this error kind, keep original
        return error;
      }
    });
  }

  private resolveMessage(message: DynamicText, error: ValidationError): string {
    if (typeof message === 'string') {
      return this.interpolateParams(message, error);
    }

    if (isSignal(message)) {
      // Read signal value synchronously
      const messageStr = String(message());
      return this.interpolateParams(messageStr, error);
    }

    if (isObservable(message)) {
      // For observables, we can't do async work in a pure pipe
      // Just return the original message or a fallback
      return error.message || 'Validation error';
    }

    // Handle other types by converting to string
    const messageStr = String(message);
    return this.interpolateParams(messageStr, error);
  }

  private extractErrorParams(error: ValidationError): Record<string, unknown> {
    const params: Record<string, unknown> = {};

    // Common validation error parameters
    if ('min' in error) params.min = error.min;
    if ('max' in error) params.max = error.max;
    if ('requiredLength' in error) params.requiredLength = error.requiredLength;
    if ('actualLength' in error) params.actualLength = error.actualLength;
    if ('pattern' in error) params.pattern = error.pattern;
    if ('actual' in error) params.actual = error.actual;
    if ('expected' in error) params.expected = error.expected;

    return params;
  }

  private interpolateParams(message: string, error: ValidationError): string {
    let result = message;
    const params = this.extractErrorParams(error);

    Object.entries(params).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(placeholder, String(value));
    });

    return result;
  }
}
