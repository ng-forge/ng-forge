import { Route } from '@angular/router';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withMaterialFields } from '@ng-forge/dynamic-forms-material';
import { createSandboxApp, SandboxDefaultRootComponent } from './create-sandbox-app';

export function createMaterialApp(routes: Route[]) {
  return createSandboxApp(
    'material',
    routes,
    [provideDynamicForm(...withMaterialFields())],
    SandboxDefaultRootComponent,
    'sandbox-material',
  );
}
