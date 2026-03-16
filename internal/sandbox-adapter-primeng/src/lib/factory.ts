import { APP_ID, Component, ViewEncapsulation } from '@angular/core';
import { provideRouter, RouterOutlet, Route } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { providePrimeNG } from 'primeng/config';
import { PRIMENG_EMBER_THEME } from '@ng-forge/styling';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withPrimeNGFields } from '@ng-forge/dynamic-forms-primeng';
import { SandboxAppFactory } from '@ng-forge/sandbox-harness';

@Component({
  selector: 'sandbox-primeng-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  encapsulation: ViewEncapsulation.ExperimentalIsolatedShadowDom,
})
class PrimeNGRootComponent {}

export const createPrimeNGSandboxApp: SandboxAppFactory = (routes: Route[]) => ({
  config: {
    providers: [
      provideZonelessChangeDetection(),
      provideAnimations(),
      provideHttpClient(),
      provideRouter(routes),
      providePrimeNG({ theme: PRIMENG_EMBER_THEME }),
      provideDynamicForm(...withPrimeNGFields()),
      { provide: APP_ID, useValue: 'sandbox-primeng' },
    ],
  },
  rootComponent: PrimeNGRootComponent,
});
