/**
 * Material Design field type constants
 * Based on available field components in the /fields folder
 */
export const MatField = {
  Input: 'input',
  Select: 'select',
  Checkbox: 'checkbox',
  Submit: 'submit',
  Textarea: 'textarea',
  Radio: 'radio',
  MultiCheckbox: 'multi-checkbox',
  Datepicker: 'datepicker',
  Slider: 'slider',
  Toggle: 'toggle',
} as const;

export type MatFieldType = (typeof MatField)[keyof typeof MatField];
