import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'mainRow',
      type: 'row',
      fields: [
        {
          key: 'personalInfo',
          type: 'group',
          col: 6,
          fields: [
            {
              key: 'firstName',
              type: 'input',
              label: 'First Name',
              props: {
                placeholder: 'Enter first name',
              },
            },
            {
              key: 'lastName',
              type: 'input',
              label: 'Last Name',
              props: {
                placeholder: 'Enter last name',
              },
            },
          ],
        },
        {
          key: 'contactInfo',
          type: 'group',
          col: 6,
          fields: [
            {
              key: 'email',
              type: 'input',
              label: 'Email',
              props: {
                type: 'email',
                placeholder: 'Enter email',
              },
            },
            {
              key: 'phone',
              type: 'input',
              label: 'Phone',
              props: {
                placeholder: 'Enter phone',
              },
            },
          ],
        },
      ],
    },
  ],
} as const satisfies FormConfig;

export const rowContainingGroupScenario: TestScenario = {
  testId: 'row-containing-group',
  title: 'Row Containing Group',
  description: 'Verify that row containers can wrap group containers in a horizontal layout',
  config,
};
