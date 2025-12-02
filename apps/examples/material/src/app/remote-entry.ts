import { createComponent, EnvironmentProviders, Provider, Type } from '@angular/core';
import { Route, Routes } from '@angular/router';
import { appConfig } from './app.config';
import appRoutes from './app.routes';

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

/**
 * Renders a component into a container element using this remote's Angular runtime.
 * This avoids injection context issues when host and remote use different Angular instances.
 */
export async function renderComponent(container: HTMLElement, examplePath: string, inputs?: Record<string, unknown>): Promise<() => void> {
  // Find the component and route data for the given path
  const match = await findComponentForPath(routes, examplePath);

  if (!match) {
    throw new Error(`Component for path "${examplePath}" not found in remote`);
  }

  // Create an Angular application with the remote's providers
  const { createApplication } = await import('@angular/platform-browser');

  const appRef = await createApplication({
    providers: [...providers],
  });

  // Create the component using the remote's Angular
  const componentRef = createComponent(match.component, {
    environmentInjector: appRef.injector,
    hostElement: container,
  });

  // Merge route data with explicit inputs (explicit inputs take precedence)
  const allInputs = { ...match.data, ...inputs };

  // Set inputs (including route data as inputs)
  for (const [key, value] of Object.entries(allInputs)) {
    componentRef.setInput(key, value);
  }

  // Attach to ApplicationRef for change detection
  appRef.attachView(componentRef.hostView);

  // Trigger change detection for zoneless mode
  componentRef.changeDetectorRef.detectChanges();

  // Return cleanup function
  return () => {
    componentRef.destroy();
    appRef.destroy();
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

    // Check if this is the 'test' route with loadChildren
    if (route.path === 'test' && route.loadChildren) {
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
