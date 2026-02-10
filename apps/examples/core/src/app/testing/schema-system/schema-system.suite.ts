import { TestSuite } from '../shared/types';
import { applySchemaScenario } from './scenarios/apply-schema.scenario';
import { applyWhenSchemaScenario } from './scenarios/apply-when-schema.scenario';

/**
 * Schema System Suite
 * Tests the schema system which allows reusable validation/logic configurations
 * that can be applied to fields unconditionally or conditionally.
 */
export const schemaSystemSuite: TestSuite = {
  id: 'schema-system',
  title: 'Schema System Tests',
  description: 'Tests reusable schema configurations for validation and logic',
  path: '/test/schema-system',
  scenarios: [applySchemaScenario, applyWhenSchemaScenario],
};

/**
 * Get a scenario by its testId
 */
export function getSchemaSystemScenario(testId: string) {
  return schemaSystemSuite.scenarios.find((s) => s.testId === testId);
}
