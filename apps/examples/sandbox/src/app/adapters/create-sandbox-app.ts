import {
  APP_ID,
  ApplicationConfig,
  ChangeDetectionStrategy,
  Component,
  EnvironmentProviders,
  Provider,
  provideZonelessChangeDetection,
  Type,
} from '@angular/core';
import { provideRouter, RouterOutlet, withHashLocation } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { Route } from '@angular/router';
import { wrapRoutesWithAdapter } from './adapter-routes';

/**
 * Default root component for sandbox adapters that use a standard router-outlet layout.
 * Ionic uses its own root component with IonApp/IonRouterOutlet instead.
 */
@Component({
  selector: 'sandbox-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SandboxDefaultRootComponent {}

/**
 * Creates a sandbox sub-application config for a given adapter.
 * Shared across all adapters to eliminate boilerplate. Ionic passes its own
 * rootComponent with the IonApp/IonRouterOutlet template.
 */
export function createSandboxApp(
  adapterName: string,
  routes: Route[],
  providers: Array<Provider | EnvironmentProviders>,
  rootComponent: Type<unknown>,
  appId: string,
  defaultRoute?: string,
): { config: ApplicationConfig; rootComponent: Type<unknown> } {
  return {
    config: {
      providers: [
        provideZonelessChangeDetection(),
        provideAnimationsAsync(),
        provideHttpClient(),
        provideRouter(wrapRoutesWithAdapter(adapterName, routes, defaultRoute), withHashLocation()),
        ...providers,
        { provide: APP_ID, useValue: appId },
      ],
    },
    rootComponent,
  };
}
