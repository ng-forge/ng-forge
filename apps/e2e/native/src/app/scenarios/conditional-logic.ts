import type { FormConfig, LogicConfig } from '@ng-forge/dynamic-forms';
import type { TestSuite } from '../types';

const hiddenUnlessSubscribed: LogicConfig[] = [
  {
    type: 'hidden',
    condition: { type: 'fieldValue', fieldPath: 'subscribe', operator: 'equals', value: false },
  },
];

export const conditionalLogicSuite: TestSuite = {
  id: 'conditional-logic',
  title: 'Conditional Logic',
  scenarios: [
    {
      testId: 'toggle-visibility',
      title: 'Toggle Visibility',
      description: 'Fields appear and disappear with the toggle, at the top level and inside a group',
      config: {
        fields: [
          { key: 'subscribe', type: 'toggle', label: 'Subscribe to newsletter', value: false },
          { key: 'email', type: 'input', label: 'Email', props: { type: 'email' }, logic: hiddenUnlessSubscribed },
          {
            key: 'preferences',
            type: 'group',
            fields: [{ key: 'frequency', type: 'input', label: 'Frequency', logic: hiddenUnlessSubscribed }],
          },
        ],
      } as const satisfies FormConfig,
      initialValue: {},
    },
    {
      testId: 'text-and-textarea',
      title: 'Text and Textarea',
      description: 'Display text renders natively and a textarea accepts multiple lines',
      config: {
        fields: [
          { key: 'heading', type: 'text', label: 'Tell us about yourself', props: { elementType: 'h2' } },
          { key: 'bio', type: 'textarea', label: 'Bio', props: { rows: 4 } },
        ],
      } as const satisfies FormConfig,
      initialValue: {},
    },
  ],
};
