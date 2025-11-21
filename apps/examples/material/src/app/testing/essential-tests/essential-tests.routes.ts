import { BasicFormTestComponent } from './basic-form.component';
import { AgeBasedLogicTestComponent } from './age-based-logic.component';
import { MultiPageNavigationTestComponent } from './multi-page-navigation.component';

export default [
  {
    path: '',
    loadComponent: () => import('./essential-tests-index.component').then((m) => m.EssentialTestsIndexComponent),
  },
  {
    path: 'basic-form',
    component: BasicFormTestComponent,
  },
  {
    path: 'age-based-logic',
    component: AgeBasedLogicTestComponent,
  },
  {
    path: 'multi-page-navigation',
    component: MultiPageNavigationTestComponent,
  },
];
