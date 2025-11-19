import { Route } from '@angular/router';
import { InvalidConfigComponent } from './invalid-config.component';
import { BasicTestComponent } from './basic-test.component';

export default [
  {
    path: 'invalid-config',
    component: InvalidConfigComponent,
  },
  {
    path: 'basic-test',
    component: BasicTestComponent,
  },
  {
    path: '',
    redirectTo: 'invalid-config',
    pathMatch: 'full',
  },
] satisfies Route[];
