import { APP_ID, ApplicationConfig, Component, provideZonelessChangeDetection, Type } from '@angular/core';
import { provideRouter, RouterOutlet, withHashLocation } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { Route } from '@angular/router';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withBootstrapFields } from '@ng-forge/dynamic-forms-bootstrap';
import { wrapRoutesWithAdapter } from './adapter-routes';

@Component({
  selector: 'unified-bootstrap-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
class BootstrapRootComponent {}

export function createBootstrapApp(routes: Route[]): { config: ApplicationConfig; rootComponent: Type<unknown> } {
  return {
    config: {
      providers: [
        provideZonelessChangeDetection(),
        provideAnimations(),
        provideHttpClient(),
        provideRouter(wrapRoutesWithAdapter('bootstrap', routes), withHashLocation()),
        provideDynamicForm(...withBootstrapFields()),
        { provide: APP_ID, useValue: 'unified-bootstrap' },
      ],
    },
    rootComponent: BootstrapRootComponent,
  };
}
