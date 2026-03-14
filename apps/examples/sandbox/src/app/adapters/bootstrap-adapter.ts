import { Route } from '@angular/router';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withBootstrapFields } from '@ng-forge/dynamic-forms-bootstrap';
import { createSandboxApp, SandboxDefaultRootComponent } from './create-sandbox-app';

export function createBootstrapApp(routes: Route[]) {
  return createSandboxApp(
    'bootstrap',
    routes,
    [provideDynamicForm(...withBootstrapFields())],
    SandboxDefaultRootComponent,
    'sandbox-bootstrap',
  );
}
