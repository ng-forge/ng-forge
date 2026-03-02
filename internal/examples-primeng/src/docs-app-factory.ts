import { APP_ID, ApplicationConfig, Component, provideZonelessChangeDetection, Type, ViewEncapsulation } from '@angular/core';
import { provideRouter, RouterOutlet, Route } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withPrimeNGFields } from '@ng-forge/dynamic-forms-primeng';

@Component({
  selector: 'docs-primeng-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  encapsulation: ViewEncapsulation.ExperimentalIsolatedShadowDom,
})
class PrimeNGRootComponent {}

export function createPrimeNGDocsApp(routes: Route[]): { config: ApplicationConfig; rootComponent: Type<unknown> } {
  return {
    config: {
      providers: [
        provideZonelessChangeDetection(),
        provideAnimations(),
        provideHttpClient(),
        provideRouter(routes),
        providePrimeNG({ theme: { preset: Aura } }),
        provideDynamicForm(...withPrimeNGFields()),
        { provide: APP_ID, useValue: 'docs-primeng' },
      ],
    },
    rootComponent: PrimeNGRootComponent,
  };
}
