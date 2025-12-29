import { TestSuite } from '../shared/types';
import { staticValueDerivationScenario } from './scenarios/static-value-derivation.scenario';
import { expressionDerivationScenario } from './scenarios/expression-derivation.scenario';
import { functionDerivationScenario } from './scenarios/function-derivation.scenario';
import { conditionalDerivationScenario } from './scenarios/conditional-derivation.scenario';
import { selfTransformScenario } from './scenarios/self-transform.scenario';
import { chainDerivationScenario } from './scenarios/chain-derivation.scenario';
import { shorthandDerivationScenario } from './scenarios/shorthand-derivation.scenario';
import { arrayFieldDerivationScenario } from './scenarios/array-field-derivation.scenario';

export const derivationLogicSuite: TestSuite = {
  id: 'derivation-logic',
  title: 'Value Derivation Logic',
  description: 'Testing automatic value derivation based on field values, expressions, and custom functions',
  path: '/test/derivation-logic',
  scenarios: [
    staticValueDerivationScenario,
    expressionDerivationScenario,
    functionDerivationScenario,
    conditionalDerivationScenario,
    selfTransformScenario,
    chainDerivationScenario,
    shorthandDerivationScenario,
    arrayFieldDerivationScenario,
  ],
};

export function getDerivationLogicScenario(testId: string) {
  return derivationLogicSuite.scenarios.find((s) => s.testId === testId);
}
