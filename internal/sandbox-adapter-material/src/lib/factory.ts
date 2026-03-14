import { APP_ID, Component, ViewEncapsulation } from '@angular/core';
import { provideRouter, RouterOutlet, Route } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withMaterialFields } from '@ng-forge/dynamic-forms-material';
import { SandboxAppFactory } from '@ng-forge/sandbox-harness';

@Component({
  selector: 'sandbox-material-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  encapsulation: ViewEncapsulation.ExperimentalIsolatedShadowDom,
})
class MaterialRootComponent {}

export const createMaterialSandboxApp: SandboxAppFactory = (routes: Route[]) => ({
  config: {
    providers: [
      provideZonelessChangeDetection(),
      provideAnimations(),
      provideHttpClient(),
      provideRouter(routes),
      provideDynamicForm(...withMaterialFields()),
      { provide: APP_ID, useValue: 'sandbox-material' },
    ],
  },
  rootComponent: MaterialRootComponent,
});
