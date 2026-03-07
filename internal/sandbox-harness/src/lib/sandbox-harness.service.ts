import { createComponent, inject, Injectable, OnDestroy, signal as reactiveSignal } from '@angular/core';
import { DOCUMENT, LocationStrategy } from '@angular/common';
import { createApplication, ɵSharedStylesHost as SharedStylesHost } from '@angular/platform-browser';
import { MemoryLocationStrategy } from './memory-location-strategy';
import { Router } from '@angular/router';
import { ADAPTER_REGISTRY } from './adapter-registry';
import { SandboxRefImpl } from './sandbox-ref';
import { AdapterName, AdapterRegistration, SANDBOX_FORM_CONFIG, SandboxBootstrapOptions, SandboxRef } from './types';
import { createDocumentProxy } from './document-proxy';
import { SandboxSlot } from './sandbox-slot';
import { SANDBOX_THEME } from './sandbox-theme';

const STYLESHEET_ID_PREFIX = 'sandbox-harness-style-';

@Injectable()
export class SandboxHarness implements OnDestroy {
  private readonly registry = inject<Map<AdapterName, AdapterRegistration>>(ADAPTER_REGISTRY);
  private readonly instances = new Map<string, SandboxRefImpl>();
  private activeStylesheetAdapter: AdapterName | null = null;
  private readonly cssCache = new Map<string, Promise<string>>();

  /**
   * Creates a {@link SandboxSlot} bound to the given container element.
   * The slot caches one sub-application per adapter and handles visibility toggling,
   * so switching adapters re-uses already-bootstrapped apps instead of re-creating them.
   */
  createSlot(container: HTMLElement, options?: SandboxBootstrapOptions): SandboxSlot {
    return new SandboxSlot(container, options ?? {}, (adapter, cont, opts, signal) => this.bootstrap(adapter, cont, opts, signal));
  }

