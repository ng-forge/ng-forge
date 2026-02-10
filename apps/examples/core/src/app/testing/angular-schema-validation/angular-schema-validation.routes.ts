import { Routes } from '@angular/router';
import { angularSchemaValidationSuite, getAngularSchemaValidationScenario } from './angular-schema-validation.suite';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/suite-index.component').then((m) => m.SuiteIndexComponent),
    data: { suite: angularSchemaValidationSuite },
  },
  {
    path: 'password-confirmation',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getAngularSchemaValidationScenario('angular-password-confirmation-test') },
  },
];

export default routes;
