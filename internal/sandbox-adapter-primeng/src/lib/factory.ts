import { APP_ID, ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { provideRouter, RouterOutlet, Route } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { providePrimeNG } from 'primeng/config';
import { Base } from 'primeng/base';
import { Theme } from '@primeuix/styled';
import { PRIMENG_EMBER_THEME } from '@ng-forge/styling';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withPrimeNGFields } from '@ng-forge/dynamic-forms-primeng';
import { DEMO_WRAPPERS } from '@ng-forge/examples-shared-ui';
import { SandboxAppFactory } from '@ng-forge/sandbox-harness';

@Component({
  selector: 'sandbox-primeng-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  encapsulation: ViewEncapsulation.ExperimentalIsolatedShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PrimeNGRootComponent {}

/**
 * Clears PrimeNG's module-scoped style caches so styles are re-injected in new shadow roots.
 * Both `Base` (component styles) and `Theme` (theme CSS variables) use module-level singletons
 * to track which styles have been injected. When multiple PrimeNG sandboxes coexist on a page,
 * the first one populates these caches and subsequent ones skip injection entirely.
 *
 * WARNING: `clearLoadedStyleNames()` is not a public PrimeNG API. Verified against PrimeNG v19.
 * If PrimeNG removes this method in a future version, sandbox style re-injection will break
 * silently (styles won't appear in new shadow roots). Check after PrimeNG major upgrades.
 */
export function clearPrimeNGStyleCaches(): void {
  try {
    Base.clearLoadedStyleNames();
    Theme.clearLoadedStyleNames();
  } catch (e) {
    console.warn('[SandboxHarness] Failed to clear PrimeNG style caches — internal API may have changed.', e);
  }
}

export const createPrimeNGSandboxApp: SandboxAppFactory = (routes: Route[]) => ({
  config: {
    providers: [
      provideZonelessChangeDetection(),
      provideAnimations(),
      provideHttpClient(),
      provideRouter(routes),
      providePrimeNG({ theme: PRIMENG_EMBER_THEME }),
      provideDynamicForm(...withPrimeNGFields(), ...DEMO_WRAPPERS),
      { provide: APP_ID, useValue: 'sandbox-primeng' },
    ],
  },
  rootComponent: PrimeNGRootComponent,
});
