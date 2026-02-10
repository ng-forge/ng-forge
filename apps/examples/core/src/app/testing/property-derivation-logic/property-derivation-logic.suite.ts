import { TestSuite } from '../shared/types';
import { expressionPropertyScenario } from './scenarios/expression-property.scenario';
import { conditionalPropertyScenario } from './scenarios/conditional-property.scenario';
import { functionPropertyScenario } from './scenarios/function-property.scenario';
import { datepickerMindateScenario } from './scenarios/datepicker-mindate.scenario';
import { appearancePropertyScenario } from './scenarios/appearance-property.scenario';
import { arrayPropertyScenario } from './scenarios/array-property.scenario';

export const propertyDerivationLogicSuite: TestSuite = {
  id: 'property-derivation-logic',
  title: 'Property Derivation Logic',
  description: 'Testing reactive derivation of field component properties (labels, options, appearance, minDate) based on form values',
  path: '/test/property-derivation-logic',
  scenarios: [
    expressionPropertyScenario,
    conditionalPropertyScenario,
    functionPropertyScenario,
    datepickerMindateScenario,
    appearancePropertyScenario,
    arrayPropertyScenario,
  ],
};

export function getPropertyDerivationScenario(testId: string) {
  return propertyDerivationLogicSuite.scenarios.find((s) => s.testId === testId);
}
