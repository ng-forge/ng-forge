/**
 * Material Design field types using const assertion
 * Provides excellent type safety and autocompletion
 */
export const MatField = {
  // Input variants
  Input: 'input',
  Email: 'email',
  Password: 'password',
  Number: 'number',
  Tel: 'tel',
  Url: 'url',
  Search: 'search',

  // Text area
  Textarea: 'textarea',

  // Selection
  Select: 'select',
  MultiSelect: 'multi-select',
  Radio: 'radio',

  // Boolean
  Checkbox: 'checkbox',
  Toggle: 'toggle',

  // Date/Time
  Datepicker: 'datepicker',
  DateTimeLocal: 'datetime-local',

  // Numeric
  Slider: 'slider',

  // Multi-value
  MultiCheckbox: 'multi-checkbox',

  // Action
  Submit: 'submit',
} as const;

/**
 * Type representing all Material field type values
 */
export type MatFieldType = (typeof MatField)[keyof typeof MatField];

/**
 * Mapping of field types to their expected value types
 * This ensures type safety when working with form values
 */
export interface MatFieldTypeMap {
  [MatField.Input]: string;
  [MatField.Email]: string;
  [MatField.Password]: string;
  [MatField.Number]: number;
  [MatField.Tel]: string;
  [MatField.Url]: string;
  [MatField.Search]: string;
  [MatField.Textarea]: string;
  [MatField.Select]: string;
  [MatField.MultiSelect]: string[];
  [MatField.Radio]: string;
  [MatField.Checkbox]: boolean;
  [MatField.Toggle]: boolean;
  [MatField.Datepicker]: Date;
  [MatField.DateTimeLocal]: Date;
  [MatField.Slider]: number;
  [MatField.MultiCheckbox]: string[];
  [MatField.Submit]: void;
}

/**
 * Helper type to extract the value type for a given field type
 */
export type MatFieldValueType<T extends MatFieldType> = T extends keyof MatFieldTypeMap ? MatFieldTypeMap[T] : unknown;

/**
 * Utility function to get all available Material field types
 * Useful for validation and documentation
 */
export function getAllMatFieldTypes(): MatFieldType[] {
  return Object.values(MatField);
}

/**
 * Type guard to check if a string is a valid Material field type
 */
export function isMatFieldType(type: string): type is MatFieldType {
  return Object.values(MatField).includes(type as MatFieldType);
}

/**
 * Helper function to get the expected value type for a field type
 * Returns the TypeScript type name as a string for runtime validation
 */
export function getMatFieldValueTypeName(type: MatFieldType): string {
  const typeMap: Record<MatFieldType, string> = {
    [MatField.Input]: 'string',
    [MatField.Email]: 'string',
    [MatField.Password]: 'string',
    [MatField.Number]: 'number',
    [MatField.Tel]: 'string',
    [MatField.Url]: 'string',
    [MatField.Search]: 'string',
    [MatField.Textarea]: 'string',
    [MatField.Select]: 'string',
    [MatField.MultiSelect]: 'string[]',
    [MatField.Radio]: 'string',
    [MatField.Checkbox]: 'boolean',
    [MatField.Toggle]: 'boolean',
    [MatField.Datepicker]: 'Date',
    [MatField.DateTimeLocal]: 'Date',
    [MatField.Slider]: 'number',
    [MatField.MultiCheckbox]: 'string[]',
    [MatField.Submit]: 'void',
  };

  return typeMap[type];
}
