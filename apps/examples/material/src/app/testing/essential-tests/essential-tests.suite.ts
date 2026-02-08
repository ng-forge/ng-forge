import { TestSuite } from '../shared/types';
import { basicFormScenario } from './scenarios/basic-form.scenario';
import { ageBasedLogicScenario } from './scenarios/age-based-logic.scenario';
import { multiPageNavigationScenario } from './scenarios/multi-page-navigation.scenario';
import { reactiveConfigChangesScenario } from './scenarios/reactive-config-changes.scenario';

/**
 * Essential Tests Suite
 * Contains quick validation tests for core functionality
 */
export const essentialTestsSuite: TestSuite = {
  id: 'essential-tests',
  title: 'Essential Tests',
  description: 'Quick validation tests for core form functionality',
  path: '/test/essential-tests',
  scenarios: [basicFormScenario, ageBasedLogicScenario, multiPageNavigationScenario, reactiveConfigChangesScenario],
};

/**
 * Get a scenario by its testId
 */
export function getEssentialTestScenario(testId: string) {
  return essentialTestsSuite.scenarios.find((s) => s.testId === testId);
}
