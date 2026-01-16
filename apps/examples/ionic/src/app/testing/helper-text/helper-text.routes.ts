import { Routes } from '@angular/router';
import { helperTextSuite, getHelperTextScenario } from './helper-text.suite';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/suite-index.component').then((m) => m.SuiteIndexComponent),
    data: { suite: helperTextSuite },
  },
  {
    path: 'helper-text-fields',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getHelperTextScenario('helper-text-fields-test') },
  },
];

export default routes;
