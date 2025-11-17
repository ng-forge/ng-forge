import { detectFormMode, FormModeDetectionResult } from '../../models/types/form-mode';
import { RegisteredFieldTypes } from '../../models/registry';
import { validatePageNesting } from '../../definitions/default/page-field';

/**
 * Comprehensive form configuration validator that checks:
 * 1. Form mode consistency (paged vs non-paged)
 * 2. Page nesting rules
 * 3. Field placement constraints
 */
export class FormModeValidator {
  /**
   * Validates a form configuration and returns detailed validation results
   * @param fields The form field definitions to validate
   * @returns Validation result with mode detection and error details
   */
  static validateFormConfiguration<TFields extends RegisteredFieldTypes[]>(fields: TFields): FormConfigurationValidationResult {
    const modeDetection = detectFormMode(fields);
    const additionalErrors: string[] = [];

    // Additional validation for paged forms
    if (modeDetection.mode === 'paged' && modeDetection.isValid) {
      // Validate each page field individually
      for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        if (field.type === 'page') {
          const pageField = field as any;
          if (!validatePageNesting(pageField)) {
            additionalErrors.push(
              `Page field at index ${i} (key: "${pageField.key || 'unknown'}") contains nested page fields, which is not allowed.`,
            );
          }
        }
      }
    }

    const allErrors = [...modeDetection.errors, ...additionalErrors];
    const isFullyValid = modeDetection.isValid && additionalErrors.length === 0;

    return {
      mode: modeDetection.mode,
      isValid: isFullyValid,
      errors: allErrors,
      warnings: this.generateWarnings(fields, modeDetection),
    };
  }

  /**
   * Validates form configuration and throws an error if invalid
   * @param fields The form field definitions to validate
   * @throws Error with detailed validation messages if form is invalid
   */
  static validateFormConfigurationOrThrow<TFields extends RegisteredFieldTypes[]>(fields: TFields): void {
    const result = this.validateFormConfiguration(fields);

    if (!result.isValid) {
      const errorMessage = [`[ng-forge: Dynamic Forms] Invalid form configuration (${result.mode} mode):`, ...result.errors.map((error) => `  - ${error}`)].join(
        '\n',
      );

      throw new Error(errorMessage);
    }
  }

  /**
   * Generates helpful warnings for form configurations
   * @param fields The form field definitions
   * @param modeDetection The mode detection result
   * @returns Array of warning messages
   */
  private static generateWarnings<TFields extends RegisteredFieldTypes[]>(
    fields: TFields,
    modeDetection: FormModeDetectionResult,
  ): string[] {
    const warnings: string[] = [];

    // Warn about single page forms
    if (modeDetection.mode === 'paged' && fields.length === 1) {
      warnings.push('Single page form detected. Consider using non-paged mode for better performance if page navigation is not needed.');
    }

    // Warn about empty pages
    if (modeDetection.mode === 'paged') {
      for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        if (field.type === 'page') {
          const pageField = field as any;
          if (!pageField.fields || pageField.fields.length === 0) {
            warnings.push(`Page field at index ${i} (key: "${pageField.key || 'unknown'}") contains no fields and will render as empty.`);
          }
        }
      }
    }

    return warnings;
  }
}

/**
 * Extended validation result including warnings
 */
export interface FormConfigurationValidationResult extends FormModeDetectionResult {
  /** Array of warning messages that don't prevent form operation */
  warnings: string[];
}

/**
 * Convenience function for quick form mode validation
 * @param fields The form field definitions to validate
 * @returns True if form configuration is valid, false otherwise
 */
export function isValidFormConfiguration<TFields extends RegisteredFieldTypes[]>(fields: TFields): boolean {
  return FormModeValidator.validateFormConfiguration(fields).isValid;
}
