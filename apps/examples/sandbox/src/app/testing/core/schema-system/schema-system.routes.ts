import { Routes } from '@angular/router';
import { getSchemaSystemScenario, schemaSystemSuite } from './schema-system.suite';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/suite-index.component').then((m) => m.SuiteIndexComponent),
    data: { suite: schemaSystemSuite },
  },
  {
    path: 'apply-schema',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getSchemaSystemScenario('apply-schema-test') },
  },
  {
    path: 'apply-when-schema',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getSchemaSystemScenario('apply-when-schema-test') },
  },
];

export default routes;
