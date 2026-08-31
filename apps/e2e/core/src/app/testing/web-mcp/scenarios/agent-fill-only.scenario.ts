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
      // Opaque option values: an agent can only pick the right one from the label.
      key: 'country',
      type: 'select',
      label: 'Billing country',
      options: [
        { label: 'United Kingdom', value: 'GB' },
        { label: 'Germany', value: 'DE' },
        { label: 'Japan', value: 'JP' },
      ],
      col: 12,
    },
    {
      key: 'card',
      type: 'group',
      fields: [
        // Writable so an agent can fill it in, never readable back.
        { key: 'number', type: 'input', label: 'Card number', webMcp: { readable: false }, col: 12 },
        { key: 'expiry', type: 'input', label: 'Expiry', value: '12/30', col: 12 },
      ],
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
