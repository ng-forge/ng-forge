import { TestSuite } from '../shared/types';
import { conditionalFieldsScenario } from './scenarios/conditional-fields.scenario';
import { crossFieldValidationScenario } from './scenarios/cross-field-validation.scenario';
import { profileManagementScenario } from './scenarios/profile-management.scenario';
import { userRegistrationScenario } from './scenarios/user-registration.scenario';

export const demoScenariosSuite: TestSuite = {
  id: 'demo-scenarios',
  title: 'Demo Scenarios',
  description: 'Demonstration scenarios for common form patterns',
  path: '/test/demo-scenarios',
  scenarios: [crossFieldValidationScenario, userRegistrationScenario, profileManagementScenario, conditionalFieldsScenario],
};

export function getDemoScenario(testId: string) {
  return demoScenariosSuite.scenarios.find((s) => s.testId === testId);
}
