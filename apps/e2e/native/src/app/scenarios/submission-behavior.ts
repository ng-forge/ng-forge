import type { FormConfig } from '@ng-forge/dynamic-forms';
import type { TestSuite } from '../types';

export const submissionBehaviorSuite: TestSuite = {
  id: 'submission-behavior',
  title: 'Submission Behavior',
  scenarios: [
    {
      testId: 'basic-submission',
      title: 'Basic Submission',
      description: 'Pressing submit on a valid form emits the form value',
      config: {
        defaultValidationMessages: { required: 'This field is required' },
        fields: [
          { key: 'email', type: 'input', label: 'Email', placeholder: 'Enter email', props: { type: 'email' }, required: true },
          { key: 'name', type: 'input', label: 'Name', placeholder: 'Enter name', required: true },
          { key: 'submitForm', type: 'submit', label: 'Submit' },
        ],
      } as const satisfies FormConfig,
      initialValue: {},
    },
    {
      testId: 'button-disabled-invalid',
      title: 'Submit Button Disabled When Invalid',
      description: 'The submit button is disabled until every required field is filled',
      config: {
        defaultValidationMessages: { required: 'This field is required' },
        fields: [
          { key: 'email', type: 'input', label: 'Email (required)', props: { type: 'email' }, required: true },
          { key: 'name', type: 'input', label: 'Name (required)', required: true },
          { key: 'submitInvalid', type: 'submit', label: 'Submit (disabled when invalid)' },
        ],
      } as const satisfies FormConfig,
      initialValue: {},
    },
    {
      testId: 'hidden-field',
      title: 'Hidden Field',
      description: 'Hidden fields carry values without rendering anything',
      config: {
        fields: [
          { key: 'id', type: 'hidden', value: 'uuid-550e8400' },
          { key: 'version', type: 'hidden', value: 42 },
          {
            key: 'metadata',
            type: 'group',
            fields: [
              { key: 'source', type: 'hidden', value: 'mobile-form' },
              { key: 'description', type: 'input', label: 'Description', value: '' },
            ],
          },
          { key: 'name', type: 'input', label: 'Name', required: true },
          { key: 'submitHidden', type: 'submit', label: 'Submit' },
        ],
      } as const satisfies FormConfig,
      initialValue: {},
    },
  ],
};
