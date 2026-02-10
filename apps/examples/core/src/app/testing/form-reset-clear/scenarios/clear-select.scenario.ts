import { FormClearEvent, FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'language',
      type: 'select',
      label: 'Preferred Language',
      options: [
        { value: 'en', label: 'English' },
        { value: 'es', label: 'Spanish' },
        { value: 'fr', label: 'French' },
      ],
    },
    {
      key: 'clear-button',
      type: 'button',
      label: 'Clear',
      event: FormClearEvent,
      props: {
        type: 'button',
      },
    },
  ],
} as const satisfies FormConfig;

export const clearSelectScenario: TestScenario = {
  testId: 'clear-select',
  title: 'Clear Select Fields',
  description: 'Tests clearing select fields',
  config,
};
