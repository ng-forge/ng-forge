import { TestSuite } from '../shared/types';
import { asyncResourceValidatorScenario } from './scenarios/async-resource-validator.scenario';
import { httpErrorHandlingScenario } from './scenarios/http-error-handling.scenario';
import { httpGetValidatorScenario } from './scenarios/http-get-validator.scenario';
import { httpPostValidatorScenario } from './scenarios/http-post-validator.scenario';
import { multipleValidatorsScenario } from './scenarios/multiple-validators.scenario';

/**
 * Async Validation Suite
 * Tests various async validation scenarios including HTTP validators,
 * resource-based validators, error handling, and multiple validator combinations.
 */
export const asyncValidationSuite: TestSuite = {
  id: 'async-validation',
  title: 'Async Validation Tests',
  description: 'Test scenarios for asynchronous validation including HTTP validators and resource-based validators',
  path: '/test/async-validation',
  scenarios: [
    httpGetValidatorScenario,
    httpPostValidatorScenario,
    asyncResourceValidatorScenario,
    httpErrorHandlingScenario,
    multipleValidatorsScenario,
  ],
};

/**
 * Get a scenario by its testId
 */
export function getAsyncValidationScenario(testId: string) {
  return asyncValidationSuite.scenarios.find((s) => s.testId === testId);
}
