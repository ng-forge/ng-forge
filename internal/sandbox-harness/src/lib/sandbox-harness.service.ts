import { createComponent, inject, Injectable, OnDestroy } from '@angular/core';
import { createApplication } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ADAPTER_REGISTRY } from './adapter-registry';
import { SandboxRefImpl } from './sandbox-ref';
import { AdapterName, AdapterRegistration, SandboxBootstrapOptions, SandboxRef } from './types';

const STYLESHEET_ID_PREFIX = 'sandbox-harness-style-';

@Injectable()
export class SandboxHarness implements OnDestroy {
  private readonly registry = inject<Map<AdapterName, AdapterRegistration>>(ADAPTER_REGISTRY);
  private readonly instances = new Map<string, SandboxRefImpl>();
  private activeStylesheetAdapter: AdapterName | null = null;

  async bootstrap(adapterName: AdapterName, container: HTMLElement, options?: SandboxBootstrapOptions): Promise<SandboxRef> {
    const registration = this.registry.get(adapterName);
    if (!registration) {
      throw new Error(`[SandboxHarness] Adapter "${adapterName}" is not registered. Did you call provideAdapterRegistry()?`);
    }

    // Load routes eagerly so they're available synchronously to the router (as children, not loadChildren)
    const routes = await registration.loadRoutes();

    // Load adapter module (code-split) with pre-loaded routes
    const { config, rootComponent } = await registration.factory(routes);

    // Swap stylesheet before mounting
    this.swapStylesheet(registration);

    // Create the isolated sub-application
    const appRef = await createApplication(config);

    // Create host element and mount root component
    const hostElement = document.createElement('div');
    container.appendChild(hostElement);

    const componentRef = createComponent(rootComponent, {
      environmentInjector: appRef.injector,
      hostElement,
    });
    appRef.attachView(componentRef.hostView);

    // Manually trigger navigation after the router-outlet is in the DOM.
    // createApplication() runs APP_INITIALIZERs (including router init) before
    // the root component with <router-outlet> is attached, so we re-trigger here.
    const router = appRef.injector.get(Router);
    const initialUrl = options?.route ?? `/${registration.defaultRoute}`;
    await router.navigateByUrl(initialUrl);

    const instanceId = `${adapterName}-${Date.now()}`;
    const ref = new SandboxRefImpl(adapterName, appRef, router, container, () => {
      this.instances.delete(instanceId);
      if (this.activeStylesheetAdapter === adapterName) {
        this.removeStylesheet(adapterName);
        this.activeStylesheetAdapter = null;
      }
      this.cleanupThemeAttributes();
    });

    this.instances.set(instanceId, ref);
    return ref;
  }

  destroyAll(): void {
    for (const ref of this.instances.values()) {
      ref.destroy();
    }
  }

  ngOnDestroy(): void {
    this.destroyAll();
  }

  private swapStylesheet(registration: AdapterRegistration): void {
    if (this.activeStylesheetAdapter) {
      this.removeStylesheet(this.activeStylesheetAdapter);
    }

    const link = document.createElement('link');
    link.id = `${STYLESHEET_ID_PREFIX}${registration.name}`;
    link.rel = 'stylesheet';
    link.href = registration.stylesheetUrl;
    document.head.appendChild(link);

    this.activeStylesheetAdapter = registration.name;
  }

  private removeStylesheet(adapterName: AdapterName): void {
    document.getElementById(`${STYLESHEET_ID_PREFIX}${adapterName}`)?.remove();
  }

  private cleanupThemeAttributes(): void {
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-bs-theme');
  }
}
