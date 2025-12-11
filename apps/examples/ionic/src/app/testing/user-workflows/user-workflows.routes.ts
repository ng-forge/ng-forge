import { Routes } from '@angular/router';
import { getUserWorkflowsScenario, userWorkflowsSuite } from './user-workflows.suite';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/suite-index.component').then((m) => m.SuiteIndexComponent),
    data: { suite: userWorkflowsSuite },
  },
  {
    path: 'registration',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getUserWorkflowsScenario('registration-workflow') },
  },
  {
    path: 'profile-edit',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getUserWorkflowsScenario('profile-edit') },
  },
  {
    path: 'validation',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getUserWorkflowsScenario('validation-workflow') },
  },
  {
    path: 'reset',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getUserWorkflowsScenario('reset-workflow') },
  },
  {
    path: 'contact-form',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getUserWorkflowsScenario('contact-form') },
  },
];

export default routes;
