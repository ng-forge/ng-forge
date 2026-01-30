import { FormConfig, EvaluationContext } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'email',
      type: 'input',
      label: 'Email (auto-lowercase debounced)',
      value: '',
      col: 6,
      logic: [
        {
          type: 'derivation',
          expression: 'formValue.email.toLowerCase()',
          trigger: 'debounced',
        },
      ],
    },
    {
      key: 'username',
      type: 'input',
      label: 'Username (auto-trim debounced)',
      value: '',
      col: 6,
      logic: [
        {
          type: 'derivation',
          expression: 'formValue.username.trim()',
          trigger: 'debounced',
        },
      ],
    },
    {
      key: 'phone',
      type: 'input',
      label: 'Phone (format debounced)',
      value: '',
      props: { placeholder: 'Enter 10 digits' },
      col: 6,
      logic: [
        {
          type: 'derivation',
          functionName: 'formatPhoneNumber',
          trigger: 'debounced',
          dependsOn: ['phone'],
        },
      ],
    },
    {
      key: 'creditCard',
      type: 'input',
      label: 'Credit Card (mask debounced)',
      value: '',
      props: { placeholder: 'Enter 16 digits' },
      col: 6,
      logic: [
        {
          type: 'derivation',
          functionName: 'maskCreditCard',
          trigger: 'debounced',
          dependsOn: ['creditCard'],
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

export const selfTransformScenario: TestScenario = {
  testId: 'self-transform-test',
  title: 'Self-Transform Derivation (Debounced)',
  description: 'Tests self-transforming fields that modify their own value after typing stops (e.g., lowercase, trim, format)',
  config,
  customFnConfig: {
    derivations: {
      formatPhoneNumber: (context: EvaluationContext) => {
        const phone = String(context.formValue.phone ?? '').replace(/\D/g, '');
        if (phone.length === 10) {
          return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
        }
        return phone;
      },
      maskCreditCard: (context: EvaluationContext) => {
        const card = String(context.formValue.creditCard ?? '').replace(/\D/g, '');
        if (card.length >= 4) {
          return '*'.repeat(card.length - 4) + card.slice(-4);
        }
        return card;
      },
    },
  },
};
