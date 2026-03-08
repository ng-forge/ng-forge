import { TestSuite } from '../shared/types';
import { comprehensiveValidationScenario } from './scenarios/comprehensive-validation.scenario';
import { passwordConfirmationScenario } from './scenarios/password-confirmation.scenario';

/**
 * Zod Schema Validation Suite
 * Tests form-level validation using Zod schemas with the Standard Schema spec.
 * Demonstrates cross-field validation like password confirmation.
 */
export const zodSchemaValidationSuite: TestSuite = {
  id: 'zod-schema-validation',
  title: 'Zod Schema Validation Tests',
  description: 'Tests form-level validation using Zod with Standard Schema',
  path: '/test/zod-schema-validation',
  scenarios: [comprehensiveValidationScenario, passwordConfirmationScenario],
};

/**
 * Get a scenario by its testId
 */
export function getZodSchemaValidationScenario(testId: string) {
  return zodSchemaValidationSuite.scenarios.find((s) => s.testId === testId);
}
