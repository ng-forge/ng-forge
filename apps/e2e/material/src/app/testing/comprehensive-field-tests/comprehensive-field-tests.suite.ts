import { TestSuite } from '../shared/types';
import { comprehensiveFieldsScenario } from './scenarios/comprehensive-fields.scenario';
import { gridLayoutScenario } from './scenarios/grid-layout.scenario';
import { stateManagementScenario } from './scenarios/state-management.scenario';
import { validationScenario } from './scenarios/validation.scenario';

/**
 * Comprehensive Field Tests Suite
 * Tests all available Material Design field types, grid layouts,
 * state management, and validation.
 */
export const comprehensiveFieldTestsSuite: TestSuite = {
  id: 'comprehensive-field-tests',
  title: 'Comprehensive Field Tests',
  description: 'Testing all Material Design field types, layouts, and validation',
  path: '/test/comprehensive-field-tests',
  scenarios: [comprehensiveFieldsScenario, gridLayoutScenario, stateManagementScenario, validationScenario],
};

/**
 * Get a scenario by its testId
 */
export function getComprehensiveFieldTestsScenario(testId: string) {
  return comprehensiveFieldTestsSuite.scenarios.find((s) => s.testId === testId);
}
