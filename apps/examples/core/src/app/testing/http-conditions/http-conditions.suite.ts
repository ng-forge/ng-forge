import { TestSuite } from '../shared/types';
import { hiddenHttpGetScenario } from './scenarios/hidden-http-get.scenario';
import { disabledHttpPostScenario } from './scenarios/disabled-http-post.scenario';
import { requiredHttpConditionScenario } from './scenarios/required-http-condition.scenario';
import { readonlyHttpConditionScenario } from './scenarios/readonly-http-condition.scenario';
import { responseExpressionScenario } from './scenarios/response-expression.scenario';
import { pendingValueScenario } from './scenarios/pending-value.scenario';
import { httpErrorFallbackScenario } from './scenarios/http-error-fallback.scenario';
import { cacheBehaviorScenario } from './scenarios/cache-behavior.scenario';
import { debounceCoalescingScenario } from './scenarios/debounce-coalescing.scenario';
import { multipleHttpLogicScenario } from './scenarios/multiple-http-logic.scenario';

/**
 * HTTP Conditions Suite
 * Tests conditional field state (hidden, disabled, required, readonly)
 * driven by HTTP responses using type: 'http' conditions.
 */
export const httpConditionsSuite: TestSuite = {
  id: 'http-conditions',
  title: 'HTTP Conditions Tests',
  description: 'Test scenarios for server-driven field state using HTTP condition expressions',
  path: '/test/http-conditions',
  scenarios: [
    hiddenHttpGetScenario,
    disabledHttpPostScenario,
    requiredHttpConditionScenario,
    readonlyHttpConditionScenario,
    responseExpressionScenario,
    pendingValueScenario,
    httpErrorFallbackScenario,
    cacheBehaviorScenario,
    debounceCoalescingScenario,
    multipleHttpLogicScenario,
  ],
};

/**
 * Get a scenario by its testId
 */
export function getHttpConditionsScenario(testId: string) {
  return httpConditionsSuite.scenarios.find((s) => s.testId === testId);
}
