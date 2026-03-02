import { ApplicationConfig, ApplicationRef, createComponent, Type } from '@angular/core';
import { createApplication } from '@angular/platform-browser';
import { Route, Router } from '@angular/router';
import { AdapterConfig, AdapterName, ADAPTERS } from './adapters/adapter-config';

const STYLESHEET_ID_PREFIX = 'sandbox-adapter-style-';

/**
 * Eagerly loads routes for a given adapter from the pre-built example libraries.
 * Routes are loaded before the sub-app is created so they're available
 * synchronously to the router (as `children` rather than `loadChildren`).
 */
async function loadAdapterRoutes(adapter: AdapterName): Promise<Route[]> {
  switch (adapter) {
    case 'material': {
      const lib = await import('@ng-forge/examples-material');
      return [
        { path: 'examples', children: lib.EXAMPLES_ROUTES },
        { path: 'test', children: lib.TESTING_ROUTES },
      ];
    }
    case 'bootstrap': {
      const lib = await import('@ng-forge/examples-bootstrap');
      return [
        { path: 'examples', children: lib.EXAMPLES_ROUTES },
        { path: 'test', children: lib.TESTING_ROUTES },
      ];
    }
    case 'primeng': {
      const lib = await import('@ng-forge/examples-primeng');
      return [
        { path: 'examples', children: lib.EXAMPLES_ROUTES },
        { path: 'test', children: lib.TESTING_ROUTES },
      ];
    }
    case 'ionic': {
      const lib = await import('@ng-forge/examples-ionic');
      return [
        { path: 'examples', children: lib.EXAMPLES_ROUTES },
        { path: 'test', children: lib.TESTING_ROUTES },
      ];
    }
    case 'core': {
      const lib = await import('@ng-forge/examples-core');
      return [{ path: 'test', children: lib.TESTING_ROUTES }];
    }
  }
}

/**
 * Load the adapter module and create the sub-app configuration.
 *
 * Dynamic imports are inlined with string literals so the bundler
 * can code-split each adapter into its own chunk.
 */
function loadAdapterModule(adapter: AdapterName, routes: Route[]): Promise<{ config: ApplicationConfig; rootComponent: Type<unknown> }> {
  switch (adapter) {
    case 'material':
      return import('./adapters/material-adapter').then((m) => m.createMaterialApp(routes));
    case 'bootstrap':
      return import('./adapters/bootstrap-adapter').then((m) => m.createBootstrapApp(routes));
    case 'primeng':
      return import('./adapters/primeng-adapter').then((m) => m.createPrimeNGApp(routes));
    case 'ionic':
      return import('./adapters/ionic-adapter').then((m) => m.createIonicApp(routes));
    case 'core':
      return import('./adapters/core-adapter').then((m) => m.createCoreApp(routes));
  }
}

export class AdapterManagerService {
  private activeApp: ApplicationRef | null = null;
  private activeAdapter: AdapterName | null = null;

  get activeAdapterName(): AdapterName | null {
    return this.activeAdapter;
  }

  async switchTo(adapter: AdapterName, container: HTMLElement): Promise<void> {
    this.destroy(container);
    await this.mount(adapter, container);
  }

  private async mount(adapterName: AdapterName, container: HTMLElement): Promise<void> {
    // Set early to prevent re-entrant mounts from hashchange events
    this.activeAdapter = adapterName;

    const adapter = ADAPTERS[adapterName];

    // Load routes eagerly so they're available synchronously to the router
    const routes = await loadAdapterRoutes(adapterName);

    // Load adapter module (code-split) with routes
    const { config, rootComponent } = await loadAdapterModule(adapterName, routes);

    // Swap stylesheet
    this.swapStylesheet(adapter);

    // Create the sub-application
    const appRef = await createApplication(config);

    // Create the host element for the root component
    const hostElement = document.createElement('div');
    container.appendChild(hostElement);

    // Create and attach the root component
    const componentRef = createComponent(rootComponent, {
      environmentInjector: appRef.injector,
      hostElement,
    });

    appRef.attachView(componentRef.hostView);

    // Trigger navigation after the router-outlet is in the DOM.
    // createApplication() runs APP_INITIALIZERs (including router init)
    // before the component with <router-outlet> is attached, so we
    // must manually re-trigger navigation using the actual hash URL.
    const router = appRef.injector.get(Router);
    const hashUrl = window.location.hash.replace(/^#/, '') || '/';
    await router.navigateByUrl(hashUrl);

    this.activeApp = appRef;
  }

  destroy(container?: HTMLElement): void {
    if (this.activeApp) {
      this.activeApp.destroy();
      this.activeApp = null;
    }
    if (container) {
      container.innerHTML = '';
    }
    this.removeActiveStylesheet();
    this.cleanupThemeAttributes();
    this.activeAdapter = null;
  }

  private swapStylesheet(adapter: AdapterConfig): void {
    this.removeActiveStylesheet();

    const link = document.createElement('link');
    link.id = `${STYLESHEET_ID_PREFIX}${adapter.name}`;
    link.rel = 'stylesheet';
    link.href = adapter.stylesheetUrl;
    document.head.appendChild(link);
  }

  private removeActiveStylesheet(): void {
    if (this.activeAdapter) {
      const existing = document.getElementById(`${STYLESHEET_ID_PREFIX}${this.activeAdapter}`);
      existing?.remove();
    }
  }

  private cleanupThemeAttributes(): void {
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-bs-theme');
  }
}
