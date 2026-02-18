import { TestSuite } from '../shared/types';
import { hiddenAsyncScenario } from './scenarios/hidden-async.scenario';
import { disabledAsyncScenario } from './scenarios/disabled-async.scenario';
import { requiredAsyncScenario } from './scenarios/required-async.scenario';
import { readonlyAsyncScenario } from './scenarios/readonly-async.scenario';
import { asyncErrorFallbackScenario } from './scenarios/async-error-fallback.scenario';
import { asyncPendingValueScenario } from './scenarios/async-pending-value.scenario';
import { compositeAsyncScenario } from './scenarios/composite-async.scenario';

/**
 * Async Conditions Suite
 * Tests conditional field state (hidden, disabled, required, readonly)
 * driven by async custom functions using type: 'async' conditions.
 */
export const asyncConditionsSuite: TestSuite = {
  id: 'async-conditions',
  title: 'Async Conditions Tests',
  description: 'Test scenarios for async custom function-driven field state (hidden, disabled, required, readonly)',
  path: '/test/async-conditions',
  scenarios: [
    hiddenAsyncScenario,
    disabledAsyncScenario,
    requiredAsyncScenario,
    readonlyAsyncScenario,
    asyncErrorFallbackScenario,
    asyncPendingValueScenario,
    compositeAsyncScenario,
  ],
};

/**
 * Get a scenario by its testId
 */
export function getAsyncConditionsScenario(testId: string) {
  return asyncConditionsSuite.scenarios.find((s) => s.testId === testId);
}
