import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * All Fields ARIA Attributes Test Scenario
 * Tests that ALL field types have proper ARIA attributes for accessibility
 */
const config = {
  defaultValidationMessages: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    minLength: 'Must be at least {{requiredLength}} characters',
  },
  fields: [
    // Input field
    {
      key: 'inputField',
      type: 'input',
      label: 'Input Field',
      required: true,
      props: {
        hint: 'Enter some text',
      },
    },
    // Textarea field
    {
      key: 'textareaField',
      type: 'textarea',
      label: 'Textarea Field',
      required: true,
      props: {
        hint: 'Enter a longer description',
        rows: 3,
      },
    },
    // Select field - options at field level
    {
      key: 'selectField',
      type: 'select',
      label: 'Select Field',
      required: true,
      options: [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
        { label: 'Option 3', value: 'option3' },
      ],
      props: {
        hint: 'Choose an option',
      },
    },
    // Checkbox field
    {
      key: 'checkboxField',
      type: 'checkbox',
      label: 'Checkbox Field',
      required: true,
      props: {
        hint: 'Check this box',
      },
    },
    // Toggle field
    {
      key: 'toggleField',
      type: 'toggle',
      label: 'Toggle Field',
      required: true,
      props: {
        hint: 'Toggle this switch',
      },
    },
    // Radio field - options at field level
    {
      key: 'radioField',
      type: 'radio',
      label: 'Radio Field',
      required: true,
      options: [
        { label: 'Radio 1', value: 'radio1' },
        { label: 'Radio 2', value: 'radio2' },
        { label: 'Radio 3', value: 'radio3' },
      ],
      props: {
        hint: 'Select one option',
      },
    },
    // Multi-checkbox field - options at field level
    {
      key: 'multiCheckboxField',
      type: 'multi-checkbox',
      label: 'Multi-Checkbox Field',
      required: true,
      options: [
        { label: 'Check 1', value: 'check1' },
        { label: 'Check 2', value: 'check2' },
        { label: 'Check 3', value: 'check3' },
      ],
      props: {
        hint: 'Select multiple options',
      },
    },
    // Slider field - minValue/maxValue at field level
    {
      key: 'sliderField',
      type: 'slider',
      label: 'Slider Field',
      minValue: 0,
      maxValue: 100,
      props: {
        hint: 'Adjust the value',
      },
    },
    // Datepicker field
    {
      key: 'datepickerField',
      type: 'datepicker',
      label: 'Datepicker Field',
      required: true,
      props: {
        hint: 'Select a date',
      },
    },
    // Submit button
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
    },
  ],
} as const satisfies FormConfig;

export const allFieldsAriaScenario: TestScenario = {
  testId: 'all-fields-aria',
  title: 'All Fields ARIA Attributes',
  description: 'Tests aria-invalid, aria-required, and aria-describedby attributes on ALL field types',
  config,
};
