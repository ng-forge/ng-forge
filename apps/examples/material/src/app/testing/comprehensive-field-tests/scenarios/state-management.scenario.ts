import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'stateInput1',
      type: 'input',
      label: 'State Input 1',
      props: {
        placeholder: 'Enter value 1',
      },
      col: 6,
    },
    {
      key: 'stateInput2',
      type: 'input',
      label: 'State Input 2',
      props: {
        placeholder: 'Enter value 2',
      },
      col: 6,
    },
    {
      key: 'stateCheckbox',
      type: 'checkbox',
      label: 'State Checkbox',
      col: 12,
    },
    {
      key: 'submitState',
      type: 'submit',
      label: 'Submit State Test',
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const stateManagementScenario: TestScenario = {
  testId: 'state-management-test',
  title: 'Form State Management',
  description: 'Testing form state tracking and management',
  config,
};
