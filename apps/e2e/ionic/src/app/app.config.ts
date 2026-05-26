import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { appRoutes } from './app.routes';
import { provideAddonActions, provideDynamicForm, type AddonActionContext } from '@ng-forge/dynamic-forms';
import { withIonicFields } from '@ng-forge/dynamic-forms-ionic';
import { DEMO_WRAPPERS } from '@ng-forge/examples-shared-ui';
import { perfMockHttpInterceptor } from '@ng-forge/examples-shared-testing/perf';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(withInterceptors([perfMockHttpInterceptor])),
    provideRouter(appRoutes, withHashLocation()),
    provideAnimations(),
    provideIonicAngular({
      mode: 'md',
    }),
    provideDynamicForm(
      ...withIonicFields(),
      ...DEMO_WRAPPERS,
      provideAddonActions({
        // Used by the `actionRef` e2e scenario: appends '!' to the field value
        // so the dispatch is observable without needing real side effects.
        logClick: (ctx: AddonActionContext) => {
          const current = typeof ctx.value === 'string' ? ctx.value : '';
          ctx.setValue?.(`${current}!`);
        },
      }),
    ),
  ],
};
