import { Route } from '@angular/router';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withMaterialFields } from '@ng-forge/dynamic-forms-material';
import { createSandboxApp, SandboxDefaultRootComponent } from './create-sandbox-app';

export function createCoreApp(routes: Route[]) {
  return createSandboxApp(
    'core',
    routes,
    [provideDynamicForm(...withMaterialFields())],
    SandboxDefaultRootComponent,
    'sandbox-core',
    'test',
  );
}
