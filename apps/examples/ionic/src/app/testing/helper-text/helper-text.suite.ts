import { TestSuite } from '../shared/types';
import { helperTextFieldsScenario } from './scenarios/helper-text-fields.scenario';

/**
 * Helper Text Tests Suite
 * Tests helper text display on all Ionic field types.
 */
export const helperTextSuite: TestSuite = {
  id: 'helper-text',
  title: 'Helper Text Tests',
  description: 'Testing helper text display on all field types',
  path: '/test/helper-text',
  scenarios: [helperTextFieldsScenario],
};

/**
 * Get a scenario by its testId
 */
export function getHelperTextScenario(testId: string) {
  return helperTextSuite.scenarios.find((s) => s.testId === testId);
}
