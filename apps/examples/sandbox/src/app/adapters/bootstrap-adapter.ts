import { Route } from '@angular/router';
import { provideDynamicForm, withLegacyStatusClasses } from '@ng-forge/dynamic-forms';
import { withBootstrapFields } from '@ng-forge/dynamic-forms-bootstrap';
import { createSandboxApp, SandboxDefaultRootComponent } from './create-sandbox-app';

export function createBootstrapApp(routes: Route[]) {
  return createSandboxApp(
    'bootstrap',
    routes,
    [provideDynamicForm(...withBootstrapFields(), withLegacyStatusClasses())],
    SandboxDefaultRootComponent,
    'sandbox-bootstrap',
  );
}
