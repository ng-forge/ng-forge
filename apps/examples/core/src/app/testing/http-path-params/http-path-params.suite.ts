import { TestSuite } from '../shared/types';
import { conditionPathParamsScenario } from './scenarios/condition-path-params.scenario';
import { derivationPathParamsScenario } from './scenarios/derivation-path-params.scenario';
import { validatorPathParamsScenario } from './scenarios/validator-path-params.scenario';

/**
 * HTTP Path Params Suite
 * Tests URL path parameter interpolation (`:key` placeholders) across
 * HTTP conditions, derivations, and validators.
 */
export const httpPathParamsSuite: TestSuite = {
  id: 'http-path-params',
  title: 'HTTP Path Params Tests',
  description: 'Test scenarios for URL path parameter interpolation in HTTP requests',
  path: '/test/http-path-params',
  scenarios: [conditionPathParamsScenario, derivationPathParamsScenario, validatorPathParamsScenario],
};

/**
 * Get a scenario by its testId
 */
export function getHttpPathParamsScenario(testId: string) {
  return httpPathParamsSuite.scenarios.find((s) => s.testId === testId);
}
