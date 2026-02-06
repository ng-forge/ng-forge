import { TestSuite } from '../shared/types';
import { groupValuePropagationScenario } from './scenarios/group-value-propagation.scenario';
import { groupInitialValuesScenario } from './scenarios/group-initial-values.scenario';
import { groupNestedScenario } from './scenarios/group-nested.scenario';
import { groupConditionalVisibilityScenario } from './scenarios/group-conditional-visibility.scenario';
import { groupStatePreservationScenario } from './scenarios/group-state-preservation.scenario';
import { groupNestedConditionalScenario } from './scenarios/group-nested-conditional.scenario';

/**
 * Group Fields Suite
 * Tests various group field operations including value propagation,
 * initial values, nested groups, and conditional visibility.
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

    // Conditional Visibility
    groupConditionalVisibilityScenario,
    groupStatePreservationScenario,
    groupNestedConditionalScenario,
  ],
};

/**
 * Get a scenario by its testId
 */
export function getGroupFieldsScenario(testId: string) {
  return groupFieldsSuite.scenarios.find((s) => s.testId === testId);
}
