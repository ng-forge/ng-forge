import { FormConfig, EvaluationContext } from '@ng-forge/dynamic-forms';
import { of, delay } from 'rxjs';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'country',
      type: 'select',
      label: 'Country',
      options: [
        { label: 'United States', value: 'US' },
        { label: 'United Kingdom', value: 'UK' },
        { label: 'Germany', value: 'DE' },
      ],
      col: 6,
    },
    {
      key: 'timezone',
      type: 'input',
      label: 'Timezone',
      col: 6,
      logic: [
        {
          type: 'derivation',
          asyncFunctionName: 'lookupTimezone',
          dependsOn: ['country'],
          stopOnUserOverride: true,
          reEngageOnDependencyChange: true,
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

const timezoneMap: Record<string, string> = {
  US: 'America/New_York',
  UK: 'Europe/London',
  DE: 'Europe/Berlin',
};

export const asyncDerivationReEngageScenario: TestScenario = {
  testId: 'async-derivation-re-engage-test',
  title: 'Async Derivation Re-Engage',
  description: 'Tests that async derivation re-engages when dependency changes after user override',
  config,
  customFnConfig: {
    asyncDerivations: {
      lookupTimezone: (context: EvaluationContext) => {
        const country = context.formValue.country as string;
        return of(timezoneMap[country] ?? 'UTC').pipe(delay(200));
      },
    },
  },
};
