import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Verifies:
 *  - `FormConfig.defaultWrappers` applies to every field that does not opt out
 *  - `wrappers: null` on a field clears the entire effective chain
 *  - field-level `wrappers` layer on top of the default (outermost → innermost)
 */
const config = {
  defaultWrappers: [{ type: 'css', cssClasses: 'default-wrapper-demo' }],
  fields: [
    {
      key: 'inheritsDefault',
      type: 'input',
      label: 'Inherits default',
      props: { placeholder: 'has default-wrapper-demo' },
    },
    {
      key: 'stacked',
      type: 'input',
      label: 'Default + field-level',
      props: { placeholder: 'default applies, then section wraps inside' },
      wrappers: [{ type: 'section', title: 'On top of default' }],
    },
    {
      key: 'optOut',
      type: 'input',
      label: 'Opted out (wrappers: null)',
      props: { placeholder: 'no wrappers applied' },
      wrappers: null,
    },
  ],
} as const satisfies FormConfig;

export const wrapperDefaultsScenario: TestScenario = {
  testId: 'wrapper-defaults',
  title: 'Default Wrappers + Opt-Out',
  description: 'FormConfig.defaultWrappers applies to all fields; wrappers: null opts a field out entirely',
  config,
};
