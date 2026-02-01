import { Routes } from '@angular/router';
import { fieldMetaSuite, getFieldMetaScenario } from './field-meta.suite';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/suite-index.component').then((m) => m.SuiteIndexComponent),
    data: { suite: fieldMetaSuite },
  },
  {
    path: 'wrapped-components',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getFieldMetaScenario('meta-wrapped-components-test') },
  },
  {
    path: 'native-elements',
    loadComponent: () => import('../shared/test-scenario.component').then((m) => m.TestScenarioComponent),
    data: { scenario: getFieldMetaScenario('meta-native-elements-test') },
  },
];

export default routes;
