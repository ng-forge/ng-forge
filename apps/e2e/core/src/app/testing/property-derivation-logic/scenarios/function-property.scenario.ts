import { EvaluationContext, FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'country',
      type: 'select',
      label: 'Country',
      value: '',
      options: [
        { label: 'USA', value: 'US' },
        { label: 'Germany', value: 'DE' },
      ],
      col: 6,
    },
    {
      key: 'city',
      type: 'select',
      label: 'City',
      value: '',
      options: [],
      col: 6,
      logic: [
        {
          type: 'propertyDerivation',
          targetProperty: 'options',
          functionName: 'getCitiesForCountry',
          dependsOn: ['country'],
        },
      ],
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
      props: { type: 'submit', color: 'primary' },
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const functionPropertyScenario: TestScenario = {
  testId: 'function-property-test',
  title: 'Custom Function Property Derivation',
  description: 'Tests deriving select options using a custom function',
  config,
  customFnConfig: {
    propertyDerivations: {
      getCitiesForCountry: (ctx: EvaluationContext) => {
        const cities: Record<string, { label: string; value: string }[]> = {
          US: [
            { label: 'New York', value: 'nyc' },
            { label: 'Los Angeles', value: 'la' },
            { label: 'Chicago', value: 'chi' },
          ],
          DE: [
            { label: 'Berlin', value: 'berlin' },
            { label: 'Munich', value: 'munich' },
          ],
        };
        return cities[ctx.formValue.country as string] ?? [];
      },
    },
  },
};
