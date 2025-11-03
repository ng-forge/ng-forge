import { DestroyRef, inject, Pipe, PipeTransform, signal } from '@angular/core';
import { isObservable, Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ValidationError } from '../../models/validation-types';
import { DynamicText } from '../types';

/**
 * Injectable translation service interface for validation error translation
 */
export abstract class ValidationTranslationService {
  abstract translate(key: string, params?: Record<string, unknown>): Observable<string>;
  abstract instant(key: string, params?: Record<string, unknown>): string;
}

/**
 * Pipe that translates validation errors using the ValidationError.kind as the translation key base.
 *
 * Transforms ValidationError[] into ValidationError[] with translated messages, supporting:
 * - Translation key pattern: `validation.${error.kind}`
 * - Parameter interpolation using error values (min, max, etc.)
 * - Custom validation messages override
 * - Fallback to original error message if translation service not available
 *
 * @example
 * ```html
 * <!-- Basic usage -->
 * <mat-error *ngFor="let error of (field.errors() | validationErrors)">
 *   {{ error.message }}
 * </mat-error>
 *
 * <!-- With custom validation messages -->
 * <mat-error *ngFor="let error of (field.errors() | validationErrors:customMessages)">
 *   {{ error.message }}
 * </mat-error>
 * ```
 *
 * Translation keys expected:
 * ```json
 * {
 *   "validation": {
 *     "required": "This field is required",
 *     "email": "Please enter a valid email address",
 *     "min": "Value must be at least {{min}}",
 *     "max": "Value must be at most {{max}}",
 *     "minLength": "Must be at least {{requiredLength}} characters",
 *     "maxLength": "Must be at most {{requiredLength}} characters",
 *     "pattern": "Invalid format"
 *   }
 * }
 * ```
 *
 * @public
 */
@Pipe({
  name: 'validationErrors',
  pure: false,
  standalone: true,
})
export class ValidationErrorsPipe implements PipeTransform {
  private readonly destroyRef = inject(DestroyRef);
  private readonly translationService = inject(ValidationTranslationService, { optional: true });

  private readonly currentValue = signal<ValidationError[]>([]);
  private lastInput: ValidationError[] | null = null;
  private lastCustomMessages: Record<string, DynamicText> | undefined = undefined;

  /**
   * Transforms validation errors into translated validation errors
   *
   * @param errors - Array of validation errors to translate
   * @param customMessages - Optional custom validation messages that override default translations
   * @returns Array of validation errors with translated messages
   */
  transform(errors: ValidationError[] | null, customMessages?: Record<string, DynamicText>): ValidationError[] {
    if (!errors) {
      this.currentValue.set([]);
      return [];
    }

    if (this.lastInput === errors && this.lastCustomMessages === customMessages) {
      return this.currentValue();
    }

    this.lastInput = errors;
    this.lastCustomMessages = customMessages;
    this.translateErrors(errors, customMessages);
    return this.currentValue();
  }

  private translateErrors(errors: ValidationError[], customMessages?: Record<string, DynamicText>): void {
    if (!this.translationService && !customMessages) {
      // No translation service and no custom messages, return as-is
      this.currentValue.set(errors);
      return;
    }

    const translatedErrors: ValidationError[] = [];
    let pendingTranslations = 0;
    let completedTranslations = 0;

    const checkCompletion = () => {
      if (completedTranslations === pendingTranslations) {
        this.currentValue.set(translatedErrors);
      }
    };

    errors.forEach((error, index) => {
      const customMessage = customMessages?.[error.kind];

      if (customMessage) {
        // Use custom message
        pendingTranslations++;
        this.resolveCustomMessage(customMessage, error).subscribe((message) => {
          translatedErrors[index] = { ...error, message };
          completedTranslations++;
          checkCompletion();
        });
      } else if (this.translationService) {
        // Use translation service
        pendingTranslations++;
        this.translateError(error).subscribe((message) => {
          translatedErrors[index] = { ...error, message };
          completedTranslations++;
          checkCompletion();
        });
      } else {
        // No translation available, keep original
        translatedErrors[index] = error;
      }
    });

    if (pendingTranslations === 0) {
      this.currentValue.set(translatedErrors);
    }
  }

  private translateError(error: ValidationError): Observable<string> {
    if (!this.translationService) {
      return of(error.message || '');
    }

    const translationKey = `validation.${error.kind}`;
    const params = this.extractErrorParams(error);

    return this.translationService.translate(translationKey, params).pipe(
      startWith(this.translationService.instant(translationKey, params)),
      map((translatedMessage) => {
        // If translation key not found, fall back to original message
        return translatedMessage === translationKey ? error.message || '' : translatedMessage;
      })
    );
  }

  private resolveCustomMessage(customMessage: DynamicText, error: ValidationError): Observable<string> {
    if (typeof customMessage === 'string') {
      return of(this.interpolateParams(customMessage, error));
    }

    if (isObservable(customMessage)) {
      return customMessage.pipe(map((message) => this.interpolateParams(message, error)));
    }

    // Handle signals by reading their value
    if (typeof customMessage === 'function' && 'call' in customMessage) {
      try {
        const messageStr = String(customMessage()); // Call the signal to get its value
        return of(this.interpolateParams(messageStr, error));
      } catch {
        // Fallback if signal call fails
        const messageStr = String(customMessage);
        return of(this.interpolateParams(messageStr, error));
      }
    }

    // Handle other types by converting to string
    const messageStr = String(customMessage);
    return of(this.interpolateParams(messageStr, error));
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
