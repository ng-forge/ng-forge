import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'subscriptionType',
      type: 'select',
      label: 'Subscription Type',
      value: '',
      options: [
        { label: 'Free', value: 'free' },
        { label: 'Premium', value: 'premium' },
      ],
      col: 12,
    },
    {
      key: 'paymentMethod',
      type: 'input',
      label: 'Payment Method',
      value: '',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'subscriptionType',
            operator: 'equals',
            value: 'free',
          },
        },
      ],
      col: 12,
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
      props: {
        type: 'submit',
        color: 'primary',
      },
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const hiddenLogicScenario: TestScenario = {
  testId: 'hidden-logic-test',
  title: 'Hide/Show Fields Based on fieldValue Condition',
  description: 'Tests hiding and showing fields based on another field value',
  config,
};
