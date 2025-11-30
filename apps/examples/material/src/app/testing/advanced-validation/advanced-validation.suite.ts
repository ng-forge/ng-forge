import { TestSuite } from '../shared/types';
import { customValidatorScenario } from './scenarios/custom-validator.scenario';
import { crossFieldValidatorScenario } from './scenarios/cross-field-validator.scenario';
import { rangeValidationScenario } from './scenarios/range-validation.scenario';
import { conditionalValidatorScenario } from './scenarios/conditional-validator.scenario';
import { multipleValidatorsScenario } from './scenarios/multiple-validators.scenario';

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
  ],
};

/**
 * Get a scenario by its testId
 */
export function getAdvancedValidationScenario(testId: string) {
  return advancedValidationSuite.scenarios.find((s) => s.testId === testId);
}
