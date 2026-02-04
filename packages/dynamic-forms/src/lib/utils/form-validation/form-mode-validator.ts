import { detectFormMode, FormModeDetectionResult, isPageField } from '../../models/types/form-mode';
import { RegisteredFieldTypes } from '../../models/registry';
import { validatePageNesting } from '../../definitions/default/page-field';
import { isRowField, validateRowNesting } from '../../definitions/default/row-field';
import { isGroupField } from '../../definitions/default/group-field';
import { isArrayField } from '../../definitions/default/array-field';
import { FieldDef } from '../../definitions/base/field-def';
import { DynamicFormError } from '../../errors/dynamic-form-error';

/**
 * Comprehensive form configuration validator that checks:
 * 1. Form mode consistency (paged vs non-paged)
 * 2. Page nesting rules
 * 3. Row nesting rules (no hidden fields in rows)
 * 4. Field placement constraints
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
        if (isPageField(field)) {
          if (!validatePageNesting(field)) {
            additionalErrors.push(
              `Page field at index ${i} (key: "${field.key || 'unknown'}") contains nested page fields, which is not allowed.`,
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
      const errorMessage = [`Invalid form configuration (${result.mode} mode):`, ...result.errors.map((error) => `  - ${error}`)].join(
        '\n',
      );

      throw new DynamicFormError(errorMessage);
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
        if (isPageField(field)) {
          if (!field.fields || field.fields.length === 0) {
            warnings.push(`Page field at index ${i} (key: "${field.key || 'unknown'}") contains no fields and will render as empty.`);
          }
        }
      }
    }

    // Warn about hidden fields in rows (they work but don't render, which may be confusing)
    const rowWarnings = this.collectRowHiddenFieldWarnings(fields);
    warnings.push(...rowWarnings);

    return warnings;
  }

  /**
   * Recursively collects warnings for hidden fields inside rows
   * @param fields The form field definitions to check
   * @param path Current path for warning messages
   * @returns Array of warning messages
   */
  private static collectRowHiddenFieldWarnings(fields: readonly FieldDef<unknown>[] | undefined, path = ''): string[] {
    if (!fields) {
      return [];
    }

    const warnings: string[] = [];

    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      const fieldPath = path ? `${path}.fields[${i}]` : `fields[${i}]`;
      const fieldKey = field.key || 'unknown';

      if (isRowField(field)) {
        if (!validateRowNesting(field)) {
          warnings.push(
            `Row field at ${fieldPath} (key: "${fieldKey}") contains hidden fields. ` +
              `Hidden fields in rows don't render anything - consider placing them outside the row.`,
          );
        }
        // Continue checking nested rows within the row's children
        warnings.push(...this.collectRowHiddenFieldWarnings(field.fields, fieldPath));
      } else if (isPageField(field)) {
        // Check rows within pages
        warnings.push(...this.collectRowHiddenFieldWarnings(field.fields, fieldPath));
      } else if (isGroupField(field)) {
        // Check rows within groups
        warnings.push(...this.collectRowHiddenFieldWarnings(field.fields, fieldPath));
      } else if (isArrayField(field)) {
        // Check rows within array templates (new fields[][] structure)
        const itemTemplates = field.fields as readonly (readonly FieldDef<unknown>[])[];
        for (let j = 0; j < itemTemplates.length; j++) {
          const itemFields = itemTemplates[j];
          warnings.push(...this.collectRowHiddenFieldWarnings([...itemFields], `${fieldPath}.fields[${j}]`));
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
