import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Verifies the built-in `css` wrapper applies its `cssClasses` to a wrapper
 * element rendered around the field. The innermost <df-css-wrapper> host
 * receives the resolved class string; the field renders inside.
 */
const config = {
  fields: [
    {
      key: 'plain',
      type: 'input',
      label: 'Plain (no wrapper)',
      placeholder: 'No wrapper',
    },
    {
      key: 'wrapped',
      type: 'input',
      label: 'Wrapped (css)',
      placeholder: 'css wrapper with highlight-demo class',
      wrappers: [{ type: 'css', cssClasses: 'highlight-demo' }],
    },
  ],
} as const satisfies FormConfig;

export const wrapperCssScenario: TestScenario = {
  testId: 'wrapper-css',
  title: 'CSS Wrapper',
  description: 'Built-in css wrapper applies cssClasses to the wrapper host',
  config,
};
