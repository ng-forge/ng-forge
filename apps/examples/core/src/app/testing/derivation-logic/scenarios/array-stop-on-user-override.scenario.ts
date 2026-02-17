import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'discountRate',
      type: 'input',
      label: 'Discount Rate (%)',
      props: { type: 'number' },
      value: 0,
      col: 6,
    },
    {
      key: 'lineItems',
      type: 'array',
      fields: [
        [
          {
            key: 'itemRow',
            type: 'row',
            fields: [
              { key: 'description', type: 'input', label: 'Description', col: 3, value: 'Product A' },
              { key: 'quantity', type: 'input', label: 'Quantity', props: { type: 'number' }, col: 2, value: 2 },
              { key: 'unitPrice', type: 'input', label: 'Unit Price', props: { type: 'number' }, col: 2, value: 50 },
              {
                key: 'lineTotal',
                type: 'input',
                label: 'Line Total',
                col: 3,
                props: { type: 'number' },
                value: 100,
                logic: [
                  {
                    type: 'derivation',
                    expression: 'formValue.quantity * formValue.unitPrice * (1 - rootFormValue.discountRate / 100)',
                    stopOnUserOverride: true,
                    reEngageOnDependencyChange: true,
                    dependsOn: ['quantity', 'unitPrice', 'discountRate'],
                  },
                ],
              },
              {
                key: 'permanentTotal',
                type: 'input',
                label: 'Permanent Total',
                col: 2,
                props: { type: 'number' },
                value: 100,
                logic: [
                  {
                    type: 'derivation',
                    expression: 'formValue.quantity * formValue.unitPrice',
                    stopOnUserOverride: true,
                    dependsOn: ['quantity', 'unitPrice'],
                  },
                ],
              },
            ],
          },
        ],
        [
          {
            key: 'itemRow',
            type: 'row',
            fields: [
              { key: 'description', type: 'input', label: 'Description', col: 3, value: 'Product B' },
              { key: 'quantity', type: 'input', label: 'Quantity', props: { type: 'number' }, col: 2, value: 3 },
              { key: 'unitPrice', type: 'input', label: 'Unit Price', props: { type: 'number' }, col: 2, value: 30 },
              {
                key: 'lineTotal',
                type: 'input',
                label: 'Line Total',
                col: 3,
                props: { type: 'number' },
                value: 90,
                logic: [
                  {
                    type: 'derivation',
                    expression: 'formValue.quantity * formValue.unitPrice * (1 - rootFormValue.discountRate / 100)',
                    stopOnUserOverride: true,
                    reEngageOnDependencyChange: true,
                    dependsOn: ['quantity', 'unitPrice', 'discountRate'],
                  },
                ],
              },
              {
                key: 'permanentTotal',
                type: 'input',
                label: 'Permanent Total',
                col: 2,
                props: { type: 'number' },
                value: 90,
                logic: [
                  {
                    type: 'derivation',
                    expression: 'formValue.quantity * formValue.unitPrice',
                    stopOnUserOverride: true,
                    dependsOn: ['quantity', 'unitPrice'],
                  },
                ],
              },
            ],
          },
        ],
      ],
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
      props: { type: 'submit', color: 'primary' },
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const arrayStopOnUserOverrideScenario: TestScenario = {
  testId: 'array-stop-on-user-override-test',
  title: 'Array Field Stop On User Override',
  description: 'Tests that stopOnUserOverride and reEngageOnDependencyChange work independently per array item',
  config,
};
