import { TestSuite } from '../shared/types';
import { businessFlowScenario } from './scenarios/business-flow.scenario';
import { cascadeDependenciesScenario } from './scenarios/cascade-dependencies.scenario';
import { conditionalPagesScenario } from './scenarios/conditional-pages.scenario';
import { emailVerificationScenario } from './scenarios/email-verification.scenario';
import { progressiveValidationScenario } from './scenarios/progressive-validation.scenario';

export const crossPageValidationSuite: TestSuite = {
  id: 'cross-page-validation',
  title: 'Cross-Page Validation',
  description: 'Testing cross-page validation, conditional pages, and multi-step flows',
  path: '/test/cross-page-validation',
  scenarios: [
    emailVerificationScenario,
    conditionalPagesScenario,
    businessFlowScenario,
    cascadeDependenciesScenario,
    progressiveValidationScenario,
  ],
};

export function getCrossPageValidationScenario(testId: string) {
  return crossPageValidationSuite.scenarios.find((s) => s.testId === testId);
}
