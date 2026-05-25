import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'street',
      type: 'input',
      label: 'Street',
      value: '',
    },
    {
      key: 'streetDropdown',
      type: 'select',
      value: '',
      options: [],
      label: 'Street Suggestions',
      logic: [
        {
          type: 'derivation',
          targetProperty: 'options',
          source: 'http',
          http: {
            url: '/api/address/streets/search',
            queryParams: { q: 'formValue.street' },
          },
          // Exercises arrow function + object literal in the response
          // expression — the canonical "map server rows into FieldOption shape"
          // pattern from the migration guide.
          responseExpression: 'response.map(d => ({ value: d.id, label: d.streetNameShort }))',
          dependsOn: ['street'],
          trigger: 'debounced',
          debounceMs: 100,
        },
      ],
    },
  ],
} as const satisfies FormConfig;

export const httpDrivenSelectOptionsScenario: TestScenario = {
  testId: 'http-driven-select-options',
  title: 'HTTP-driven select.options',
  description:
    "A select field's options are populated from an HTTP endpoint as the user types into a dependency field. Regression coverage for #422.",
  config,
  initialValue: {},
};
