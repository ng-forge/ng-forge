import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'skills',
      type: 'select',
      label: 'Skills',
      options: [
        { value: 'typescript', label: 'TypeScript' },
        { value: 'angular', label: 'Angular' },
        { value: 'react', label: 'React' },
        { value: 'vue', label: 'Vue' },
        { value: 'nodejs', label: 'Node.js' },
      ],
      props: {
        multiple: true,
        placeholder: 'Select skills',
      },
    },
  ],
} as const satisfies FormConfig;

export const multiSelectBasicScenario: TestScenario = {
  testId: 'multi-select-basic',
  title: 'Multi-Select - Basic',
  description: 'Basic multi-select functionality',
  config,
};
