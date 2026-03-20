import { ApplicationConfig, inject, PLATFORM_ID, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { DOCUMENT, isPlatformBrowser, APP_BASE_HREF } from '@angular/common';
import { withInMemoryScrolling, UrlSerializer, withNavigationErrorHandler } from '@angular/router';
import { provideFileRouter, withExtraRoutes } from '@analogjs/router';
import { AdapterAwareUrlSerializer } from './serializers/adapter-url-serializer';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideContent, withMarkdownRenderer } from '@analogjs/content';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAdapterRegistry, SandboxHarness } from '@ng-forge/sandbox-harness';
import { DOCS_ADAPTERS } from './adapters/adapter-registrations';

// Type-only import: ensures Material's module augmentation of FormConfig is visible
// to all docs files (e.g. example-configs/) even though the runtime provider is removed.
import type {} from '@ng-forge/dynamic-forms-material';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideFileRouter(
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
      withNavigationErrorHandler(() => void 0),
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
    {
      provide: APP_BASE_HREF,
      useFactory: () => {
        const doc = inject(DOCUMENT);
        const platformId = inject(PLATFORM_ID);
        if (isPlatformBrowser(platformId)) {
          const base = doc.querySelector('base')?.getAttribute('href');
          return base ?? '/';
        }
        return '/';
      },
    },
    // SandboxHarness for live adapter examples in docs pages
    provideAdapterRegistry(DOCS_ADAPTERS),
    SandboxHarness,
  ],
};
