import { FormConfig, EvaluationContext } from '@ng-forge/dynamic-forms';
import { of, delay } from 'rxjs';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'product',
      type: 'select',
      label: 'Product',
      options: [
        { label: 'Widget A', value: 'widget-a' },
        { label: 'Widget B', value: 'widget-b' },
        { label: 'Widget C', value: 'widget-c' },
      ],
      col: 4,
    },
    {
      key: 'price',
      type: 'input',
      label: 'Price',
      readonly: true,
      props: { type: 'number' },
      col: 4,
      logic: [
        {
          type: 'derivation',
          source: 'asyncFunction',
          asyncFunctionName: 'fetchPrice',
          dependsOn: ['product'],
        },
      ],
    },
    {
      key: 'quantity',
      type: 'input',
      label: 'Quantity',
      value: 1,
      props: { type: 'number' },
      col: 4,
    },
    {
      key: 'total',
      type: 'input',
      label: 'Total',
      readonly: true,
      props: { type: 'number' },
      col: 12,
      derivation: 'formValue.price * formValue.quantity',
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

const priceMap: Record<string, number> = {
  'widget-a': 9.99,
  'widget-b': 19.99,
  'widget-c': 29.99,
};

export const asyncDerivationScenario: TestScenario = {
  testId: 'async-derivation-test',
  title: 'Async Derivation',
  description: 'Tests async custom function derivation with chain to expression derivation',
  config,
  customFnConfig: {
    asyncDerivations: {
      fetchPrice: (context: EvaluationContext) => {
        const product = context.formValue.product as string;
        return of(priceMap[product] ?? 0).pipe(delay(200));
      },
    },
  },
};
