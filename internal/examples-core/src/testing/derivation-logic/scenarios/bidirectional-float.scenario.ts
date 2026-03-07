import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Test scenario for bidirectional derivations with floating-point math.
 * This tests that the derivation engine stabilizes without infinite oscillation
 * when using floating-point calculations that could cause rounding issues.
 */
const config = {
  fields: [
    {
      type: 'input',
      key: 'amountUSD',
      label: 'Amount (USD)',
      props: { type: 'number' },
      value: 100,
      col: 6,
      logic: [
        {
          type: 'derivation',
          expression: 'Math.round(formValue.amountEUR * 1.1 * 100) / 100',
          dependsOn: ['amountEUR'],
        },
      ],
    },
    {
      type: 'input',
      key: 'amountEUR',
      label: 'Amount (EUR)',
      props: { type: 'number' },
      value: 90.91,
      col: 6,
      logic: [
        {
          type: 'derivation',
          expression: 'Math.round(formValue.amountUSD / 1.1 * 100) / 100',
          dependsOn: ['amountUSD'],
        },
      ],
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

export const bidirectionalFloatScenario: TestScenario = {
  testId: 'bidirectional-float-test',
  title: 'Bidirectional Float Derivation',
  description: 'Tests that bidirectional derivations with floating-point math stabilize without infinite oscillation',
  config,
};
