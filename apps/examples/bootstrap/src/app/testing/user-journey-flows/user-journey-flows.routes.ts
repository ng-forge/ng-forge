import { Routes } from '@angular/router';
import { getUserJourneyFlowsScenario, userJourneyFlowsSuite } from './user-journey-flows.suite';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/suite-index.component').then((m) => m.SuiteIndexComponent),
    data: { suite: userJourneyFlowsSuite },
  },
  {
    path: 'checkout-journey',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getUserJourneyFlowsScenario('checkout-journey') },
  },
  {
    path: 'registration-journey',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getUserJourneyFlowsScenario('registration-journey') },
  },
  {
    path: 'survey-journey',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getUserJourneyFlowsScenario('survey-journey') },
  },
];

export default routes;
