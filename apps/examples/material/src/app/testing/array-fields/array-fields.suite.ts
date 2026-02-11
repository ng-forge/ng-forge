import { TestSuite } from '../shared/types';
import { arrayAddScenario } from './scenarios/array-add.scenario';
import { arrayBoundaryIndicesScenario } from './scenarios/array-boundary-indices.scenario';
import { arrayButtonDisabledLogicScenario } from './scenarios/array-button-disabled-logic.scenario';
import { arrayButtonHiddenLogicScenario } from './scenarios/array-button-hidden-logic.scenario';
import { arrayDirtyTouchedTrackingScenario } from './scenarios/array-dirty-touched-tracking.scenario';
import { arrayDomIdUniquenessScenario } from './scenarios/array-dom-id-uniqueness.scenario';
import { arrayEmptyStateScenario } from './scenarios/array-empty-state.scenario';
import { arrayFocusAfterAddScenario } from './scenarios/array-focus-after-add.scenario';
import { arrayFocusAfterRemoveScenario } from './scenarios/array-focus-after-remove.scenario';
import { arrayInitialValuesScenario } from './scenarios/array-initial-values.scenario';
import { arrayInsertAtIndexScenario } from './scenarios/array-insert-at-index.scenario';
import { arrayItemValidationScenario } from './scenarios/array-item-validation.scenario';
import { arrayKeyboardNavigationScenario } from './scenarios/array-keyboard-navigation.scenario';
import { arrayMaxLengthScenario } from './scenarios/array-max-length.scenario';
import { arrayMinLengthScenario } from './scenarios/array-min-length.scenario';
import { arrayMultipleArraysScenario } from './scenarios/array-multiple-arrays.scenario';
import { arrayMultipleOpsScenario } from './scenarios/array-multiple-ops.scenario';
import { arrayNestedScenario } from './scenarios/array-nested.scenario';
import { arrayPrependScenario } from './scenarios/array-prepend.scenario';
import { arrayRapidOperationsScenario } from './scenarios/array-rapid-operations.scenario';
import { arrayRemoveAtIndexScenario } from './scenarios/array-remove-at-index.scenario';
import { arrayRemoveScenario } from './scenarios/array-remove.scenario';
import { arrayScreenReaderLabelsScenario } from './scenarios/array-screen-reader-labels.scenario';
import { arrayShiftScenario } from './scenarios/array-shift.scenario';
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
    // Basic operations
    arrayAddScenario,
    arrayRemoveScenario,
    arrayValuesScenario,
    arrayInitialValuesScenario,

    // Semantic array events (PR #218)
    arrayPrependScenario,
    arrayShiftScenario,
    arrayInsertAtIndexScenario,
    arrayRemoveAtIndexScenario,

    // DOM ID uniqueness (PR #219)
    arrayDomIdUniquenessScenario,

    // Validation
    arrayItemValidationScenario,
    arrayMaxLengthScenario,
    arrayMinLengthScenario,

    // Complex structures
    arrayNestedScenario,
    arrayMultipleOpsScenario,
    arrayMultipleArraysScenario,

    // Accessibility
    arrayKeyboardNavigationScenario,
    arrayScreenReaderLabelsScenario,

    // Focus management
    arrayFocusAfterAddScenario,
    arrayFocusAfterRemoveScenario,

    // Form state
    arrayDirtyTouchedTrackingScenario,
    arrayRapidOperationsScenario,

    // Edge cases
    arrayEmptyStateScenario,
    arrayBoundaryIndicesScenario,

    // Button logic (hidden/disabled)
    arrayButtonHiddenLogicScenario,
    arrayButtonDisabledLogicScenario,
  ],
};

/**
 * Get a scenario by its testId
 */
export function getArrayFieldsScenario(testId: string) {
  return arrayFieldsSuite.scenarios.find((s) => s.testId === testId);
}
