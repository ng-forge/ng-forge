import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { appRoutes } from './app.routes';
import { provideAddonActions, provideDynamicForm, type AddonActionContext } from '@ng-forge/dynamic-forms';
import { withBootstrapFields } from '@ng-forge/dynamic-forms-bootstrap';
import { DEMO_WRAPPERS } from '@ng-forge/examples-shared-ui';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(appRoutes, withHashLocation()),
    provideAnimations(),
    provideDynamicForm(
      ...withBootstrapFields(),
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
