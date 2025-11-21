import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { appRoutes } from './app.routes';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withIonicFields } from '@ng-forge/dynamic-forms-ionic';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(appRoutes, withHashLocation()),
    provideAnimations(),
    provideIonicAngular({
      mode: 'md',
    }),
    provideDynamicForm(...withIonicFields()),
  ],
};
