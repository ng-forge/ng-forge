/**
 * Enum of all PrimeNG field types supported by the dynamic form library.
 * These constants are used to identify field types in the configuration.
 */
export enum PrimeField {
  Input = 'input',
  Select = 'select',
  Checkbox = 'checkbox',
  Button = 'button',
  Submit = 'submit',
  Next = 'next',
  Previous = 'previous',
  AddArrayItem = 'add-array-item',
  PrependArrayItem = 'prepend-array-item',
  InsertArrayItem = 'insert-array-item',
  RemoveArrayItem = 'remove-array-item',
  PopArrayItem = 'pop-array-item',
  ShiftArrayItem = 'shift-array-item',
  Textarea = 'textarea',
  Radio = 'radio',
  MultiCheckbox = 'multi-checkbox',
  Datepicker = 'datepicker',
  Slider = 'slider',
  Toggle = 'toggle',
}

export type PrimeFieldType = `${PrimeField}`;
