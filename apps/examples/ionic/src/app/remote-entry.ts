import { ApplicationRef, ComponentRef, createComponent, EnvironmentProviders, Provider, Type } from '@angular/core';
import { Route, Routes } from '@angular/router';
import { appConfig } from './app.config';
import { appRoutes } from './app.routes';

/**
 * Remote entry point for federation.
 *
 * Exposes routes, providers, and a renderComponent function that the host can use
 * to render example components using this remote's Angular instance.
 */

// Export routes for reference (mainly for route discovery)
export const routes: Routes = appRoutes;

// Export providers for DI isolation
export const providers: (Provider | EnvironmentProviders)[] = appConfig.providers;

interface RouteMatch {
  component: Type<unknown>;
  data?: Record<string, unknown>;
}

// Cached ApplicationRef - shared across all components from this remote
let cachedAppRef: ApplicationRef | null = null;
let appRefPromise: Promise<ApplicationRef> | null = null;
const mountedComponents = new Set<ComponentRef<unknown>>();

/**
 * Gets or creates a shared Angular application instance.
 * Uses a promise to handle concurrent initialization requests.
 */
async function getOrCreateAppRef(): Promise<ApplicationRef> {
  if (cachedAppRef) {
    return cachedAppRef;
  }

  if (appRefPromise) {
    return appRefPromise;
  }

  appRefPromise = (async () => {
    const { createApplication } = await import('@angular/platform-browser');
    cachedAppRef = await createApplication({
      providers: [...providers],
    });
    return cachedAppRef;
  })();

  return appRefPromise;
}

/**
 * Renders a component into a container element using this remote's Angular runtime.
 * This avoids injection context issues when host and remote use different Angular instances.
 * Components share a single ApplicationRef for better performance.
 */
export async function renderComponent(container: HTMLElement, examplePath: string, inputs?: Record<string, unknown>): Promise<() => void> {
  const match = await findComponentForPath(routes, examplePath);

  if (!match) {
    throw new Error(`Component for path "${examplePath}" not found in remote`);
  }

  const appRef = await getOrCreateAppRef();

  const componentRef = createComponent(match.component, {
    environmentInjector: appRef.injector,
    hostElement: container,
  });

  const allInputs = { ...match.data, ...inputs };

  for (const [key, value] of Object.entries(allInputs)) {
    componentRef.setInput(key, value);
  }

  appRef.attachView(componentRef.hostView);
  componentRef.changeDetectorRef.detectChanges();
  mountedComponents.add(componentRef);

  return () => {
    componentRef.destroy();
    mountedComponents.delete(componentRef);
  };
}

/**
 * Finds a component type and its route data for a given example path by traversing routes.
 */
async function findComponentForPath(routeList: Route[], path: string): Promise<RouteMatch | null> {
  for (const route of routeList) {
    // Check if this is the 'examples' route with loadChildren
    if (route.path === 'examples' && route.loadChildren) {
      const childModule = await route.loadChildren();
      const childRoutes = Array.isArray(childModule) ? childModule : (childModule as { default: Route[] }).default;

      const found = await searchRoutes(childRoutes, path);
      if (found) return found;
    }

    // Direct match with eager component
    if (route.path === path && route.component) {
      return { component: route.component, data: route.data as Record<string, unknown> };
    }

    // Direct match with lazy component
    if (route.path === path && route.loadComponent) {
      const loaded = await route.loadComponent();
      const component = typeof loaded === 'function' ? loaded : (loaded as { default: Type<unknown> }).default;
      return { component, data: route.data as Record<string, unknown> };
    }

    // Check children
    if (route.children) {
      const found = await searchRoutes(route.children, path);
      if (found) return found;
    }
  }

  return null;
}

async function searchRoutes(routeList: Route[], path: string): Promise<RouteMatch | null> {
  for (const route of routeList) {
    // Direct match with eager component
    if (route.path === path && route.component) {
      return { component: route.component, data: route.data as Record<string, unknown> };
    }

    // Direct match with lazy component
    if (route.path === path && route.loadComponent) {
      const loaded = await route.loadComponent();
      const component = typeof loaded === 'function' ? loaded : (loaded as { default: Type<unknown> }).default;
      return { component, data: route.data as Record<string, unknown> };
    }

    // Recursively check children
    if (route.children) {
      const found = await searchRoutes(route.children, path);
      if (found) return found;
    }
  }

  return null;
}
