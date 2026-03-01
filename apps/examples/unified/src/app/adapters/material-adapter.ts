import { APP_ID, ApplicationConfig, Component, provideZonelessChangeDetection, Type } from '@angular/core';
import { provideRouter, RouterOutlet, withHashLocation } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { Route } from '@angular/router';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withMaterialFields } from '@ng-forge/dynamic-forms-material';
import { wrapRoutesWithAdapter } from './adapter-routes';

@Component({
  selector: 'unified-material-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
class MaterialRootComponent {}

export function createMaterialApp(routes: Route[]): { config: ApplicationConfig; rootComponent: Type<unknown> } {
  return {
    config: {
      providers: [
        provideZonelessChangeDetection(),
        provideAnimations(),
        provideHttpClient(),
        provideRouter(wrapRoutesWithAdapter('material', routes), withHashLocation()),
        provideDynamicForm(...withMaterialFields()),
        { provide: APP_ID, useValue: 'unified-material' },
      ],
    },
    rootComponent: MaterialRootComponent,
  };
}
