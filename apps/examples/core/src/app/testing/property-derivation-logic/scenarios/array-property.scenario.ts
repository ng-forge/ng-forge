import { EvaluationContext, FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'contacts',
      type: 'array',
      fields: [
        [
          {
            key: 'contactRow',
            type: 'row',
            fields: [
              {
                key: 'contactType',
                type: 'select',
                label: 'Contact Type',
                value: 'email',
                options: [
                  { label: 'Email', value: 'email' },
                  { label: 'Phone', value: 'phone' },
                ],
                col: 6,
              },
              {
                key: 'contactValue',
                type: 'input',
                label: 'Contact',
                value: '',
                col: 6,
                logic: [
                  {
                    type: 'propertyDerivation',
                    targetProperty: 'label',
                    functionName: 'deriveContactLabel',
                    dependsOn: ['contactType'],
                  },
                ],
              },
            ],
          },
        ],
      ],
    },
    {
      key: 'addContact',
      type: 'addArrayItem',
      arrayKey: 'contacts',
      label: 'Add Contact',
      props: { color: 'primary' },
      template: [
        {
          key: 'contactRow',
          type: 'row',
          fields: [
            {
              key: 'contactType',
              type: 'select',
              label: 'Contact Type',
              value: 'email',
              options: [
                { label: 'Email', value: 'email' },
                { label: 'Phone', value: 'phone' },
              ],
              col: 6,
            },
            {
              key: 'contactValue',
              type: 'input',
              label: 'Contact',
              value: '',
              col: 6,
              logic: [
                {
                  type: 'propertyDerivation',
                  targetProperty: 'label',
                  functionName: 'deriveContactLabel',
                  dependsOn: ['contactType'],
                },
              ],
            },
          ],
        },
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

export const arrayPropertyScenario: TestScenario = {
  testId: 'array-property-test',
  title: 'Array Item Scoped Property Derivation',
  description: 'Tests property derivation scoped to individual array items using custom function',
  config,
  customFnConfig: {
    propertyDerivations: {
      deriveContactLabel: (ctx: EvaluationContext) => {
        const contactType = ctx.formValue.contactType as string;
        const labels: Record<string, string> = {
          email: 'Email Address',
          phone: 'Phone Number',
        };
        return labels[contactType] ?? 'Contact';
      },
    },
  },
};
