import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Tests simplified array API with custom button labels and props.
 */
const config = {
  fields: [
    {
      key: 'tags',
      type: 'array',
      template: { key: 'value', type: 'input', label: 'Tag' },
      value: ['angular'],
      addButton: { label: 'Add Tag', props: { color: 'primary' } },
      removeButton: { label: 'Delete', props: { color: 'warn' } },
    },
  ],
} as const satisfies FormConfig;

export const simplifiedArrayButtonCustomizationScenario: TestScenario = {
  testId: 'simplified-array-button-customization',
  title: 'Simplified Array - Button Customization',
  description: 'Simplified array API with custom button labels and props',
  config,
};
