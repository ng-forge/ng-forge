import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
  },
  fields: [
    // Toggle with helper text
    {
      key: 'toggleWithHint',
      type: 'toggle',
      label: 'Toggle with Helper Text',
      props: {
        helperText: 'Enable this option to activate the feature',
      },
      col: 12,
    },
    // Checkbox with helper text
    {
      key: 'checkboxWithHint',
      type: 'checkbox',
      label: 'Checkbox with Helper Text',
      props: {
        helperText: 'Check this box to agree to the terms',
      },
      col: 12,
    },
    // Slider with helper text
    {
      key: 'sliderWithHint',
      type: 'slider',
      label: 'Slider with Helper Text',
      props: {
        min: 0,
        max: 100,
        helperText: 'Adjust the slider to set your preference (0-100)',
      },
      col: 12,
    },
    // Select with helper text
    {
      key: 'selectWithHint',
      type: 'select',
      label: 'Select with Helper Text',
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' },
      ],
      props: {
        helperText: 'Choose one option from the dropdown',
      },
      col: 12,
    },
    // Radio with helper text
    {
      key: 'radioWithHint',
      type: 'radio',
      label: 'Radio with Helper Text',
      options: [
        { value: 'a', label: 'Choice A' },
        { value: 'b', label: 'Choice B' },
        { value: 'c', label: 'Choice C' },
      ],
      props: {
        helperText: 'Select one of the available choices',
      },
      col: 12,
    },
    // Multi-checkbox with helper text
    {
      key: 'multiCheckboxWithHint',
      type: 'multi-checkbox',
      label: 'Multi-checkbox with Helper Text',
      options: [
        { value: 'item1', label: 'Item 1' },
        { value: 'item2', label: 'Item 2' },
        { value: 'item3', label: 'Item 3' },
      ],
      props: {
        helperText: 'Select all that apply',
      },
      col: 12,
    },
    // Datepicker with helper text
    {
      key: 'datepickerWithHint',
      type: 'datepicker',
      label: 'Datepicker with Helper Text',
      props: {
        helperText: 'Select your preferred date',
      },
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const helperTextFieldsScenario: TestScenario = {
  testId: 'helper-text-fields-test',
  title: 'Helper Text Fields',
  description: 'Testing helper text display on all field types',
  config,
};
