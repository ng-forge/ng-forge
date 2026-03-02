import { ApplicationConfig, Type } from '@angular/core';
import { Route } from '@angular/router';

export type AdapterName = 'material' | 'bootstrap' | 'primeng' | 'ionic' | 'core';

/**
 * Registration for a UI adapter in the sandbox harness.
 * Dynamic imports must be defined in the consuming app (not this library)
 * so the bundler can code-split each adapter into its own chunk.
 */
export interface AdapterRegistration {
  name: AdapterName;
  /** URL of the pre-built CSS bundle for this adapter (relative to the app's base). */
  stylesheetUrl: string;
  /** Default route segment to navigate to after mount if none is specified. */
  defaultRoute: string;
  /**
   * Eagerly loads routes from the pre-built example library.
   * Called before factory() so routes are available synchronously to the router.
   */
  loadRoutes: () => Promise<Route[]>;
  /**
   * Lazy-loads the adapter module and returns app config + root component.
   * Receives the pre-loaded routes so they can be passed to provideRouter().
   */
  factory: (routes: Route[]) => Promise<{ config: ApplicationConfig; rootComponent: Type<unknown> }>;
}

export interface SandboxBootstrapOptions {
  /** Initial route to navigate to after mount. Defaults to the adapter's defaultRoute. */
  route?: string;
}

export interface SandboxRef {
  readonly adapterName: AdapterName;
  navigate(url: string): Promise<boolean>;
  destroy(): void;
}
