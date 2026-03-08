import { TestSuite } from '../shared/types';
import {
  basicSubmissionScenario,
  buttonDisabledInvalidScenario,
  buttonDisabledSubmittingScenario,
  buttonNeverDisabledScenario,
  conditionalExpressionScenario,
  explicitDisabledScenario,
  formStateConditionScenario,
  hiddenFieldScenario,
  httpErrorHandlingScenario,
  nextButtonNeverDisabledScenario,
  nextButtonPageValidationScenario,
  submitInsideGroupScenario,
} from './scenarios';

export const submissionBehaviorSuite: TestSuite = {
  id: 'submission-behavior',
  title: 'Submission Behavior',
  description: 'Testing form submission, button disabled states, and custom button logic',
  path: '/test/submission-behavior',
  scenarios: [
    basicSubmissionScenario,
    buttonDisabledInvalidScenario,
    buttonDisabledSubmittingScenario,
    buttonNeverDisabledScenario,
    nextButtonPageValidationScenario,
    nextButtonNeverDisabledScenario,
    formStateConditionScenario,
    conditionalExpressionScenario,
    explicitDisabledScenario,
    httpErrorHandlingScenario,
    hiddenFieldScenario,
    submitInsideGroupScenario,
  ],
};

export function getSubmissionBehaviorScenario(testId: string) {
  return submissionBehaviorSuite.scenarios.find((s) => s.testId === testId);
}
