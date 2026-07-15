import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Regression scenario for issue #518: a field with wrappers must keep its
 * `col` grid class on the row's direct flex child (the outermost wrapper
 * host), so wrapped and unwrapped col:6 fields still share a single row.
 */
const config = {
  fields: [
    {
      key: 'wrappedRow',
      type: 'row',
      fields: [
        {
          key: 'plainField',
          type: 'input',
          label: 'Plain Field',
          col: 6,
          placeholder: 'No wrapper',
        },
        {
          key: 'wrappedField',
          type: 'input',
          label: 'Wrapped Field',
          col: 6,
          placeholder: 'Has css wrapper',
          wrappers: [{ type: 'css', cssClasses: 'wrapped-col-demo' }],
        },
      ],
    },
  ],
} as const satisfies FormConfig;

export const rowWrappedColScenario: TestScenario = {
  testId: 'row-wrapped-col',
  title: 'Row Wrapped Column',
  description: 'Verify that a wrapped field keeps its grid column inside a row',
  config,
};
