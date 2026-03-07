import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    minLength: 'Must be at least {{requiredLength}} characters',
    min: 'Value must be at least {{min}}',
    max: 'Value must be at most {{max}}',
  },
  fields: [
    // Text Input
    {
      key: 'textInput',
      type: 'input',
      label: 'Text Input',
      props: {
        placeholder: 'Enter text',
      },
      required: true,
      col: 6,
    },
    // Email Input
    {
      key: 'emailInput',
      type: 'input',
      label: 'Email Input',
      props: {
        type: 'email',
        placeholder: 'Enter email',
      },
      email: true,
      required: true,
      col: 6,
    },
    // Password Input
    {
      key: 'passwordInput',
      type: 'input',
      label: 'Password',
      props: {
        type: 'password',
        placeholder: 'Enter password',
      },
      required: true,
      minLength: 8,
      col: 6,
    },
    // Number Input
    {
      key: 'numberInput',
      type: 'input',
      label: 'Number Input',
      props: {
        type: 'number',
        placeholder: 'Enter number',
      },
      min: 1,
      max: 100,
      col: 6,
    },
    // Textarea
    {
      key: 'textareaField',
      type: 'textarea',
      label: 'Textarea Field',
      props: {
        placeholder: 'Enter long text',
        rows: 4,
      },
      col: 12,
    },
    // Select Field
    {
      key: 'selectField',
      type: 'select',
      label: 'Select Field',
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' },
      ],
      col: 6,
    },
    // Multi-Select Field
    {
      key: 'multiSelectField',
      type: 'select',
      label: 'Multi-Select Field',
      options: [
        { value: 'tag1', label: 'Tag 1' },
        { value: 'tag2', label: 'Tag 2' },
        { value: 'tag3', label: 'Tag 3' },
      ],
      props: {
        multiple: true,
      },
      col: 6,
    },
    // Radio Field
    {
      key: 'radioField',
      type: 'radio',
      label: 'Radio Field',
      options: [
        { value: 'radio1', label: 'Radio Option 1' },
        { value: 'radio2', label: 'Radio Option 2' },
        { value: 'radio3', label: 'Radio Option 3' },
      ],
      col: 12,
    },
    // Checkbox Field
    {
      key: 'checkboxField',
      type: 'checkbox',
      label: 'Checkbox Field',
      col: 6,
    },
    // Toggle Field
    {
      key: 'toggleField',
      type: 'toggle',
      label: 'Toggle Field',
      col: 6,
    },
    // Multi-Checkbox Field
    {
      key: 'multiCheckboxField',
      type: 'multi-checkbox',
      label: 'Multi-Checkbox Field',
      options: [
        { value: 'check1', label: 'Checkbox 1' },
        { value: 'check2', label: 'Checkbox 2' },
        { value: 'check3', label: 'Checkbox 3' },
      ],
      col: 12,
    },
    // Datepicker Field
    {
      key: 'datepickerField',
      type: 'datepicker',
      label: 'Date Picker',
      col: 6,
    },
    // Slider Field
    {
      key: 'sliderField',
      type: 'slider',
      label: 'Slider Field',
      min: 0,
      max: 100,
      step: 10,
      col: 6,
    },
    // Submit Button
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit All Fields',
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const comprehensiveFieldsScenario: TestScenario = {
  testId: 'comprehensive-fields-test',
  title: 'Comprehensive Field Testing',
  description: 'Testing all available PrimeNG field types',
  config,
};
