import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Focus Management Test Scenario
 * Tests that focus is properly managed and visible
 */
export const focusManagementScenario: TestScenario = {
  testId: 'focus-management',
  title: 'Focus Management',
  description: 'Tests that focus indicators are visible and focus is properly managed',
  config: {
    defaultValidationMessages: {
      required: 'This field is required',
    },
    fields: [
      {
        key: 'field1',
        type: 'input',
        label: 'First Field',
        required: true,
      },
      {
        key: 'field2',
        type: 'input',
        label: 'Second Field',
        required: true,
      },
      {
        key: 'field3',
        type: 'input',
        label: 'Third Field',
      },
      {
        key: 'submit',
        type: 'submit',
        label: 'Submit',
      },
    ],
  } as const satisfies FormConfig,
};
