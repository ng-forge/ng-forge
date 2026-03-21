import '@angular/compiler';
import { Injector, PLATFORM_ID, runInInjectionContext, signal } from '@angular/core';
import { Router, UrlSerializer } from '@angular/router';
import { ActiveAdapterService } from '../services/active-adapter.service';
import { ThemeService, ThemeType } from '../services/theme.service';
import { DocsLayoutComponent } from './docs-layout.component';

/**
 * Create a DocsLayoutComponent instance with mocked dependencies.
 * Uses manual DI (same pattern as api.service.spec.ts) to avoid TestBed
 * complexity with template compilation and child component resolution.
 */
function setup(opts: { adapter?: string; url?: string } = {}) {
  const { adapter = 'material', url = '/material/getting-started' } = opts;

  const adapterSignal = signal(adapter);
  const mockAdapter = { adapter: adapterSignal } as unknown as ActiveAdapterService;

  const themeSignal = signal<ThemeType>('auto');
  const mockTheme = {
    theme: themeSignal,
    isDark: signal(false),
    toggleTheme: vi.fn(),
  } as unknown as ThemeService;

  // Minimal Router mock: provide url, lastSuccessfulNavigation, and serializeUrl.
  const urlSerializer = new (class extends UrlSerializer {
    parse(u: string) {
      return { toString: () => u } as any;
    }
    serialize(tree: any) {
      return tree?.toString() ?? '';
    }
  })();

  const navigationSignal = signal<any>(null);
  const mockRouter = {
    url,
    lastSuccessfulNavigation: navigationSignal,
    serializeUrl: (tree: any) => urlSerializer.serialize(tree),
    events: { subscribe: () => ({ unsubscribe: () => void 0 }) },
  } as unknown as Router;

  function navigate(newUrl: string): void {
    (mockRouter as any).url = newUrl;
    navigationSignal.set({
      finalUrl: { toString: () => newUrl },
      extractedUrl: { toString: () => newUrl },
    });
  }

  // Set initial navigation so currentUrl computed picks up the URL.
  navigate(url);

  const injector = Injector.create({
    providers: [
      { provide: PLATFORM_ID, useValue: 'browser' },
      { provide: Router, useValue: mockRouter },
      { provide: ActiveAdapterService, useValue: mockAdapter },
      { provide: ThemeService, useValue: mockTheme },
    ],
  });

  const component = runInInjectionContext(injector, () => {
    return new (DocsLayoutComponent as unknown as new () => DocsLayoutComponent)();
  });

  return { component, adapterSignal, themeSignal, mockTheme, navigate };
}

/** Helper to access protected/private members via any cast. */
function priv(component: DocsLayoutComponent): any {
  return component as any;
}

