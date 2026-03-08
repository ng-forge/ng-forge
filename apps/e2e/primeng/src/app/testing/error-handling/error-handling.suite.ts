import { TestSuite } from '../shared/types';
import { basicTestScenario } from './scenarios/basic-test.scenario';
import { invalidConfigScenario } from './scenarios/invalid-config.scenario';

export const errorHandlingSuite: TestSuite = {
  id: 'error-handling',
  title: 'Error Handling',
  description: 'Testing error handling, edge cases, and invalid configurations',
  path: '/test/error-handling',
  scenarios: [invalidConfigScenario, basicTestScenario],
};

export function getErrorHandlingScenario(testId: string) {
  return errorHandlingSuite.scenarios.find((s) => s.testId === testId);
}
