import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { appRoutes } from './app.routes';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withBootstrapFields } from '@ng-forge/dynamic-forms-bootstrap';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(appRoutes, withHashLocation()),
    provideAnimations(),
    provideDynamicForm(...withBootstrapFields()),
  ],
};