describe('DocsLayoutComponent', () => {
  it('should create successfully', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  // ─── navItems filtering ──────────────────────────────────────────────

  describe('navItems', () => {
    it('should filter out custom-only items when adapter is not "custom"', () => {
      const { component } = setup({ adapter: 'material' });
      const items = priv(component).navItems();
      const customOnly = items.find((i: any) => i.cssClass === 'sidebar-link--custom-only');
      expect(customOnly).toBeUndefined();
    });

    it('should include custom-only items when adapter is "custom"', () => {
      const { component } = setup({ adapter: 'custom' });
      const items = priv(component).navItems();
      const customOnly = items.find((i: any) => i.cssClass === 'sidebar-link--custom-only');
      expect(customOnly).toBeDefined();
      expect(customOnly.label).toBe('Building an Adapter');
    });

    it('should include non-custom items regardless of adapter', () => {
      const { component } = setup({ adapter: 'bootstrap' });
      const items = priv(component).navItems();
      const gettingStarted = items.find((i: any) => i.path === 'getting-started');
      expect(gettingStarted).toBeDefined();
    });

    it('should hide not-custom items (Examples) when adapter is "custom"', () => {
      const { component } = setup({ adapter: 'custom' });
      const items = priv(component).navItems();
      const examples = items.find((i: any) => i.path === 'examples');
      expect(examples).toBeUndefined();
    });

    it('should show not-custom items (Examples) for non-custom adapters', () => {
      const { component } = setup({ adapter: 'primeng' });
      const items = priv(component).navItems();
      const examples = items.find((i: any) => i.path === 'examples');
      expect(examples).toBeDefined();
    });

    it('should reactively update when adapter changes', () => {
      const { component, adapterSignal } = setup({ adapter: 'material' });
      expect(
        priv(component)
          .navItems()
          .find((i: any) => i.cssClass === 'sidebar-link--custom-only'),
      ).toBeUndefined();

      adapterSignal.set('custom');
      expect(
        priv(component)
          .navItems()
          .find((i: any) => i.cssClass === 'sidebar-link--custom-only'),
      ).toBeDefined();
    });
  });

  // ─── toggleSidebar ───────────────────────────────────────────────────

  describe('toggleSidebar', () => {
    it('should toggle sidebarOpen signal', () => {
      const { component } = setup();
      expect(priv(component).sidebarOpen()).toBe(false);
      priv(component).toggleSidebar();
      expect(priv(component).sidebarOpen()).toBe(true);
      priv(component).toggleSidebar();
      expect(priv(component).sidebarOpen()).toBe(false);
    });
  });

  // ─── closeSidebar ────────────────────────────────────────────────────

  describe('closeSidebar', () => {
    it('should set sidebarOpen to false', () => {
      const { component } = setup();
      priv(component).sidebarOpen.set(true);
      expect(priv(component).sidebarOpen()).toBe(true);
      priv(component).closeSidebar();
      expect(priv(component).sidebarOpen()).toBe(false);
    });

    it('should remain false if already closed', () => {
      const { component } = setup();
      priv(component).closeSidebar();
      expect(priv(component).sidebarOpen()).toBe(false);
    });
  });

  // ─── toggleCategory ──────────────────────────────────────────────────

  describe('toggleCategory', () => {
    it('should expand a collapsed category', () => {
      const { component } = setup({ url: '/material/getting-started' });
      const path = 'field-types';
      // field-types is not URL-matched, so initially collapsed
      expect(priv(component).isCategoryExpanded({ path, children: [{}] })).toBe(false);
      priv(component).toggleCategory(path);
      expect(priv(component).isCategoryExpanded({ path, children: [{}] })).toBe(true);
    });

    it('should collapse an expanded category', () => {
      const { component } = setup({ url: '/material/getting-started' });
      const path = 'field-types';
      priv(component).toggleCategory(path);
      expect(priv(component).isCategoryExpanded({ path, children: [{}] })).toBe(true);
      priv(component).toggleCategory(path);
      expect(priv(component).isCategoryExpanded({ path, children: [{}] })).toBe(false);
    });

    it('should collapse sibling top-level categories when expanding one', () => {
      const { component } = setup({ url: '/material/getting-started' });
      priv(component).toggleCategory('field-types');
      expect(priv(component).isCategoryExpanded({ path: 'field-types', children: [{}] })).toBe(true);

      // Expanding validation should collapse field-types (sibling top-level)
      priv(component).toggleCategory('validation');
      expect(priv(component).isCategoryExpanded({ path: 'validation', children: [{}] })).toBe(true);
      expect(priv(component).isCategoryExpanded({ path: 'field-types', children: [{}] })).toBe(false);
    });
  });

  // ─── isCategoryExpanded ──────────────────────────────────────────────

  describe('isCategoryExpanded', () => {
    it('should return false for non-category items (no children)', () => {
      const { component } = setup();
      // Items without children are not walked in expandedState, so map.get returns undefined → false
      expect(priv(component).isCategoryExpanded({ path: 'getting-started' })).toBe(false);
    });

    it('should auto-expand based on URL match', () => {
      const { component } = setup({ url: '/material/field-types/text-inputs' });
      // The "field-types" category path should be auto-expanded because
      // the URL starts with /material/field-types
      expect(priv(component).isCategoryExpanded({ path: 'field-types', children: [{}] })).toBe(true);
    });

    it('should respect user-collapsed override', () => {
      const { component } = setup({ url: '/material/field-types/text-inputs' });
      // Auto-expanded from URL match
      expect(priv(component).isCategoryExpanded({ path: 'field-types', children: [{}] })).toBe(true);

      // User collapses it explicitly
      priv(component).toggleCategory('field-types');
      expect(priv(component).isCategoryExpanded({ path: 'field-types', children: [{}] })).toBe(false);
    });

    it('should not auto-expand categories that do not match the URL', () => {
      const { component } = setup({ url: '/material/getting-started' });
      expect(priv(component).isCategoryExpanded({ path: 'validation', children: [{}] })).toBe(false);
      expect(priv(component).isCategoryExpanded({ path: 'advanced', children: [{}] })).toBe(false);
    });
  });

  // ─── isActiveCategory ────────────────────────────────────────────────

  describe('isActiveCategory', () => {
    it('should return true when URL matches the category path', () => {
      const { component } = setup({ url: '/material/validation/basics' });
      expect(priv(component).isActiveCategory({ path: 'validation', children: [{}] })).toBe(true);
    });

    it('should return false when URL does not match', () => {
      const { component } = setup({ url: '/material/getting-started' });
      expect(priv(component).isActiveCategory({ path: 'validation', children: [{}] })).toBe(false);
    });

    it('should reflect the adapter in URL matching', () => {
      const { component } = setup({ adapter: 'bootstrap', url: '/bootstrap/field-types/text-inputs' });
      expect(priv(component).isActiveCategory({ path: 'field-types', children: [{}] })).toBe(true);
    });
  });

  // ─── adapterLink ─────────────────────────────────────────────────────

  describe('adapterLink', () => {
    it('should prepend the current adapter', () => {
      const { component } = setup({ adapter: 'material' });
      expect(priv(component).adapterLink('field-types/text-inputs')).toBe('/material/field-types/text-inputs');
    });

    it('should use the active adapter name', () => {
      const { component, adapterSignal } = setup({ adapter: 'bootstrap' });
      expect(priv(component).adapterLink('getting-started')).toBe('/bootstrap/getting-started');

      adapterSignal.set('primeng');
      expect(priv(component).adapterLink('getting-started')).toBe('/primeng/getting-started');
    });

    it('should handle root path', () => {
      const { component } = setup({ adapter: 'ionic' });
      expect(priv(component).adapterLink('getting-started')).toBe('/ionic/getting-started');
    });
  });
});
