import { Routes } from '@angular/router';
import { getZodSchemaValidationScenario, zodSchemaValidationSuite } from './zod-schema-validation.suite';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/suite-index.component').then((m) => m.SuiteIndexComponent),
    data: { suite: zodSchemaValidationSuite },
  },
  {
    path: 'comprehensive-validation',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getZodSchemaValidationScenario('comprehensive-validation-test') },
  },
  {
    path: 'password-confirmation',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getZodSchemaValidationScenario('password-confirmation-test') },
  },
];

export default routes;
