import { TestSuite } from '../shared/types';
import { arrayNestedHiddenRequiredScenario } from './scenarios/array-nested-hidden-required.scenario';
import { basicHiddenRequiredScenario } from './scenarios/basic-hidden-required.scenario';
import { cascadeMiddleOverrideScenario } from './scenarios/cascade-middle-override.scenario';
import { fieldValidateWhenHiddenScenario } from './scenarios/field-validate-when-hidden.scenario';
import { formValidateWhenHiddenScenario } from './scenarios/form-validate-when-hidden.scenario';
import { groupCascadeHiddenScenario } from './scenarios/group-cascade-hidden.scenario';
import { toggleHiddenRequiredScenario } from './scenarios/toggle-hidden-required.scenario';

export const cascadingValidationSuite: TestSuite = {
  id: 'cascading-validation',
  title: 'Cascading Validation',
  description: 'validateWhenHidden cascade — hidden fields skip validators by default and overrides cascade through the field tree',
  path: '/test/cascading-validation',
  scenarios: [
    basicHiddenRequiredScenario,
    toggleHiddenRequiredScenario,
    fieldValidateWhenHiddenScenario,
    formValidateWhenHiddenScenario,
    groupCascadeHiddenScenario,
    cascadeMiddleOverrideScenario,
    arrayNestedHiddenRequiredScenario,
  ],
};

export function getCascadingValidationScenario(testId: string) {
  return cascadingValidationSuite.scenarios.find((s) => s.testId === testId);
}
