import { FormConfig, EvaluationContext } from '@ng-forge/dynamic-forms';
import { Observable, of, delay, throwError } from 'rxjs';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'lookupKey',
      type: 'input',
      label: 'Lookup Key',
      col: 6,
    },
    {
      key: 'result',
      type: 'input',
      label: 'Result',
      readonly: true,
      col: 6,
      logic: [
        {
          type: 'derivation',
          source: 'asyncFunction',
          asyncFunctionName: 'lookupValue',
          dependsOn: ['lookupKey'],
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

export const asyncDerivationErrorScenario: TestScenario = {
  testId: 'async-derivation-error-test',
  title: 'Async Derivation Error Handling',
  description: 'Tests that async derivation errors do not crash the form and the stream continues',
  config,
  customFnConfig: {
    asyncDerivations: {
      lookupValue: (context: EvaluationContext): Observable<unknown> => {
        const key = context.formValue.lookupKey as string;
        if (key === 'INVALID') {
          return throwError(() => new Error('Invalid lookup key'));
        }
        return of(`Result for ${key}`).pipe(delay(200));
      },
    },
  },
};
