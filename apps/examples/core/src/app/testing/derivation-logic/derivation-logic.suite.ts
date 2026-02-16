import { TestSuite } from '../shared/types';
import { staticValueDerivationScenario } from './scenarios/static-value-derivation.scenario';
import { expressionDerivationScenario } from './scenarios/expression-derivation.scenario';
import { functionDerivationScenario } from './scenarios/function-derivation.scenario';
import { conditionalDerivationScenario } from './scenarios/conditional-derivation.scenario';
import { selfTransformScenario } from './scenarios/self-transform.scenario';
import { chainDerivationScenario } from './scenarios/chain-derivation.scenario';
import { shorthandDerivationScenario } from './scenarios/shorthand-derivation.scenario';
import { arrayFieldDerivationScenario } from './scenarios/array-field-derivation.scenario';
import { bidirectionalFloatScenario } from './scenarios/bidirectional-float.scenario';
import { derivationInGroupScenario } from './scenarios/derivation-in-group.scenario';
import { stopOnUserOverrideScenario } from './scenarios/stop-on-user-override.scenario';
import { reEngageOnDependencyChangeScenario } from './scenarios/re-engage-on-dependency-change.scenario';
import { fieldStateConditionScenario } from './scenarios/field-state-condition.scenario';
import { fieldStateAdvancedScenario } from './scenarios/field-state-advanced.scenario';
import { arrayStopOnUserOverrideScenario } from './scenarios/array-stop-on-user-override.scenario';

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
    bidirectionalFloatScenario,
    derivationInGroupScenario,
    stopOnUserOverrideScenario,
    reEngageOnDependencyChangeScenario,
    fieldStateConditionScenario,
    fieldStateAdvancedScenario,
    arrayStopOnUserOverrideScenario,
  ],
};

export function getDerivationLogicScenario(testId: string) {
  return derivationLogicSuite.scenarios.find((s) => s.testId === testId);
}
