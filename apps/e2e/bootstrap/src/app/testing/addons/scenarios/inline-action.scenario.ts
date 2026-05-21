import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'q',
      type: 'input',
      label: 'Search',
      value: '',
      addons: [
        {
          slot: 'suffix',
          kind: 'bs-button',
          icon: 'plus',
          ariaLabel: 'Add',
          severity: 'success',
          action: (ctx) => {
            // Inline handler — append a sentinel marker to the field value so
            // the screenshot before / after the click is visually distinct.
            const current = typeof ctx.value === 'string' ? ctx.value : '';
            ctx.setValue?.(`${current}+`);
          },
        },
      ],
    },
  ],
} as const satisfies FormConfig;

export const inlineActionScenario: TestScenario = {
  testId: 'inline-action',
  title: 'Addons — inline action',
  description: 'bs-button addon with an inline `action` handler (code-only, dropped in JSON-source configs).',
  config,
};
