import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'countries',
      type: 'select',
      label: 'Countries',
      options: [
        { value: 'us', label: 'United States' },
        { value: 'uk', label: 'United Kingdom' },
        { value: 'de', label: 'Germany' },
        { value: 'fr', label: 'France' },
        { value: 'es', label: 'Spain' },
        { value: 'it', label: 'Italy' },
        { value: 'jp', label: 'Japan' },
        { value: 'cn', label: 'China' },
        { value: 'br', label: 'Brazil' },
        { value: 'au', label: 'Australia' },
      ],
      props: {
        multiple: true,
        filter: true,
        placeholder: 'Search and select countries',
      },
    },
  ],
} as const satisfies FormConfig;

export const multiSelectFilterScenario: TestScenario = {
  testId: 'multi-select-filter',
  title: 'Multi-Select - With Filter',
  description: 'Tests multi-select with filtering capability',
  config,
};
