import { BrowserNavigationTestComponent } from './browser-navigation.component';
import { RefreshTestComponent } from './refresh-test.component';
import { RapidNavigationTestComponent } from './rapid-navigation.component';
import { NetworkInterruptionTestComponent } from './network-interruption.component';
import { InvalidNavigationTestComponent } from './invalid-navigation.component';
import { DestructionTestComponent } from './destruction-test.component';

export default [
  {
    path: '',
    loadComponent: () => import('./navigation-edge-cases-index.component').then((m) => m.NavigationEdgeCasesIndexComponent),
  },
  {
    path: 'browser-navigation',
    component: BrowserNavigationTestComponent,
  },
  {
    path: 'refresh-test',
    component: RefreshTestComponent,
  },
  {
    path: 'rapid-navigation',
    component: RapidNavigationTestComponent,
  },
  {
    path: 'network-interruption',
    component: NetworkInterruptionTestComponent,
  },
  {
    path: 'invalid-navigation',
    component: InvalidNavigationTestComponent,
  },
  {
    path: 'destruction-test',
    component: DestructionTestComponent,
  },
];
