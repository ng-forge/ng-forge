import { FormConfig, EvaluationContext } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'basePrice',
      type: 'input',
      label: 'Base Price',
      value: 100,
      props: { type: 'number' },
      col: 3,
    },
    {
      key: 'priceWithMarkup',
      type: 'input',
      label: 'Price with 20% Markup',
      value: 120,
      props: { type: 'number' },
      readonly: true,
      col: 3,
      derivation: 'formValue.basePrice * 1.2',
    },
    {
      key: 'priceWithTax',
      type: 'input',
      label: 'Price with 10% Tax',
      value: 132,
      props: { type: 'number' },
      readonly: true,
      col: 3,
      derivation: 'formValue.priceWithMarkup * 1.1',
    },
    {
      key: 'shippingCost',
      type: 'input',
      label: 'Shipping Cost',
      value: 10,
      props: { type: 'number' },
      col: 3,
    },
    {
      key: 'finalPrice',
      type: 'input',
      label: 'Final Price (Chain Result)',
      value: 142,
      props: { type: 'number' },
      readonly: true,
      col: 12,
      derivation: 'formValue.priceWithTax + formValue.shippingCost',
    },
    {
      key: 'firstName',
      type: 'input',
      label: 'First Name',
      value: 'John',
      col: 4,
    },
    {
      key: 'lastName',
      type: 'input',
      label: 'Last Name',
      value: 'Doe',
      col: 4,
    },
    {
      key: 'initials',
      type: 'input',
      label: 'Initials',
      value: 'JD',
      readonly: true,
      col: 4,
      logic: [
        {
          type: 'derivation',
          functionName: 'getInitials',
          dependsOn: ['firstName', 'lastName'],
        },
      ],
    },
    {
      key: 'displayName',
      type: 'input',
      label: 'Display Name (Derived from Initials)',
      value: 'JD - John Doe',
      readonly: true,
      col: 12,
      derivation: 'formValue.initials + " - " + formValue.firstName + " " + formValue.lastName',
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

export const chainDerivationScenario: TestScenario = {
  testId: 'chain-derivation-test',
  title: 'Chain Derivation (A -> B -> C)',
  description: 'Tests cascading derivations where derived values trigger further derivations',
  config,
  customFnConfig: {
    derivations: {
      getInitials: (context: EvaluationContext) => {
        const firstName = String(context.formValue.firstName ?? '');
        const lastName = String(context.formValue.lastName ?? '');
        return (firstName.charAt(0) || '') + (lastName.charAt(0) || '');
      },
    },
  },
};
