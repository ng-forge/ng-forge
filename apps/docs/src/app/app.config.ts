import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { withInMemoryScrolling, UrlSerializer, withNavigationErrorHandler } from '@angular/router';
import { provideFileRouter, withExtraRoutes } from '@analogjs/router';
import { AdapterAwareUrlSerializer } from './serializers/adapter-url-serializer';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideContent, withMarkdownRenderer } from '@analogjs/content';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withMaterialFields } from '@ng-forge/dynamic-forms-material';
import { provideAdapterRegistry, SandboxHarness } from '@ng-forge/sandbox-harness';
import { DOCS_ADAPTERS } from './adapters/adapter-registrations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideFileRouter(
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
      withNavigationErrorHandler((err) => console.warn('[Router]', err)),
      withExtraRoutes([
        // Adapter root → Getting Started (pathMatch: full prevents child route interference)
        { path: 'material', redirectTo: '/material/getting-started', pathMatch: 'full' },
        { path: 'bootstrap', redirectTo: '/bootstrap/getting-started', pathMatch: 'full' },
        { path: 'primeng', redirectTo: '/primeng/getting-started', pathMatch: 'full' },
        { path: 'ionic', redirectTo: '/ionic/getting-started', pathMatch: 'full' },
        { path: 'custom', redirectTo: '/custom/getting-started', pathMatch: 'full' },
      ]),
    ),
    provideHttpClient(withFetch()),
    provideAnimationsAsync(),
    provideContent(withMarkdownRenderer()),
    provideClientHydration(withEventReplay()),
    { provide: UrlSerializer, useClass: AdapterAwareUrlSerializer },
    // Dynamic forms for landing page demos (Material is always used on landing page)
    provideDynamicForm(...withMaterialFields()),
    // SandboxHarness for live adapter examples in docs pages
    provideAdapterRegistry(DOCS_ADAPTERS),
    SandboxHarness,
  ],
};
