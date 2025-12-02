import { FormConfig } from '@ng-forge/dynamic-forms';
import { ExampleScenario } from '../shared/types';

export const textareaScenario: ExampleScenario = {
  id: 'textarea',
  title: 'Textarea',
  description: 'Multi-line text input',
  config: {
    fields: [
      {
        key: 'bio',
        type: 'textarea',
        label: 'Biography',
        value: '',
        maxLength: 500,
        validationMessages: {
          maxLength: 'Must not exceed {maxLength} characters',
        },
        props: {
          rows: 4,
          placeholder: 'Tell us about yourself',
        },
      },
    ],
  } as const satisfies FormConfig,
};
