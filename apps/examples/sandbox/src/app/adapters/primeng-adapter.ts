import { APP_ID, ApplicationConfig, Component, provideZonelessChangeDetection, Type } from '@angular/core';
import { provideRouter, RouterOutlet, withHashLocation } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { Route } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { PRIMENG_EMBER_THEME } from '@ng-forge/styling';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withPrimeNGFields } from '@ng-forge/dynamic-forms-primeng';
import { wrapRoutesWithAdapter } from './adapter-routes';

@Component({
  selector: 'sandbox-primeng-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
class PrimeNGRootComponent {}

export function createPrimeNGApp(routes: Route[]): { config: ApplicationConfig; rootComponent: Type<unknown> } {
  return {
    config: {
      providers: [
        provideZonelessChangeDetection(),
        provideAnimations(),
        provideHttpClient(),
        provideRouter(wrapRoutesWithAdapter('primeng', routes), withHashLocation()),
        providePrimeNG({ theme: PRIMENG_EMBER_THEME }),
        provideDynamicForm(...withPrimeNGFields()),
        { provide: APP_ID, useValue: 'sandbox-primeng' },
      ],
    },
    rootComponent: PrimeNGRootComponent,
  };
}
