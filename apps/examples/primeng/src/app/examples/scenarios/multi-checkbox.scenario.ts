import { FormConfig } from '@ng-forge/dynamic-forms';
import { ExampleScenario } from '../shared/types';

export const multiCheckboxScenario: ExampleScenario = {
  id: 'multi-checkbox',
  title: 'Multi Checkbox',
  description: 'Multiple checkbox selection',
  config: {
    fields: [
      {
        key: 'interests',
        type: 'multi-checkbox',
        label: 'Select Your Interests',
        required: true,
        validationMessages: {
          required: 'This field is required',
        },
        options: [
          { value: 'sports', label: 'Sports' },
          { value: 'music', label: 'Music' },
          { value: 'reading', label: 'Reading' },
          { value: 'travel', label: 'Travel' },
          { value: 'cooking', label: 'Cooking' },
        ],
      },
    ],
  } as const satisfies FormConfig,
};
