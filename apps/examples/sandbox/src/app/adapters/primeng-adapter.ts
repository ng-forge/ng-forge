import { Route } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { PRIMENG_EMBER_THEME } from '@ng-forge/styling';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withPrimeNGFields } from '@ng-forge/dynamic-forms-primeng';
import { createSandboxApp, SandboxDefaultRootComponent } from './create-sandbox-app';

export function createPrimeNGApp(routes: Route[]) {
  return createSandboxApp(
    'primeng',
    routes,
    [providePrimeNG({ theme: PRIMENG_EMBER_THEME }), provideDynamicForm(...withPrimeNGFields())],
    SandboxDefaultRootComponent,
    'sandbox-primeng',
  );
}
