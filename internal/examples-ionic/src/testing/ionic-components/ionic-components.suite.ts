import { TestSuite } from '../shared/types';
import { checkboxArrayComponentScenario } from './scenarios/checkbox-array-component.scenario';
import { datetimeComponentScenario } from './scenarios/datetime-component.scenario';
import { rangeComponentScenario } from './scenarios/range-component.scenario';
import { toggleComponentScenario } from './scenarios/toggle-component.scenario';

export const ionicComponentsSuite: TestSuite = {
  id: 'ionic-components',
  title: 'Ionic Components',
  description: 'Testing Ionic-specific components (datetime, range, toggle, multi-checkbox)',
  path: '/test/ionic-components',
  scenarios: [datetimeComponentScenario, rangeComponentScenario, toggleComponentScenario, checkboxArrayComponentScenario],
};

export function getIonicComponentsScenario(testId: string) {
  return ionicComponentsSuite.scenarios.find((s) => s.testId === testId);
}
