import { FormConfig, EvaluationContext } from '@ng-forge/dynamic-forms';
import { of, delay } from 'rxjs';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'enableLookup',
      type: 'toggle',
      label: 'Enable City Lookup',
      value: false,
      col: 12,
    },
    {
      key: 'zipCode',
      type: 'input',
      label: 'Zip Code',
      col: 6,
    },
    {
      key: 'city',
      type: 'input',
      label: 'City',
      readonly: true,
      col: 6,
      logic: [
        {
          type: 'derivation',
          asyncFunctionName: 'lookupCity',
          dependsOn: ['zipCode'],
          condition: { type: 'fieldValue', fieldPath: 'enableLookup', operator: 'equals', value: true },
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

const cityMap: Record<string, string> = {
  '10001': 'New York',
  '90001': 'Los Angeles',
  '60601': 'Chicago',
  '62701': 'Springfield',
};

export const asyncDerivationConditionScenario: TestScenario = {
  testId: 'async-derivation-condition-test',
  title: 'Async Derivation Condition',
  description: 'Tests that async derivation respects condition that enables/disables the async call',
  config,
  customFnConfig: {
    asyncDerivations: {
      lookupCity: (context: EvaluationContext) => {
        const zip = context.formValue.zipCode as string;
        return of(cityMap[zip] ?? 'Unknown').pipe(delay(200));
      },
    },
  },
};
