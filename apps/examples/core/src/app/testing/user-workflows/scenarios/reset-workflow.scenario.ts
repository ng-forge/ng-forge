import { FormConfig, FormResetEvent } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'name',
      type: 'input',
      label: 'Name',
      value: 'Default Name',
    },
    {
      key: 'description',
      type: 'textarea',
      label: 'Description',
      value: 'Default description',
    },
    {
      key: 'active',
      type: 'checkbox',
      label: 'Active',
      value: true,
    },
    {
      key: 'reset',
      type: 'button',
      label: 'Reset Form',
      event: FormResetEvent,
      props: {
        type: 'button',
      },
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
    },
  ],
} as const satisfies FormConfig;

export const resetWorkflowScenario: TestScenario = {
  testId: 'reset-workflow',
  title: 'Form Reset Workflow',
  description: 'Tests form reset functionality',
  config,
};
