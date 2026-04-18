import { TestSuite } from '../shared/types';
import { wrapperCssScenario } from './scenarios/wrapper-css.scenario';
import { wrapperSectionScenario } from './scenarios/wrapper-section.scenario';
import { wrapperDefaultsScenario } from './scenarios/wrapper-defaults.scenario';

/**
 * Wrapper Fields Suite
 *
 * End-to-end coverage for the field wrappers feature:
 *  - Built-in `css` wrapper (class application)
 *  - Custom demo `section` wrapper (config as inputs, titled card render)
 *  - Form-level `defaultWrappers`, field-level stacking, and `wrappers: null` opt-out
 *
 * The `section` wrapper is registered via `DEMO_WRAPPERS` from
 * `@ng-forge/examples-shared-ui` and must be provided in each e2e app's
 * `app.config.ts`.
 */
export const wrapperFieldsSuite: TestSuite = {
  id: 'wrapper-fields',
  title: 'Wrapper Fields Tests',
  description: 'Test scenarios for field wrappers (css, custom section, defaults, opt-out)',
  path: '/test/wrapper-fields',
  scenarios: [wrapperCssScenario, wrapperSectionScenario, wrapperDefaultsScenario],
};

export function getWrapperFieldsScenario(testId: string) {
  return wrapperFieldsSuite.scenarios.find((s) => s.testId === testId);
}
