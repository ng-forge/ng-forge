import { TestSuite } from '../shared/types';
import { configSwapSimpleScenario } from './scenarios/config-swap-simple.scenario';
import { configSwapPreserveValuesScenario } from './scenarios/config-swap-preserve-values.scenario';
import { configAddFieldsScenario } from './scenarios/config-add-fields.scenario';
import { configRemoveFieldsScenario } from './scenarios/config-remove-fields.scenario';
import { configSwapWithArraysScenario } from './scenarios/config-swap-with-arrays.scenario';
import { configSwapPagesScenario } from './scenarios/config-swap-pages.scenario';
import { valueBindingScenario } from './scenarios/value-binding.scenario';

/**
 * Config Change Suite
 * Tests the form's behavior when FormConfig changes dynamically at runtime.
 * This is the core concern of the state manager refactor.
 */
export const configChangeSuite: TestSuite = {
  id: 'config-change',
  title: 'Config Change Tests',
  description: 'Test scenarios for dynamic FormConfig changes at runtime',
  path: '/test/config-change',
  scenarios: [
    configSwapSimpleScenario,
    configSwapPreserveValuesScenario,
    configAddFieldsScenario,
    configRemoveFieldsScenario,
    configSwapWithArraysScenario,
    configSwapPagesScenario,
    valueBindingScenario,
  ],
};

/**
 * Get a scenario by its testId
 */
export function getConfigChangeScenario(testId: string) {
  return configChangeSuite.scenarios.find((s) => s.testId === testId);
}
