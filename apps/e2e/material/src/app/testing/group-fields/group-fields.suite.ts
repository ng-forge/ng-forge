import { TestSuite } from '../shared/types';
import { groupValuePropagationScenario } from './scenarios/group-value-propagation.scenario';
import { groupInitialValuesScenario } from './scenarios/group-initial-values.scenario';
import { groupNestedScenario } from './scenarios/group-nested.scenario';
import { groupContainerValidatorScenario } from './scenarios/group-container-validator.scenario';
import { delegatedFieldErrorsScenario } from './scenarios/delegated-field-errors.scenario';
import { groupCrossFieldValidationScenario } from './scenarios/group-cross-field-validation.scenario';

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
    // Cross-field validation
    groupCrossFieldValidationScenario,
    // Container validators (#568)
    groupContainerValidatorScenario,
    delegatedFieldErrorsScenario,
  ],
};

/**
 * Get a scenario by its testId
 */
export function getGroupFieldsScenario(testId: string) {
  return groupFieldsSuite.scenarios.find((s) => s.testId === testId);
}
