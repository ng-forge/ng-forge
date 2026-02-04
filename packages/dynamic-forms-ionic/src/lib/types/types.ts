/**
 * Ionic field type constants
 * Based on available field components in the /fields folder
 */
export const IonicField = {
  Input: 'input',
  Select: 'select',
  Checkbox: 'checkbox',
  Button: 'button',
  Submit: 'submit',
  Next: 'next',
  Previous: 'previous',
  AddArrayItem: 'addArrayItem',
  PrependArrayItem: 'prependArrayItem',
  InsertArrayItem: 'insertArrayItem',
  RemoveArrayItem: 'removeArrayItem',
  PopArrayItem: 'popArrayItem',
  ShiftArrayItem: 'shiftArrayItem',
  Textarea: 'textarea',
  Radio: 'radio',
  MultiCheckbox: 'multi-checkbox',
  Datepicker: 'datepicker',
  Slider: 'slider',
  Toggle: 'toggle',
} as const;

export type IonicFieldType = (typeof IonicField)[keyof typeof IonicField];
