import { APP_ID, ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { provideRouter, RouterOutlet, Route } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withMaterialFields } from '@ng-forge/dynamic-forms-material';
import { DEMO_WRAPPERS } from '@ng-forge/examples-shared-ui';
import { SandboxAppFactory } from '@ng-forge/sandbox-harness';

@Component({
  selector: 'sandbox-material-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  encapsulation: ViewEncapsulation.ExperimentalIsolatedShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class MaterialRootComponent {}

export const createMaterialSandboxApp: SandboxAppFactory = (routes: Route[]) => ({
  config: {
    providers: [
      provideZonelessChangeDetection(),
      provideAnimations(),
      provideHttpClient(),
      provideRouter(routes),
      provideDynamicForm(...withMaterialFields({ appearance: 'outline', color: 'primary' }), ...DEMO_WRAPPERS),
      { provide: APP_ID, useValue: 'sandbox-material' },
    ],
  },
  rootComponent: MaterialRootComponent,
});
