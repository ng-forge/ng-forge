import { ApplicationRef, createComponent, inject, Injectable, OnDestroy, signal, WritableSignal } from '@angular/core';
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
  private readonly document = inject(DOCUMENT);
  private readonly instances = new Map<string, SandboxRefImpl>();
  private instanceCounter = 0;
  private activeStylesheetAdapter: AdapterName | null = null;
  private readonly cssCache = new Map<string, Promise<string>>();

  /**
   * Creates a {@link SandboxSlot} bound to the given container element.
   * The slot caches one sub-application per adapter and handles visibility toggling,
   * so switching adapters re-uses already-bootstrapped apps instead of re-creating them.
   */
  createSlot(container: HTMLElement, options?: SandboxBootstrapOptions): SandboxSlot {
    return new SandboxSlot(container, options ?? {}, (adapter, cont, opts, abortSignal) =>
      this.bootstrap(adapter, cont, opts, abortSignal),
    );
  }

  async bootstrap(
    adapterName: AdapterName,
    container: HTMLElement,
    options?: SandboxBootstrapOptions,
    abortSignal?: AbortSignal,
  ): Promise<SandboxRef> {
    const registration = this.registry.get(adapterName);
    if (!registration) {
      throw new Error(`[SandboxHarness] Adapter "${adapterName}" is not registered. Did you call provideAdapterRegistry()?`);
    }

    if (abortSignal?.aborted) throw new DOMException('Aborted', 'AbortError');

    // Load routes eagerly so they're available synchronously to the router (as children, not loadChildren).
    // Append a wildcard redirect so unrecognised routes (e.g. a scenario that only exists in one adapter)
    // fall back to the adapter's defaultRoute instead of throwing NG04002.
    const routes = [...(await registration.loadRoutes()), { path: '**', redirectTo: registration.defaultRoute }];

    if (abortSignal?.aborted) throw new DOMException('Aborted', 'AbortError');

    // Load adapter module (code-split) with pre-loaded routes.
    const { config: factoryConfig, rootComponent } = await registration.factory(routes);

    if (abortSignal?.aborted) throw new DOMException('Aborted', 'AbortError');

    // Override location strategy if requested (e.g. memory for docs embedded usage).
    let config =
      options?.locationStrategy === 'memory'
        ? {
            ...factoryConfig,
            providers: [...factoryConfig.providers, { provide: LocationStrategy, useClass: MemoryLocationStrategy }],
          }
        : factoryConfig;

    // Provide SANDBOX_FORM_CONFIG when a config is passed (used by the docs demo route).
    if (options?.config) {
      config = {
        ...config,
        providers: [...config.providers, { provide: SANDBOX_FORM_CONFIG, useValue: options.config }],
      };
    }

    const isScoped = options?.styleIsolation === 'scoped';

    // SSR-safe matchMedia: window may be undefined in Node.js environments.
    const mediaQuery = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null;

    // Resolves the effective theme, accounting for "auto" (system preference).
    // NgDoc sets data-theme="dark" | "auto" | null (absent = light).
    const resolveTheme = (): 'dark' | 'light' => {
      const raw = this.document.documentElement.getAttribute('data-theme');
      return raw === 'dark' || (raw === 'auto' && (mediaQuery?.matches ?? false)) ? 'dark' : 'light';
    };

    // Reactive theme signal — kept in sync with document.documentElement[data-theme] by the
    // host application. Provided to the sub-app so embedded components (e.g. example-scenario)
    // can react to theme changes without needing their own DOM observation.
    const themeSignal = signal<'dark' | 'light'>(resolveTheme());

    // Inject DOCUMENT proxy to intercept <style> elements added directly to document.head
    // by third-party libs (e.g. PrimeNG's providePrimeNG() injects .p-inputtext{…} and
    // :root{--p-xxx} rules directly into document.head, bypassing Angular's SharedStylesHost).
    // In scoped mode the proxy redirects these to the shadow root once it exists,
    // transforming global selectors (e.g. [data-theme='dark']) so they work inside shadow DOM.
    const addedStyles = new Set<HTMLStyleElement>();
    const shadowRootRef: { current: ShadowRoot | null } = { current: null };
    const styleTransform = isScoped ? (css: string) => this.transformCssForShadowDom(css) : undefined;
    const { proxy: documentProxy, cleanup: cleanupDocumentProxy } = createDocumentProxy(
      this.document,
      (el) => addedStyles.add(el),
      shadowRootRef,
      styleTransform,
    );
    config = {
      ...config,
      providers: [...config.providers, { provide: DOCUMENT, useValue: documentProxy }, { provide: SANDBOX_THEME, useValue: themeSignal }],
    };

    // Create the isolated sub-application.
    const appRef = await createApplication(config);

    if (abortSignal?.aborted) {
      appRef.destroy();
      throw new DOMException('Aborted', 'AbortError');
    }

    const hostElement = this.document.createElement('div');
    container.appendChild(hostElement);

    const cleanupFns: Array<() => void> = [cleanupDocumentProxy];
    cleanupFns.push(() => addedStyles.forEach((s) => s.remove()));

    if (!isScoped) {
      // Default: inject stylesheet globally.
      this.swapStylesheet(registration);
    }

    const componentRef = createComponent(rootComponent, {
      environmentInjector: appRef.injector,
      hostElement,
    });

    if (isScoped) {
      // The root component uses ExperimentalIsolatedShadowDom, so Angular attaches
      // the shadow root to hostElement during createComponent().
      const shadowRoot = hostElement.shadowRoot;
      if (shadowRoot) {
        shadowRootRef.current = shadowRoot;
        await this.applyStyleIsolation(
          appRef,
          shadowRoot,
          hostElement,
          registration,
          themeSignal,
          resolveTheme,
          mediaQuery,
          addedStyles,
          cleanupFns,
          abortSignal,
        );
        if (abortSignal?.aborted) {
          appRef.destroy();
          hostElement.remove();
          throw new DOMException('Aborted', 'AbortError');
        }
      }
    } else {
      // Non-scoped: keep themeSignal in sync without touching hostElement's attributes.
      this.setupThemeObserver(mediaQuery, () => themeSignal.set(resolveTheme()), cleanupFns);
    }

    appRef.attachView(componentRef.hostView);

    // Manually trigger navigation after the router-outlet is in the DOM.
    // createApplication() runs APP_INITIALIZERs (including router init) before
    // the root component with <router-outlet> is attached, so we re-trigger here.
    const router = appRef.injector.get(Router);
    const initialUrl = options?.route ?? `/${registration.defaultRoute}`;
    await router.navigateByUrl(initialUrl, { onSameUrlNavigation: 'reload' });

    const instanceId = `${adapterName}-${++this.instanceCounter}`;
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

  /**
   * Sets up shadow DOM style isolation: moves pre-creation styles, redirects Angular's
   * SharedStylesHost, syncs the data-theme attribute, and injects the adapter CSS bundle.
   */
  private async applyStyleIsolation(
    appRef: ApplicationRef,
    shadowRoot: ShadowRoot,
    hostElement: HTMLElement,
    registration: AdapterRegistration,
    themeSignal: WritableSignal<'dark' | 'light'>,
    resolveTheme: () => 'dark' | 'light',
    mediaQuery: MediaQueryList | null,
    addedStyles: Set<HTMLStyleElement>,
    cleanupFns: Array<() => void>,
    abortSignal?: AbortSignal,
  ): Promise<void> {
    // Retroactively move styles that leaked into document.head before the shadow root existed.
    for (const style of addedStyles) {
      style.textContent = this.transformCssForShadowDom(style.textContent ?? '');
      shadowRoot.appendChild(style);
    }

    // ɵSharedStylesHost is Angular-internal but is the canonical mechanism for redirecting
    // component emulated styles to a shadow root — the same API used by Angular's own
    // ShadowDomRenderer. We inject it to prevent sub-app styles from leaking into document.head.
    // If Angular removes this API, a MutationObserver-based style-mirroring fallback is needed.
    const stylesHost = appRef.injector.get(SharedStylesHost, null);
    if (!stylesHost) {
      console.warn(
        '[SandboxHarness] ɵSharedStylesHost not available — sub-app styles may leak into document.head. ' +
          'This can happen after an Angular version upgrade that removes the internal API.',
      );
    }
    if (stylesHost) {
      stylesHost.removeHost(this.document.head);
      stylesHost.addHost(shadowRoot);
      cleanupFns.push(() => stylesHost.removeHost(shadowRoot));
    }

    // Mirror data-theme from document.documentElement → shadow host so that
    // CSS selectors transformed to :host([data-theme='dark']) work correctly.
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
    this.setupThemeObserver(mediaQuery, syncTheme, cleanupFns);

    // Inject the adapter CSS bundle with selector transformation so html/body/:root work in shadow DOM.
    await this.injectIntoShadow(registration, shadowRoot, abortSignal);
  }

  /**
   * Observes the system colour-scheme media query and document.documentElement's data-theme
   * attribute, calling `update` whenever the effective theme changes.
   */
  private setupThemeObserver(mediaQuery: MediaQueryList | null, update: () => void, cleanupFns: Array<() => void>): void {
    const observer = new MutationObserver(update);
    observer.observe(this.document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    cleanupFns.push(() => observer.disconnect());
    if (mediaQuery) {
      mediaQuery.addEventListener('change', update);
      cleanupFns.push(() => mediaQuery.removeEventListener('change', update));
    }
  }

  private swapStylesheet(registration: AdapterRegistration): void {
    if (this.activeStylesheetAdapter) {
      this.removeStylesheet(this.activeStylesheetAdapter);
    }

    const link = this.document.createElement('link');
    link.id = `${STYLESHEET_ID_PREFIX}${registration.name}`;
    link.rel = 'stylesheet';
    link.href = registration.stylesheetUrl;
    this.document.head.appendChild(link);

    this.activeStylesheetAdapter = registration.name;
  }

  private async injectIntoShadow(registration: AdapterRegistration, shadowRoot: ShadowRoot, abortSignal?: AbortSignal): Promise<void> {
    if (!this.cssCache.has(registration.stylesheetUrl)) {
      const load = fetch(registration.stylesheetUrl, { signal: abortSignal })
        .then((r) => r.text())
        .catch((err) => {
          this.cssCache.delete(registration.stylesheetUrl);
          throw err;
        });
      this.cssCache.set(registration.stylesheetUrl, load);
    }
    const rawCss = await this.cssCache.get(registration.stylesheetUrl)!;

    const style = this.document.createElement('style');
    style.id = `${STYLESHEET_ID_PREFIX}${registration.name}`;
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
    this.document.getElementById(`${STYLESHEET_ID_PREFIX}${adapterName}`)?.remove();
  }
}
