import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  NG_DOC_DEFAULT_PAGE_PROCESSORS,
  NG_DOC_DEFAULT_PAGE_SKELETON,
  NgDocDefaultSearchEngine,
  provideMainPageProcessor,
  provideNgDocApp,
  providePageSkeleton,
  provideSearchEngine,
} from '@ng-doc/app';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { provideNgDocContext } from '@ng-doc/generated';
import { appRoutes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ENVIRONMENT, environment, environmentProd } from './config/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(
      appRoutes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      })
    ),
    provideHttpClient(),
    provideAnimationsAsync(),
    provideNgDocContext(),
    provideNgDocApp({
      shiki: {
        theme: {
          dark: 'material-theme-darker',
          light: 'material-theme-lighter',
        },
      },
    }),
    provideSearchEngine(NgDocDefaultSearchEngine),
    providePageSkeleton(NG_DOC_DEFAULT_PAGE_SKELETON),
    provideMainPageProcessor(NG_DOC_DEFAULT_PAGE_PROCESSORS),
    // Environment configuration for iframe example URLs
    {
      provide: ENVIRONMENT,
      useFactory: () => {
        // Detect production environment
        if (typeof window !== 'undefined' && window.location.hostname.includes('github.io')) {
          return environmentProd;
        }
        return environment;
      },
    },
  ],
};
