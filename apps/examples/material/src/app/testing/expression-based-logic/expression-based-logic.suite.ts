import { TestSuite } from '../shared/types';
import { andLogicScenario } from './scenarios/and-logic.scenario';
import { disabledLogicScenario } from './scenarios/disabled-logic.scenario';
import { hiddenLogicScenario } from './scenarios/hidden-logic.scenario';
import { nestedAndWithinOrScenario } from './scenarios/nested-and-within-or.scenario';
import { nestedOrWithinAndScenario } from './scenarios/nested-or-within-and.scenario';
import { orLogicScenario } from './scenarios/or-logic.scenario';
import { readonlyLogicScenario } from './scenarios/readonly-logic.scenario';

export const expressionBasedLogicSuite: TestSuite = {
  id: 'expression-based-logic',
  title: 'Expression-Based Logic',
  description: 'Testing conditional field behavior using various logic expressions',
  path: '/test/expression-based-logic',
  scenarios: [
    hiddenLogicScenario,
    disabledLogicScenario,
    andLogicScenario,
    readonlyLogicScenario,
    orLogicScenario,
    nestedAndWithinOrScenario,
    nestedOrWithinAndScenario,
  ],
};

export function getExpressionBasedLogicScenario(testId: string) {
  return expressionBasedLogicSuite.scenarios.find((s) => s.testId === testId);
}
