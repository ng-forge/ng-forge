import { TestSuite } from '../shared/types';
import { angularPasswordConfirmationScenario } from './scenarios/password-confirmation.scenario';

/**
 * Angular Schema Validation Suite
 * Tests form-level validation using raw Angular schema callbacks.
 * Demonstrates using native Angular validation APIs directly without wrappers.
 */
export const angularSchemaValidationSuite: TestSuite = {
  id: 'angular-schema-validation',
  title: 'Angular Schema Validation Tests',
  description: 'Tests form-level validation using native Angular schema callbacks',
  path: '/test/angular-schema-validation',
  scenarios: [angularPasswordConfirmationScenario],
};

/**
 * Get a scenario by its testId
 */
export function getAngularSchemaValidationScenario(testId: string) {
  return angularSchemaValidationSuite.scenarios.find((s) => s.testId === testId);
}
