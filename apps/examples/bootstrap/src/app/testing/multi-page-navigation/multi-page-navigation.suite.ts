import { TestSuite } from '../shared/types';
import { backwardNavigationScenario } from './scenarios/backward-navigation.scenario';
import { directNavigationScenario } from './scenarios/direct-navigation.scenario';
import { multiPageRegistrationScenario } from './scenarios/multi-page-registration.scenario';
import { pageTransitionsScenario } from './scenarios/page-transitions.scenario';
import { validationNavigationScenario } from './scenarios/validation-navigation.scenario';

export const multiPageNavigationSuite: TestSuite = {
  id: 'multi-page-navigation',
  title: 'Multi-Page Navigation',
  description: 'Testing multi-page form navigation, backward navigation, and page transitions',
  path: '/test/multi-page-navigation',
  scenarios: [
    multiPageRegistrationScenario,
    validationNavigationScenario,
    backwardNavigationScenario,
    directNavigationScenario,
    pageTransitionsScenario,
  ],
};

export function getMultiPageNavigationScenario(testId: string) {
  return multiPageNavigationSuite.scenarios.find((s) => s.testId === testId);
}
