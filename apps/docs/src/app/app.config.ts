import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling, UrlSerializer } from '@angular/router';
import { AdapterAwareUrlSerializer } from './serializers/adapter-url-serializer';
import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  NG_DOC_DEFAULT_PAGE_PROCESSORS,
  NG_DOC_DEFAULT_PAGE_SKELETON,
  NgDocDefaultSearchEngine,
  provideMainPageProcessor,
  provideNgDocApp,
  providePageProcessor,
  providePageSkeleton,
  provideSearchEngine,
} from '@ng-doc/app';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { provideNgDocContext } from '@ng-doc/generated';
import { appRoutes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withMaterialFields } from '@ng-forge/dynamic-forms-material';
import { provideAdapterRegistry, SandboxHarness } from '@ng-forge/sandbox-harness';
import { DOCS_ADAPTERS } from './adapters/adapter-registrations';
import { LiveExampleComponent } from './components/live-example/live-example.component';
import { AdapterPickerComponent } from './components/adapter-picker/adapter-picker.component';
import { DocsIntegrationViewComponent } from './components/integration-view/integration-view.component';
import { DocsConfigurationViewComponent } from './components/configuration-view/configuration-view.component';

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
    provideNgDocContext(),
    provideNgDocApp({
      shiki: {
        themes: [import('shiki/themes/material-theme-darker.mjs'), import('shiki/themes/material-theme-lighter.mjs')],
        theme: {
          dark: 'material-theme-darker',
          light: 'material-theme-lighter',
        },
      },
    }),
    provideSearchEngine(NgDocDefaultSearchEngine),
    providePageSkeleton(NG_DOC_DEFAULT_PAGE_SKELETON),
    provideMainPageProcessor(NG_DOC_DEFAULT_PAGE_PROCESSORS),
    provideClientHydration(withEventReplay()),
    { provide: UrlSerializer, useClass: AdapterAwareUrlSerializer },
    // Dynamic forms for landing page demos (Material is always used on landing page)
    provideDynamicForm(...withMaterialFields()),
    // SandboxHarness for live adapter examples in docs pages
    provideAdapterRegistry(DOCS_ADAPTERS),
    SandboxHarness,
    // Register docs-live-example as an ng-doc page processor so it gets bootstrapped
    // when ng-doc renders page content as innerHTML
    providePageProcessor({
      component: LiveExampleComponent,
      selector: 'docs-live-example',
      extractOptions: (element) => ({
        inputs: {
          scenario: element.getAttribute('scenario') ?? '',
        },
      }),
    }),
    providePageProcessor({
      component: AdapterPickerComponent,
      selector: 'docs-adapter-picker',
      extractOptions: () => ({ inputs: {} }),
    }),
    providePageProcessor({
      component: DocsIntegrationViewComponent,
      selector: 'docs-integration-view',
      extractOptions: () => ({ inputs: {} }),
    }),
    providePageProcessor({
      component: DocsConfigurationViewComponent,
      selector: 'docs-configuration-view',
      extractOptions: () => ({ inputs: {} }),
    }),
  ],
};
