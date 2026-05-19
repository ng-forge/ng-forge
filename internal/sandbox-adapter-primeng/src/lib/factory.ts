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
 * to track which styles have been injected.
 *
 * Clearing alone isn't enough when multiple PrimeNG sandboxes mount concurrently: both
 * bootstraps clear the cache, but as soon as demo #1's first component injects its style
 * (and calls `setLoadedStyleName`), demo #2's parallel injection sees the cache populated
 * and skips — so demo #2 never gets that component's styles in its own shadow root.
 *
 * The reliable fix is to permanently neutralise `isStyleNameLoaded` so every component
 * style injection proceeds. The `setLoadedStyleName` calls still run (the Set still grows)
 * but the gate they protect is always open. Per-shadow-root style elements are then handled
 * by each sub-app's DocumentProxy redirecting `head.appendChild` into its shadow root.
 *
 * WARNING: `_loadedStyleNames` / `isStyleNameLoaded` / `clearLoadedStyleNames` are not
 * public PrimeNG APIs. Verified against PrimeNG v21. If these change, sandbox style
 * re-injection will break silently — check after PrimeNG major upgrades.
 */
let isStyleNameLoadedNeutralised = false;
function neutraliseIsStyleNameLoaded(): void {
  if (isStyleNameLoadedNeutralised) return;
  try {
    // Cast to a record so we can override the method; Base is an object literal at runtime.
    (Base as unknown as { isStyleNameLoaded: () => boolean }).isStyleNameLoaded = () => false;
    (Theme as unknown as { isStyleNameLoaded: () => boolean }).isStyleNameLoaded = () => false;
    isStyleNameLoadedNeutralised = true;
  } catch (e) {
    console.warn('[SandboxHarness] Failed to neutralise PrimeNG style-cache check — internal API may have changed.', e);
  }
}

export function clearPrimeNGStyleCaches(): void {
  // Permanent neutralisation runs on first call and stays — cheap and idempotent.
  neutraliseIsStyleNameLoaded();
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
