import { TestSuite } from '../shared/types';
import { groupValuePropagationScenario } from './scenarios/group-value-propagation.scenario';
import { groupInitialValuesScenario } from './scenarios/group-initial-values.scenario';
import { groupNestedScenario } from './scenarios/group-nested.scenario';

/**
 * Group Fields Suite
 * Tests various group field operations including value propagation,
 * initial values, and nested groups.
 */
export const groupFieldsSuite: TestSuite = {
  id: 'group-fields',
  title: 'Group Fields Tests',
  description: 'Test scenarios for group field operations',
  path: '/test/group-fields',
  scenarios: [
    // Basic Operations
    groupValuePropagationScenario,
    groupInitialValuesScenario,
    groupNestedScenario,
  ],
};

/**
 * Get a scenario by its testId
 */
export function getGroupFieldsScenario(testId: string) {
  return groupFieldsSuite.scenarios.find((s) => s.testId === testId);
}
