import { ApplicationConfig, InjectionToken, Type } from '@angular/core';
import { Route } from '@angular/router';
import { FormConfig } from '@ng-forge/dynamic-forms';

/**
 * Injection token for providing a FormConfig to the sandbox sub-application.
 * Used by the `demo` route to receive its config from the docs host app.
 */
export const SANDBOX_FORM_CONFIG = new InjectionToken<FormConfig>('SANDBOX_FORM_CONFIG');

/**
 * Synchronous factory function for a sandbox sub-application.
 * Receives pre-loaded routes and returns the app config + root component.
 * The dynamic import wrapping this is handled by the AdapterRegistration.factory.
 */
export type SandboxAppFactory = (routes: Route[]) => { config: ApplicationConfig; rootComponent: Type<unknown> };

/**
 * 'custom' is a virtual adapter name for testing harness scenarios with a caller-supplied
 * factory. It has no URL-navigable registration and is intentionally excluded from
 * isAdapterName() — bootstrap('custom') without a registration will throw.
 */
export type AdapterName = 'material' | 'bootstrap' | 'primeng' | 'ionic' | 'custom';

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
  /**
   * Location strategy for the sub-app's router.
   * - 'hash' (default): uses hash-based URLs (suitable for standalone E2E apps)
   * - 'memory': uses in-memory routing (suitable for embedded usage in docs to avoid polluting browser URL)
   */
  locationStrategy?: 'hash' | 'memory';
  /**
   * Style isolation strategy.
   * - undefined (default): injects the adapter stylesheet globally into <head> (suitable for standalone apps)
   * - 'scoped': fetches the adapter stylesheet and wraps it in a CSS @scope rule tied to the container,
   *   preventing global selectors (body, :root, html) from leaking into the parent document
   */
  styleIsolation?: 'scoped';
  /** Optional FormConfig to inject via SANDBOX_FORM_CONFIG token. Used for the docs demo route. */
  config?: FormConfig;
}

export interface SandboxRef {
  readonly adapterName: AdapterName;
  /** The host element created for this sub-application inside the container. */
  readonly hostElement: HTMLElement;
  navigate(url: string): Promise<boolean>;
  destroy(): void;
}
