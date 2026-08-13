import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * The default posture: an agent can fill this form, but only a human can submit
 * it. No `allowSubmit`, so no submit tool is ever registered.
 */
const config = {
  options: {
    webMcp: {
      name: 'payment',
      description: 'Take a payment for an order.',
    },
  },
  defaultValidationMessages: {
    required: 'This field is required',
  },
  fields: [
    {
      key: 'cardholder',
      type: 'input',
      label: 'Cardholder name',
      required: true,
      col: 12,
    },
    {
      key: 'amount',
      type: 'input',
      label: 'Amount',
      props: { type: 'number' },
      col: 12,
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Pay',
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const agentFillOnlyScenario: TestScenario = {
  testId: 'agent-fill-only-test',
  title: 'Agent Fill Only',
  description: 'A form an agent can fill but not submit (the default)',
  config,
};
