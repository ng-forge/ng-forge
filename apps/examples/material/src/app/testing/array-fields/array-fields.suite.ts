import { TestSuite } from '../shared/types';
import { arrayAddScenario } from './scenarios/array-add.scenario';
import { arrayInitialValuesScenario } from './scenarios/array-initial-values.scenario';
import { arrayItemValidationScenario } from './scenarios/array-item-validation.scenario';
import { arrayMaxLengthScenario } from './scenarios/array-max-length.scenario';
import { arrayMinLengthScenario } from './scenarios/array-min-length.scenario';
import { arrayMultipleOpsScenario } from './scenarios/array-multiple-ops.scenario';
import { arrayNestedScenario } from './scenarios/array-nested.scenario';
import { arrayRemoveScenario } from './scenarios/array-remove.scenario';
import { arrayValuesScenario } from './scenarios/array-values.scenario';

/**
 * Array Fields Suite
 * Tests various array field operations including add, remove,
 * validation, initial values, nested fields, and value maintenance.
 */
export const arrayFieldsSuite: TestSuite = {
  id: 'array-fields',
  title: 'Array Fields Tests',
  description: 'Test scenarios for array field operations',
  path: '/test/array-fields',
  scenarios: [
    arrayAddScenario,
    arrayInitialValuesScenario,
    arrayItemValidationScenario,
    arrayMaxLengthScenario,
    arrayMinLengthScenario,
    arrayMultipleOpsScenario,
    arrayNestedScenario,
    arrayRemoveScenario,
    arrayValuesScenario,
  ],
};

/**
 * Get a scenario by its testId
 */
export function getArrayFieldsScenario(testId: string) {
  return arrayFieldsSuite.scenarios.find((s) => s.testId === testId);
}
