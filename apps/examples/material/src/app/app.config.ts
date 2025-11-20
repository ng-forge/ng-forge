import { APP_INITIALIZER, ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import appRoutes from './app.routes';
import { FunctionRegistryService, provideDynamicForm } from '@ng-forge/dynamic-form';
import { withMaterialFields } from '@ng-forge/dynamic-form-material';
import { customValidators } from './validators/custom-validators';

/**
 * Initialize custom validators at app startup
 */
function initializeValidators(registry: FunctionRegistryService) {
  return () => {
    // Register all custom validators
    Object.entries(customValidators).forEach(([name, validator]) => {
      registry.registerValidator(name, validator as any);
    });
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(appRoutes, withHashLocation()),
    provideAnimations(),
    provideDynamicForm(...withMaterialFields()),
    // Provide FunctionRegistryService at app level
    FunctionRegistryService,
    // Register validators at app startup
    {
      provide: APP_INITIALIZER,
      useFactory: initializeValidators,
      deps: [FunctionRegistryService],
      multi: true,
    },
  ],
};
