import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  options: {
    webMcp: {
      name: 'signup',
      description: 'Sign a new user up with a username, plan and newsletter preference.',
      allowSubmit: true,
    },
  },
  defaultValidationMessages: {
    required: 'This field is required',
    minLength: 'Must be at least 3 characters',
  },
  fields: [
    {
      key: 'username',
      type: 'input',
      label: 'Username',
      required: true,
      validators: [{ type: 'minLength', value: 3 }],
      col: 12,
    },
    {
      key: 'plan',
      type: 'select',
      label: 'Plan',
      value: 'free',
      options: [
        { label: 'Free', value: 'free' },
        { label: 'Pro', value: 'pro' },
      ],
      col: 12,
    },
    {
      key: 'newsletter',
      type: 'checkbox',
      label: 'Subscribe to the newsletter',
      col: 12,
    },
    {
      key: 'referral',
      type: 'input',
      label: 'Referral code',
      logic: [{ type: 'hidden', condition: { type: 'fieldValue', fieldPath: 'plan', operator: 'equals', value: 'free' } }],
      col: 12,
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const agentFillSubmitScenario: TestScenario = {
  testId: 'agent-fill-submit-test',
  title: 'Agent Fill and Submit',
  description: 'A form exposed to browser AI agents through WebMCP tools',
  config,
};
