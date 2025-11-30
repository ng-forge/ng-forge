import { FormConfig } from '@ng-forge/dynamic-forms';
import { ExampleScenario } from '../shared/types';

export const checkboxScenario: ExampleScenario = {
  id: 'checkbox',
  title: 'Checkbox',
  description: 'Checkbox fields with validation',
  config: {
    fields: [
      {
        key: 'newsletter',
        type: 'checkbox',
        label: 'Subscribe to newsletter',
      },
      {
        key: 'terms',
        type: 'checkbox',
        label: 'I agree to the terms and conditions',
        required: true,
        validationMessages: {
          required: 'This field is required',
        },
      },
      {
        key: 'marketing',
        type: 'checkbox',
        label: 'Receive marketing communications',
      },
    ],
  } as const satisfies FormConfig,
};
