import { TestSuite } from '../shared/types';
import { contactFormWorkflowScenario } from './scenarios/contact-form-workflow.scenario';
import { profileEditWorkflowScenario } from './scenarios/profile-edit-workflow.scenario';
import { registrationWorkflowScenario } from './scenarios/registration-workflow.scenario';
import { resetWorkflowScenario } from './scenarios/reset-workflow.scenario';
import { validationWorkflowScenario } from './scenarios/validation-workflow.scenario';

export const userWorkflowsSuite: TestSuite = {
  id: 'user-workflows',
  title: 'User Workflows',
  description: 'Testing user workflows including registration, profile editing, validation, and form reset',
  path: '/test/user-workflows',
  scenarios: [
    registrationWorkflowScenario,
    profileEditWorkflowScenario,
    validationWorkflowScenario,
    resetWorkflowScenario,
    contactFormWorkflowScenario,
  ],
};

export function getUserWorkflowsScenario(testId: string) {
  return userWorkflowsSuite.scenarios.find((s) => s.testId === testId);
}
