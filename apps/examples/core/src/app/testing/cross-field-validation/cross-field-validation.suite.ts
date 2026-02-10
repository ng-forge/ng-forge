import { TestSuite } from '../shared/types';
import { conditionalFieldsScenario } from './scenarios/conditional-fields.scenario';
import { dependentFieldsScenario } from './scenarios/dependent-fields.scenario';
import { enableDisableScenario } from './scenarios/enable-disable.scenario';
import { passwordValidationScenario } from './scenarios/password-validation.scenario';

export const crossFieldValidationSuite: TestSuite = {
  id: 'cross-field-validation',
  title: 'Cross-Field Validation',
  description: 'Testing cross-field validation, dependent fields, and conditional logic',
  path: '/test/cross-field-validation',
  scenarios: [passwordValidationScenario, conditionalFieldsScenario, dependentFieldsScenario, enableDisableScenario],
};

export function getCrossFieldValidationScenario(testId: string) {
  return crossFieldValidationSuite.scenarios.find((s) => s.testId === testId);
}
