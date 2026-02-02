import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'beforeField',
      type: 'input',
      label: 'Before Array',
    },
    {
      key: 'contacts',
      type: 'array',
      fields: [
        {
          key: 'name',
          type: 'input',
          label: 'Name',
        },
        {
          key: 'email',
          type: 'input',
          label: 'Email',
        },
      ],
    },
    {
      key: 'addContact',
      type: 'addArrayItem',
      arrayKey: 'contacts',
      label: 'Add Contact',
      props: { variant: 'primary' },
      template: [
        {
          key: 'name',
          type: 'input',
          label: 'Name',
        },
        {
          key: 'email',
          type: 'input',
          label: 'Email',
        },
      ],
    },
    {
      key: 'afterField',
      type: 'input',
      label: 'After Array',
    },
  ],
} as const satisfies FormConfig;

export const arrayKeyboardNavigationScenario: TestScenario = {
  testId: 'array-keyboard-navigation',
  title: 'Keyboard Navigation',
  description: 'Test tab order and keyboard navigation through array fields (WCAG AA compliance)',
  config,
  initialValue: {
    beforeField: '',
    contacts: [
      { name: '', email: '' },
      { name: '', email: '' },
    ],
    afterField: '',
  },
};
