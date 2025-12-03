import { TestSuite } from '../shared/types';
import { arrayCrossValidationScenario } from './scenarios/array-cross-validation.scenario';
import { conditionalValidatorScenario } from './scenarios/conditional-validator.scenario';
import { crossFieldErrorTargetingScenario } from './scenarios/cross-field-error-targeting.scenario';
import { crossFieldValidatorScenario } from './scenarios/cross-field-validator.scenario';
import { customValidatorScenario } from './scenarios/custom-validator.scenario';
import { expressionBasedMinMaxScenario } from './scenarios/expression-based-min-max.scenario';
import { multipleValidatorsScenario } from './scenarios/multiple-validators.scenario';
import { nestedFieldPathsScenario } from './scenarios/nested-field-paths.scenario';
import { rangeValidationScenario } from './scenarios/range-validation.scenario';
import { whenWithAndOrScenario } from './scenarios/when-with-and-or.scenario';

/**
 * Advanced Validation Suite
 * Tests various validation patterns including custom validators,
 * cross-field validation, conditional validators, and more.
 */
export const advancedValidationSuite: TestSuite = {
  id: 'advanced-validation',
  title: 'Advanced Validation Tests',
  description: 'All validation test scenarios',
  path: '/test/advanced-validation',
  scenarios: [
    customValidatorScenario,
    crossFieldValidatorScenario,
    rangeValidationScenario,
    conditionalValidatorScenario,
    multipleValidatorsScenario,
    expressionBasedMinMaxScenario,
    crossFieldErrorTargetingScenario,
    whenWithAndOrScenario,
    nestedFieldPathsScenario,
    arrayCrossValidationScenario,
  ],
};

/**
 * Get a scenario by its testId
 */
export function getAdvancedValidationScenario(testId: string) {
  return advancedValidationSuite.scenarios.find((s) => s.testId === testId);
}
