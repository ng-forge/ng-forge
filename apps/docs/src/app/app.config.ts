import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling, UrlSerializer } from '@angular/router';
import { AdapterAwareUrlSerializer } from './serializers/adapter-url-serializer';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideContent, withMarkdownRenderer } from '@analogjs/content';
import { withShikiHighlighter } from '@analogjs/content/shiki-highlighter';
import { appRoutes } from './app.routes';
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
    provideRouter(
      appRoutes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
    ),
    provideHttpClient(withFetch()),
    provideAnimationsAsync(),
    provideContent(withMarkdownRenderer(), withShikiHighlighter()),
    provideClientHydration(withEventReplay()),
    { provide: UrlSerializer, useClass: AdapterAwareUrlSerializer },
    // Dynamic forms for landing page demos (Material is always used on landing page)
    provideDynamicForm(...withMaterialFields()),
    // SandboxHarness for live adapter examples in docs pages
    provideAdapterRegistry(DOCS_ADAPTERS),
    SandboxHarness,
  ],
};
