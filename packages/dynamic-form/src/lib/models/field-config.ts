// Re-export validation types from the dedicated validation-types module
export type { ValidationMessages, ValidationError, CustomValidator } from './validation-types';

/**
 * Utility function to build validation rules from field properties
 */
// export function buildValidationRules<T>(field: FieldDef): ValidationRules<T> {
//   // If explicit validation is provided, use it
//   if (field.validation) {
//     return field.validation as ValidationRules<T>;
//   }
//
//   // Otherwise, build from implicit properties
//   const rules: ValidationRules<T> = {};
//
//   if (field.required) rules.required = true;
//   if (field.email) rules.email = true;
//   if (field.min !== undefined) rules.min = field.min;
//   if (field.max !== undefined) rules.max = field.max;
//   if (field.minLength !== undefined) rules.minLength = field.minLength;
//   if (field.maxLength !== undefined) rules.maxLength = field.maxLength;
//   if (field.patternRule) {
//     rules.pattern = typeof field.patternRule === 'string' ? new RegExp(field.patternRule) : field.patternRule;
//   }
//
//   return rules;
// }
