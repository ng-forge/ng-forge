/**
 * Type augmentation for Material Design field types
 * This extends the global FieldTypeMap to include Material-specific field types
 */

declare module '@ng-forge/dynamic-form' {
  interface FieldTypeMap {
    // Input variants
    input: string;
    email: string;
    password: string;
    number: number;
    tel: string;
    url: string;
    search: string;

    // Text area
    textarea: string;

    // Selection
    select: string;
    'multi-select': string[];
    radio: string;

    // Boolean
    checkbox: boolean;
    toggle: boolean;

    // Date/Time
    datepicker: Date;
    'datetime-local': Date;

    // Numeric
    slider: number;

    // Multi-value
    'multi-checkbox': string[];

    // Action
    submit: void;
  }
}

export {};
