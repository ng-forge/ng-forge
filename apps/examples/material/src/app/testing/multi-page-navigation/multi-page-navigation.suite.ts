import { TestSuite } from '../shared/types';
import { backwardNavigationScenario } from './scenarios/backward-navigation.scenario';
import { directNavigationScenario } from './scenarios/direct-navigation.scenario';
import { multiPageRegistrationScenario } from './scenarios/multi-page-registration.scenario';
import { pageTransitionsScenario } from './scenarios/page-transitions.scenario';
import { validationNavigationScenario } from './scenarios/validation-navigation.scenario';
import { pageConditionalVisibilityScenario } from './scenarios/page-conditional-visibility.scenario';
import { pageDynamicNavigationScenario } from './scenarios/page-dynamic-navigation.scenario';

export const multiPageNavigationSuite: TestSuite = {
  id: 'multi-page-navigation',
  title: 'Multi-Page Navigation',
  description: 'Testing multi-page form navigation, backward navigation, page transitions, and conditional visibility',
  path: '/test/multi-page-navigation',
  scenarios: [
    // Basic Navigation
    multiPageRegistrationScenario,
    validationNavigationScenario,
    backwardNavigationScenario,
    directNavigationScenario,
    pageTransitionsScenario,

    // Conditional Visibility
    pageConditionalVisibilityScenario,
    pageDynamicNavigationScenario,
  ],
};

export function getMultiPageNavigationScenario(testId: string) {
  return multiPageNavigationSuite.scenarios.find((s) => s.testId === testId);
}
