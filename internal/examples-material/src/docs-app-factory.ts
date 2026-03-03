import { APP_ID, ApplicationConfig, Component, provideZonelessChangeDetection, Type, ViewEncapsulation } from '@angular/core';
import { provideRouter, RouterOutlet, Route } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withMaterialFields } from '@ng-forge/dynamic-forms-material';

@Component({
  selector: 'docs-material-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  encapsulation: ViewEncapsulation.ExperimentalIsolatedShadowDom,
})
class MaterialRootComponent {}

export function createMaterialDocsApp(routes: Route[]): { config: ApplicationConfig; rootComponent: Type<unknown> } {
  return {
    config: {
      providers: [
        provideZonelessChangeDetection(),
        provideAnimations(),
        provideHttpClient(),
        provideRouter(routes),
        provideDynamicForm(...withMaterialFields()),
        { provide: APP_ID, useValue: 'docs-material' },
      ],
    },
    rootComponent: MaterialRootComponent,
  };
}
