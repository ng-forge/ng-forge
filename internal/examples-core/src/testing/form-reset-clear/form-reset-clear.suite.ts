import { TestSuite } from '../shared/types';
import { clearAllScenario } from './scenarios/clear-all.scenario';
import { clearCheckboxScenario } from './scenarios/clear-checkbox.scenario';
import { clearSelectScenario } from './scenarios/clear-select.scenario';
import { multipleCyclesScenario } from './scenarios/multiple-cycles.scenario';
import { requiredResetClearScenario } from './scenarios/required-reset-clear.scenario';
import { resetCheckboxScenario } from './scenarios/reset-checkbox.scenario';
import { resetDefaultsScenario } from './scenarios/reset-defaults.scenario';
import { resetNestedScenario } from './scenarios/reset-nested.scenario';
import { resetSelectScenario } from './scenarios/reset-select.scenario';
import { resetValidationScenario } from './scenarios/reset-validation.scenario';
import { resetVsClearScenario } from './scenarios/reset-vs-clear.scenario';
import { resetWithArraysScenario } from './scenarios/reset-with-arrays.scenario';
import { resetWithGroupsScenario } from './scenarios/reset-with-groups.scenario';

export const formResetClearSuite: TestSuite = {
  id: 'form-reset-clear',
  title: 'Form Reset and Clear',
  description: 'Testing form reset and clear functionality',
  path: '/test/form-reset-clear',
  scenarios: [
    resetDefaultsScenario,
    resetSelectScenario,
    resetCheckboxScenario,
    resetValidationScenario,
    clearAllScenario,
    clearSelectScenario,
    clearCheckboxScenario,
    resetVsClearScenario,
    requiredResetClearScenario,
    resetNestedScenario,
    multipleCyclesScenario,
    resetWithArraysScenario,
    resetWithGroupsScenario,
  ],
};

export function getFormResetClearScenario(testId: string) {
  return formResetClearSuite.scenarios.find((s) => s.testId === testId);
}
