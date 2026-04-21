import { FormConfig } from '@ng-forge/dynamic-forms';
import { ExampleScenario } from '../shared/types';

export const articlePaymentScenario: ExampleScenario = {
  id: 'article-payment',
  title: 'Payment',
  description: 'Generated from oneOf + discriminator — conditional group visibility.',
  config: {
    defaultValidationMessages: {
      required: 'This field is required',
    },
    fields: [
      {
        key: 'paymentMethod',
        type: 'radio',
        label: 'Payment Method',
        required: true,
        value: 'credit_card',
        options: [
          { label: 'Credit Card', value: 'credit_card' },
          { label: 'Bank Transfer', value: 'bank_transfer' },
        ],
      },
      {
        key: 'creditCardFields',
        type: 'group',
        fields: [
          {
            key: 'cardNumber',
            type: 'input',
            label: 'Card Number',
            required: true,
            value: '4242 4242 4242 4242',
            placeholder: '0000 0000 0000 0000',
          },
          {
            key: 'cardRow',
            type: 'row',
            fields: [
              {
                key: 'expiry',
                type: 'input',
                label: 'Expiry',
                required: true,
                value: '12/27',
                col: 6,
                placeholder: 'MM/YY',
              },
              {
                key: 'cvv',
                type: 'input',
                label: 'CVV',
                required: true,
                value: '123',
                col: 6,
                placeholder: '***',
                props: { type: 'password' },
              },
            ],
          },
        ],
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'fieldValue',
              fieldPath: 'paymentMethod',
              operator: 'notEquals',
              value: 'credit_card',
            },
          },
        ],
      },
      {
        key: 'bankTransferFields',
        type: 'group',
        fields: [
          {
            key: 'iban',
            type: 'input',
            label: 'IBAN',
            required: true,
            placeholder: 'DE89 3704 0044 0532 0130 00',
          },
          {
            key: 'bic',
            type: 'input',
            label: 'BIC',
            required: true,
            placeholder: 'COBADEFFXXX',
          },
        ],
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'fieldValue',
              fieldPath: 'paymentMethod',
              operator: 'notEquals',
              value: 'bank_transfer',
            },
          },
        ],
      },
      {
        key: 'submit',
        type: 'submit',
        label: 'Pay Now',
        props: { color: 'primary' },
      },
    ],
  } as const satisfies FormConfig,
};
