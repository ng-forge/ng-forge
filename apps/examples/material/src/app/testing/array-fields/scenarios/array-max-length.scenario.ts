import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'tags',
      type: 'array',
      // maxLength: 3, // TODO: uncomment when maxLength is implemented
      fields: [
        {
          key: 'tag',
          type: 'input',
          label: 'Tag',
        },
      ],
    },
    {
      key: 'addTagButton',
      type: 'addArrayItem',
      arrayKey: 'tags',
      label: 'Add Tag',
      className: 'array-add-button',
    },
  ],
} as const satisfies FormConfig;

export const arrayMaxLengthScenario: TestScenario = {
  testId: 'array-max-length',
  title: 'Maximum Length',
  description: 'Test maximum length constraint on array fields',
  config,
  initialValue: {
    tags: [{ tag: 'tag1' }, { tag: 'tag2' }],
  },
};
