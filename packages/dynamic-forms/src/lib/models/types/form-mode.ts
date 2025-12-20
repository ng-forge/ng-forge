import { FieldDef } from '../../definitions/base/field-def';
import { isPageField } from '../../definitions/default/page-field';
import { RegisteredFieldTypes } from '../registry/field-registry';

// Re-export isPageField for external usage
export { isPageField };

/**
 * Interface for fields that contain child fields
 */
interface ContainerField<T> extends FieldDef<T> {
  fields: FieldDef<unknown>[];
}

/**
 * Type guard to check if a field is a container with fields
 */
function isContainerWithFields<T>(field: FieldDef<T>): field is FieldDef<T> & ContainerField<T> {
  return (
    (field.type === 'row' || field.type === 'group' || field.type === 'page') &&
    'fields' in field &&
    Array.isArray((field as ContainerField<T>).fields)
  );
}

/**
 * Form mode enumeration distinguishing between paged and non-paged forms
 */
export type FormMode = 'paged' | 'non-paged';

/**
 * Result of form mode detection with validation details
 */
export interface FormModeDetectionResult {
  /** The detected form mode */
  mode: FormMode;
  /** Whether the form configuration is valid for the detected mode */
  isValid: boolean;
  /** Array of validation errors if form is invalid */
  errors: string[];
}

/**
 * Type guard for paged form configurations
 * A paged form has ALL root-level fields of type 'page'
 */
export function isPagedForm<TFields extends RegisteredFieldTypes[]>(fields: TFields): boolean {
  if (!fields || fields.length === 0) {
    return false;
  }

  return fields.every((field) => isPageField(field));
}

/**
 * Type guard for non-paged form configurations
 * A non-paged form has NO page fields at any level
 */
export function isNonPagedForm<TFields extends RegisteredFieldTypes[]>(fields: TFields): boolean {
  if (!fields || fields.length === 0) {
    return true; // Empty form is considered non-paged
  }

  return !hasAnyPageFields(fields);
}

/**
 * Detects the form mode and validates the configuration
 * @param fields The form field definitions
 * @returns Detection result with mode and validation status
 */
export function detectFormMode<TFields extends RegisteredFieldTypes[]>(fields: TFields): FormModeDetectionResult {
  if (!fields || fields.length === 0) {
    return {
      mode: 'non-paged',
      isValid: true,
      errors: [],
    };
  }

  const hasPageFields = fields.some((field) => isPageField(field));
  const allPagesAtRoot = fields.every((field) => isPageField(field));
  const hasNestedPages = hasNestedPageFields(fields);

  // Determine mode and validate
  if (hasPageFields) {
    const errors: string[] = [];

    // For paged forms, ALL root fields must be pages
    if (!allPagesAtRoot) {
      errors.push('Mixed page and non-page fields at root level. In paged forms, ALL root-level fields must be of type "page".');
    }

    // Check for nested pages in any page field
    if (hasNestedPages) {
      errors.push('Page fields cannot contain nested page fields at any level.');
    }

    return {
      mode: 'paged',
      isValid: errors.length === 0,
      errors,
    };
  } else {
    // Non-paged form
    const errors: string[] = [];

    // Non-paged forms cannot have page fields anywhere
    if (hasAnyPageFields(fields)) {
      errors.push('Page fields are not allowed in non-paged forms.');
    }

    return {
      mode: 'non-paged',
      isValid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Recursively checks if any field definition is a page field
 * @param fields Array of field definitions to check
 * @returns true if any page field is found at any level
 */
function hasAnyPageFields(fields: FieldDef<unknown>[]): boolean {
  for (const field of fields) {
    if (isPageField(field)) {
      return true;
    }

    // Check nested fields in container types
    if (isContainerWithFields(field) && (field.type === 'row' || field.type === 'group')) {
      if (hasAnyPageFields(field.fields)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Checks if fields contain nested page fields within their children
 * (This is different from hasAnyPageFields as it checks NESTED pages, not root pages)
 * @param fields Array of field definitions to check
 * @returns true if nested page fields found
 */
function hasNestedPageFields(fields: FieldDef<unknown>[]): boolean {
  for (const field of fields) {
    // If this is a page field, check if its children contain pages
    if (isPageField(field) && isContainerWithFields(field)) {
      if (hasAnyPageFields(field.fields)) {
        return true;
      }
    }

    // Check other container types for nested pages
    if (isContainerWithFields(field) && (field.type === 'row' || field.type === 'group')) {
      if (hasNestedPageFields(field.fields)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Type predicate for valid paged form configurations
 */
export function isValidPagedForm<TFields extends RegisteredFieldTypes[]>(fields: TFields): boolean {
  const result = detectFormMode(fields);
  return result.mode === 'paged' && result.isValid;
}

/**
 * Type predicate for valid non-paged form configurations
 */
export function isValidNonPagedForm<TFields extends RegisteredFieldTypes[]>(fields: TFields): boolean {
  const result = detectFormMode(fields);
  return result.mode === 'non-paged' && result.isValid;
}
