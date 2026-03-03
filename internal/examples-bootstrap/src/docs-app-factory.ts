import { APP_ID, ApplicationConfig, Component, provideZonelessChangeDetection, Type, ViewEncapsulation } from '@angular/core';
import { provideRouter, RouterOutlet, Route } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withBootstrapFields } from '@ng-forge/dynamic-forms-bootstrap';

@Component({
  selector: 'docs-bootstrap-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  encapsulation: ViewEncapsulation.ExperimentalIsolatedShadowDom,
})
class BootstrapRootComponent {}

export function createBootstrapDocsApp(routes: Route[]): { config: ApplicationConfig; rootComponent: Type<unknown> } {
  return {
    config: {
      providers: [
        provideZonelessChangeDetection(),
        provideAnimations(),
        provideHttpClient(),
        provideRouter(routes),
        provideDynamicForm(...withBootstrapFields()),
        { provide: APP_ID, useValue: 'docs-bootstrap' },
      ],
    },
    rootComponent: BootstrapRootComponent,
  };
}
