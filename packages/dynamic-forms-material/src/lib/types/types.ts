/**
 * Material Design field type constants
 * Based on available field components in the /fields folder
 */
export const MatField = {
  Input: 'input',
  Select: 'select',
  Checkbox: 'checkbox',
  Button: 'button',
  Submit: 'submit',
  Next: 'next',
  Previous: 'previous',
  AddArrayItem: 'add-array-item',
  PrependArrayItem: 'prepend-array-item',
  InsertArrayItem: 'insert-array-item',
  RemoveArrayItem: 'remove-array-item',
  PopArrayItem: 'pop-array-item',
  ShiftArrayItem: 'shift-array-item',
  Textarea: 'textarea',
  Radio: 'radio',
  MultiCheckbox: 'multi-checkbox',
  Datepicker: 'datepicker',
  Slider: 'slider',
  Toggle: 'toggle',
} as const;

export type MatFieldType = (typeof MatField)[keyof typeof MatField];
