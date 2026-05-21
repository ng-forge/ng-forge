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
          kind: 'ion-button',
          icon: 'add-outline',
          ariaLabel: 'Add',
          color: 'success',
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
  description: 'ion-button addon with an inline `action` handler (code-only, dropped in JSON-source configs).',
  config,
};
