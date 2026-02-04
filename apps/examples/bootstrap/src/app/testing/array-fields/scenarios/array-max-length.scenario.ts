import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'tags',
      type: 'array',
      // maxLength: 3, // TODO: uncomment when maxLength is implemented
      fields: [[{ key: 'tag', type: 'input', label: 'Tag', value: 'tag1' }], [{ key: 'tag', type: 'input', label: 'Tag', value: 'tag2' }]],
    },
    {
      key: 'addTagButton',
      type: 'addArrayItem',
      arrayKey: 'tags',
      label: 'Add Tag',
      className: 'array-add-button',
      template: [
        {
          key: 'tag',
          type: 'input',
          label: 'Tag',
        },
      ],
    },
  ],
} as const satisfies FormConfig;

export const arrayMaxLengthScenario: TestScenario = {
  testId: 'array-max-length',
  title: 'Maximum Length',
  description: 'Test maximum length constraint on array fields',
  config,
};
