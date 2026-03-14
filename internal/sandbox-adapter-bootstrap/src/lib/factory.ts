import { APP_ID, Component, ViewEncapsulation } from '@angular/core';
import { provideRouter, RouterOutlet, Route } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withBootstrapFields } from '@ng-forge/dynamic-forms-bootstrap';
import { SandboxAppFactory } from '@ng-forge/sandbox-harness';

@Component({
  selector: 'sandbox-bootstrap-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  encapsulation: ViewEncapsulation.ExperimentalIsolatedShadowDom,
})
class BootstrapRootComponent {}

export const createBootstrapSandboxApp: SandboxAppFactory = (routes: Route[]) => ({
  config: {
    providers: [
      provideZonelessChangeDetection(),
      provideAnimations(),
      provideHttpClient(),
      provideRouter(routes),
      provideDynamicForm(...withBootstrapFields()),
      { provide: APP_ID, useValue: 'sandbox-bootstrap' },
    ],
  },
  rootComponent: BootstrapRootComponent,
});
