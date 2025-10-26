/**
 * Material Design field types using const assertion
 * Provides excellent type safety and autocompletion
 */
export const MatField = {
  // Input variants
  INPUT: 'input',
  EMAIL: 'email',
  PASSWORD: 'password',
  NUMBER: 'number',
  TEL: 'tel',
  URL: 'url',
  SEARCH: 'search',

  // Text area
  TEXTAREA: 'textarea',

  // Selection
  SELECT: 'select',
  MULTI_SELECT: 'multi-select',
  RADIO: 'radio',

  // Boolean
  CHECKBOX: 'checkbox',
  TOGGLE: 'toggle',

  // Date/Time
  DATEPICKER: 'datepicker',
  DATETIME_LOCAL: 'datetime-local',

  // Numeric
  SLIDER: 'slider',

  // Multi-value
  MULTI_CHECKBOX: 'multi-checkbox',

  // Action
  SUBMIT: 'submit',
} as const;

/**
 * Type representing all Material field type values
 */
export type MatFieldType = typeof MatField[keyof typeof MatField];

/**
 * Mapping of field types to their expected value types
 * This ensures type safety when working with form values
 */
export interface MatFieldTypeMap {
  [MatField.INPUT]: string;
  [MatField.EMAIL]: string;
  [MatField.PASSWORD]: string;
  [MatField.NUMBER]: number;
  [MatField.TEL]: string;
  [MatField.URL]: string;
  [MatField.SEARCH]: string;
  [MatField.TEXTAREA]: string;
  [MatField.SELECT]: string;
  [MatField.MULTI_SELECT]: string[];
  [MatField.RADIO]: string;
  [MatField.CHECKBOX]: boolean;
  [MatField.TOGGLE]: boolean;
  [MatField.DATEPICKER]: Date;
  [MatField.DATETIME_LOCAL]: Date;
  [MatField.SLIDER]: number;
  [MatField.MULTI_CHECKBOX]: string[];
  [MatField.SUBMIT]: void;
}

/**
 * Helper type to extract the value type for a given field type
 */
export type MatFieldValueType<T extends MatFieldType> = T extends keyof MatFieldTypeMap 
  ? MatFieldTypeMap[T] 
  : unknown;

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
    [MatField.INPUT]: 'string',
    [MatField.EMAIL]: 'string',
    [MatField.PASSWORD]: 'string',
    [MatField.NUMBER]: 'number',
    [MatField.TEL]: 'string',
    [MatField.URL]: 'string',
    [MatField.SEARCH]: 'string',
    [MatField.TEXTAREA]: 'string',
    [MatField.SELECT]: 'string',
    [MatField.MULTI_SELECT]: 'string[]',
    [MatField.RADIO]: 'string',
    [MatField.CHECKBOX]: 'boolean',
    [MatField.TOGGLE]: 'boolean',
    [MatField.DATEPICKER]: 'Date',
    [MatField.DATETIME_LOCAL]: 'Date',
    [MatField.SLIDER]: 'number',
    [MatField.MULTI_CHECKBOX]: 'string[]',
    [MatField.SUBMIT]: 'void',
  };
  
  return typeMap[type];
}