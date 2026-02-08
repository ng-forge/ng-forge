import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'nameRow',
      type: 'row',
      fields: [
        {
          key: 'firstName',
          type: 'input',
          label: 'First Name',
          col: 6,
          props: {
            placeholder: 'Enter first name',
          },
        },
        {
          key: 'lastName',
          type: 'input',
          label: 'Last Name',
          col: 6,
          props: {
            placeholder: 'Enter last name',
          },
        },
      ],
    },
    {
      key: 'contactRow',
      type: 'row',
      fields: [
        {
          key: 'email',
          type: 'input',
          label: 'Email',
          col: 4,
          props: {
            type: 'email',
            placeholder: 'Enter email',
          },
        },
        {
          key: 'phone',
          type: 'input',
          label: 'Phone',
          col: 4,
          props: {
            placeholder: 'Enter phone',
          },
        },
        {
          key: 'country',
          type: 'select',
          label: 'Country',
          col: 4,
          options: [
            { value: 'us', label: 'United States' },
            { value: 'uk', label: 'United Kingdom' },
            { value: 'ca', label: 'Canada' },
          ],
        },
      ],
    },
  ],
} as const satisfies FormConfig;

export const rowBasicLayoutScenario: TestScenario = {
  testId: 'row-basic-layout',
  title: 'Row Basic Layout',
  description: 'Verify that row containers render fields in a horizontal layout',
  config,
};
