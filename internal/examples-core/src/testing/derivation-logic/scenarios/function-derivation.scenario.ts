import { FormConfig, EvaluationContext } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'price',
      type: 'input',
      label: 'Price',
      value: 100,
      props: { type: 'number' },
      col: 4,
    },
    {
      key: 'discountCode',
      type: 'select',
      label: 'Discount Code',
      value: '',
      options: [
        { label: 'None', value: '' },
        { label: 'SAVE10 (10% off)', value: 'SAVE10' },
        { label: 'SAVE25 (25% off)', value: 'SAVE25' },
        { label: 'HALF (50% off)', value: 'HALF' },
      ],
      col: 4,
    },
    {
      key: 'discountedPrice',
      type: 'input',
      label: 'Discounted Price',
      value: 100,
      props: { type: 'number' },
      readonly: true,
      col: 4,
      logic: [
        {
          type: 'derivation',
          functionName: 'calculateDiscountedPrice',
          dependsOn: ['price', 'discountCode'],
        },
      ],
    },
    {
      key: 'dateOfBirth',
      type: 'datepicker',
      label: 'Date of Birth',
      col: 6,
    },
    {
      key: 'age',
      type: 'input',
      label: 'Age',
      value: '',
      readonly: true,
      col: 6,
      logic: [
        {
          type: 'derivation',
          functionName: 'calculateAge',
          dependsOn: ['dateOfBirth'],
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

export const functionDerivationScenario: TestScenario = {
  testId: 'function-derivation-test',
  title: 'Function-Based Derivation',
  description: 'Tests deriving values using custom functions for complex business logic',
  config,
  customFnConfig: {
    derivations: {
      calculateDiscountedPrice: (context: EvaluationContext) => {
        const price = (context.formValue.price as number) ?? 0;
        const code = (context.formValue.discountCode as string) ?? '';
        const discounts: Record<string, number> = {
          SAVE10: 0.1,
          SAVE25: 0.25,
          HALF: 0.5,
        };
        const discount = discounts[code] ?? 0;
        return price * (1 - discount);
      },
      calculateAge: (context: EvaluationContext) => {
        const dob = context.formValue.dateOfBirth;
        if (!dob) return '';
        const birthDate = new Date(dob as string | Date);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age;
      },
    },
  },
};
