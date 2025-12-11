import { TestSuite } from '../shared/types';
import { checkoutJourneyScenario } from './scenarios/checkout-journey.scenario';
import { registrationJourneyScenario } from './scenarios/registration-journey.scenario';
import { surveyJourneyScenario } from './scenarios/survey-journey.scenario';

export const userJourneyFlowsSuite: TestSuite = {
  id: 'user-journey-flows',
  title: 'User Journey Flows',
  description: 'Testing complete user journeys including registration, checkout, and surveys',
  path: '/test/user-journey-flows',
  scenarios: [checkoutJourneyScenario, registrationJourneyScenario, surveyJourneyScenario],
};

export function getUserJourneyFlowsScenario(testId: string) {
  return userJourneyFlowsSuite.scenarios.find((s) => s.testId === testId);
}
