import { FormConfig } from '@ng-forge/dynamic-forms';
import { ExampleScenario } from '../shared/types';

export const selectScenario: ExampleScenario = {
  id: 'select',
  title: 'Select',
  description: 'Dropdown select with options',
  config: {
    fields: [
      {
        key: 'country',
        type: 'select',
        label: 'Country',
        required: true,
        validationMessages: {
          required: 'This field is required',
        },
        options: [
          { value: 'us', label: 'United States' },
          { value: 'uk', label: 'United Kingdom' },
          { value: 'ca', label: 'Canada' },
          { value: 'au', label: 'Australia' },
        ],
        props: {
          placeholder: 'Select your country',
        },
      },
    ],
  } as const satisfies FormConfig,
};