  async bootstrap(
    adapterName: AdapterName,
    container: HTMLElement,
    options?: SandboxBootstrapOptions,
    signal?: AbortSignal,
  ): Promise<SandboxRef> {
    const registration = this.registry.get(adapterName);
    if (!registration) {
      throw new Error(`[SandboxHarness] Adapter "${adapterName}" is not registered. Did you call provideAdapterRegistry()?`);
    }

    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

    // Load routes eagerly so they're available synchronously to the router (as children, not loadChildren).
    // Append a wildcard redirect so unrecognised routes (e.g. a scenario that only exists in one adapter)
    // fall back to the adapter's defaultRoute instead of throwing NG04002.
    const routes = [...(await registration.loadRoutes()), { path: '**', redirectTo: registration.defaultRoute }];

    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

    // Load adapter module (code-split) with pre-loaded routes
    const { config: factoryConfig, rootComponent } = await registration.factory(routes);

    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

    // Override location strategy if requested (e.g. memory for docs embedded usage)
    let config =
      options?.locationStrategy === 'memory'
        ? {
            ...factoryConfig,
            providers: [...factoryConfig.providers, { provide: LocationStrategy, useClass: MemoryLocationStrategy }],
          }
        : factoryConfig;

    // Provide SANDBOX_FORM_CONFIG when a config is passed (used by the docs demo route)
    if (options?.config) {
      config = {
        ...config,
        providers: [...config.providers, { provide: SANDBOX_FORM_CONFIG, useValue: options.config }],
      };
    }

    const isScoped = options?.styleIsolation === 'scoped';

    // Resolves the effective theme, accounting for "auto" (system preference).
    // NgDoc sets data-theme="dark" | "auto" | null (absent = light).
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const resolveTheme = (): 'dark' | 'light' => {
      const raw = document.documentElement.getAttribute('data-theme');
      return raw === 'dark' || (raw === 'auto' && mediaQuery.matches) ? 'dark' : 'light';
    };

    // Reactive theme signal — kept in sync with document.documentElement[data-theme] by the
    // host application. Provided to the sub-app so embedded components (e.g. example-scenario)
    // can react to theme changes without needing their own DOM observation.
    const themeSignal = reactiveSignal<'dark' | 'light'>(resolveTheme());

    // Inject DOCUMENT proxy to intercept <style> elements added directly to document.head
    // by third-party libs (e.g. PrimeNG's providePrimeNG() injects .p-inputtext{…} and
    // :root{--p-xxx} rules directly into document.head, bypassing Angular's SharedStylesHost).
    // In scoped mode the proxy redirects these to the shadow root once it exists,
    // transforming global selectors (e.g. [data-theme='dark']) so they work inside shadow DOM.
    const addedStyles = new Set<HTMLStyleElement>();
    const shadowRootRef: { current: ShadowRoot | null } = { current: null };
    const styleTransform = isScoped ? (css: string) => this.transformCssForShadowDom(css) : undefined;
    const documentProxy = createDocumentProxy(document, (el) => addedStyles.add(el), shadowRootRef, styleTransform);
    config = {
      ...config,
      providers: [...config.providers, { provide: DOCUMENT, useValue: documentProxy }, { provide: SANDBOX_THEME, useValue: themeSignal }],
    };

    // Create the isolated sub-application
    const appRef = await createApplication(config);

    if (signal?.aborted) {
      appRef.destroy();
      throw new DOMException('Aborted', 'AbortError');
    }

    const hostElement = document.createElement('div');
    container.appendChild(hostElement);

    if (!isScoped) {
      // Default: inject stylesheet globally
      this.swapStylesheet(registration);
    }

    const componentRef = createComponent(rootComponent, {
      environmentInjector: appRef.injector,
      hostElement,
    });

    let shadowRoot: ShadowRoot | null = null;
    const cleanupFns: Array<() => void> = [];

    // Cleanup: remove any <style> elements that were injected into document.head
    cleanupFns.push(() => addedStyles.forEach((s) => s.remove()));

    if (isScoped) {
      // The root component uses ExperimentalIsolatedShadowDom, so Angular attaches
      // the shadow root to hostElement during createComponent().
      shadowRoot = hostElement.shadowRoot;

      if (shadowRoot) {
        // Activate the DOCUMENT proxy redirect: from this point forward, any style
        // elements that the sub-app injects into document.head (via the proxied DOCUMENT)
        // will be redirected to the shadow root directly.
        shadowRootRef.current = shadowRoot;

        // Retroactively move styles that were already leaked into document.head before
        // the shadow root was available (e.g. during createApplication / APP_INITIALIZERs).
        // DOM's appendChild() performs a move, so each style is automatically removed from
        // document.head and inserted into the shadow root. Transform CSS selectors first
        // so global selectors (e.g. [data-theme='dark']) work inside shadow DOM.
        for (const style of addedStyles) {
          style.textContent = this.transformCssForShadowDom(style.textContent ?? '');
          shadowRoot.appendChild(style);
        }

        // Redirect Angular's SharedStylesHost to inject component styles into the shadow root
        // instead of document.head. This must be done BEFORE attachView() and navigation,
        // because that's when Angular first renders components and injects their emulated styles.
        //
        // Angular's SharedStylesHost tracks style usage and manages injection via a `hosts` Set.
        // By default, `document.head` is the only host. We:
        //   1. Remove document.head from hosts → prevents any future injection into the docs page
        //   2. Add shadowRoot as a host → all component styles (from child components using
        //      ViewEncapsulation.Emulated) will be injected into the shadow root
        //
        // This is the canonical approach Angular itself uses for ViewEncapsulation.ShadowDom —
        // it calls sharedStylesHost.addHost(shadowRoot) in ShadowDomRenderer's constructor.
        const stylesHost = appRef.injector.get(SharedStylesHost);
        stylesHost.removeHost(document.head);
        stylesHost.addHost(shadowRoot);
        cleanupFns.push(() => stylesHost.removeHost(shadowRoot!));

        // Mirror data-theme from document.documentElement → shadow host so that
        // CSS selectors transformed to :host([data-theme='dark']) work correctly.
        // "auto" is resolved to the actual system preference so the host always
        // carries either data-theme="dark" or no attribute (= light).
        // Also updates the themeSignal provided to the sub-app so injected components
        // react to theme changes without their own DOM observation.
        const syncTheme = (): void => {
          const isDark = resolveTheme() === 'dark';
          themeSignal.set(isDark ? 'dark' : 'light');
          if (isDark) {
            hostElement.setAttribute('data-theme', 'dark');
          } else {
            hostElement.removeAttribute('data-theme');
          }
        };
        syncTheme();
        const themeObserver = new MutationObserver(syncTheme);
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        cleanupFns.push(() => themeObserver.disconnect());
        // Also react when the system preference changes while the user has "auto" selected.
        mediaQuery.addEventListener('change', syncTheme);
        cleanupFns.push(() => mediaQuery.removeEventListener('change', syncTheme));

        // Inject the adapter CSS bundle into the shadow root with selector transformation
        // so that html/body/:root selectors work inside shadow DOM.
        await this.injectIntoShadow(registration, shadowRoot, signal);

        if (signal?.aborted) {
          appRef.destroy();
          hostElement.remove();
          throw new DOMException('Aborted', 'AbortError');
        }
      }
    }

    // For non-scoped (global stylesheet) apps, the isScoped block never runs, so set up the
    // theme signal observer here where cleanupFns is already available.
    if (!isScoped) {
      const updateTheme = (): void => {
        themeSignal.set(resolveTheme());
      };
      const nonScopedThemeObserver = new MutationObserver(updateTheme);
      nonScopedThemeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
      cleanupFns.push(() => nonScopedThemeObserver.disconnect());
      mediaQuery.addEventListener('change', updateTheme);
      cleanupFns.push(() => mediaQuery.removeEventListener('change', updateTheme));
    }

    appRef.attachView(componentRef.hostView);

    // Manually trigger navigation after the router-outlet is in the DOM.
    // createApplication() runs APP_INITIALIZERs (including router init) before
    // the root component with <router-outlet> is attached, so we re-trigger here.
    const router = appRef.injector.get(Router);
    const initialUrl = options?.route ?? `/${registration.defaultRoute}`;
    await router.navigateByUrl(initialUrl);

    const instanceId = `${adapterName}-${Date.now()}`;
    const ref = new SandboxRefImpl(adapterName, appRef, router, hostElement, () => {
      this.instances.delete(instanceId);
      if (this.activeStylesheetAdapter === adapterName) {
        this.removeStylesheet(adapterName);
        this.activeStylesheetAdapter = null;
      }
      for (const fn of cleanupFns) fn();
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

  private async injectIntoShadow(registration: AdapterRegistration, shadowRoot: ShadowRoot, signal?: AbortSignal): Promise<void> {
    if (!this.cssCache.has(registration.stylesheetUrl)) {
      this.cssCache.set(
        registration.stylesheetUrl,
        fetch(registration.stylesheetUrl, { signal }).then((r) => r.text()),
      );
    }
    const rawCss = await this.cssCache.get(registration.stylesheetUrl)!;

    const style = document.createElement('style');
    style.id = `${STYLESHEET_ID_PREFIX}${registration.name}`;
    // Transform global selectors so they work inside the shadow root:
    // - html/body/:root → :host (the shadow host element)
    // - html[attr]/:root[attr] → :host([attr])
    // - html:not(...)/:root:not(...) → :host(:not(...))
    // This allows theme attributes (data-theme) set on the host to be picked up.
    style.textContent = this.transformCssForShadowDom(rawCss);
    shadowRoot.appendChild(style);
  }

  /**
   * Transforms a CSS bundle's global element selectors into :host equivalents
   * so that the stylesheet works correctly when injected into a shadow root.
   *
   * The transformations (applied in specificity order to avoid double-replacing):
   * 1. html:not([...]) / :root:not([...])  →  :host(:not([...]))
   * 2. html[...] / :root[...]              →  :host([...])
   * 3. bare html, body, :root              →  :host
   * 4. bare [data-theme=...]               →  :host([data-theme=...])
   *    Handles runtime-injected CSS (e.g. PrimeNG dark mode variables) that uses a
   *    standalone attribute selector rather than an html/body-prefixed one.
   *    The lookbehind excludes matches inside :host(...) to prevent double-transforms.
   */
  private transformCssForShadowDom(css: string): string {
    return (
      css
        // 1. html:not([...]) and :root:not([...])
        .replace(/(?:html|:root)(:not\([^)]+\))/g, ':host$1')
        // 2. html[...] and :root[...]
        .replace(/(?:html|:root)(\[[^\]]+\])/g, ':host($1)')
        // 3. bare html — guard against .html-class, [html], etc.
        .replace(/(?<![.#[\w-])html(?![.#[\w(-])/g, ':host')
        // 4. bare body — same guards
        .replace(/(?<![.#[\w-])body(?![.#[\w(-])/g, ':host')
        // 5. bare :root — avoid matching :root-something
        .replace(/:root(?![\w(-])/g, ':host')
        // 6. bare [data-theme=...] — not preceded by . # word-chars : - ( to avoid
        //    re-transforming :host([data-theme=...]) or .element[data-theme=...]
        .replace(/(?<![.#\w:\-(])\[data-theme([^\]]*)\]/g, ':host([data-theme$1])')
    );
  }

  private removeStylesheet(adapterName: AdapterName): void {
    document.getElementById(`${STYLESHEET_ID_PREFIX}${adapterName}`)?.remove();
  }
}
