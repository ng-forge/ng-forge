import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { DefaultUrlSerializer, Router, UrlTree } from '@angular/router';
import { adapterGuard } from './adapter.guard';

const serializer = new DefaultUrlSerializer();

function buildRouteSnapshot(adapter: string | null) {
  return {
    paramMap: {
      get: (key: string) => (key === 'adapter' ? adapter : null),
      has: (key: string) => key === 'adapter' && adapter !== null,
      getAll: () => [],
      keys: adapter ? ['adapter'] : [],
    },
  } as unknown as Parameters<typeof adapterGuard>[0];
}

describe('adapterGuard', () => {
  let injector: Injector;
  let mockRouter: { parseUrl: (url: string) => UrlTree; getCurrentNavigation: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockRouter = {
      parseUrl: (url: string) => serializer.parse(url),
      getCurrentNavigation: vi.fn().mockReturnValue(null),
    };
    injector = Injector.create({
      providers: [{ provide: Router, useValue: mockRouter }],
    });
  });

  function runGuard(adapter: string | null, currentUrl?: string): boolean | UrlTree {
    if (currentUrl) {
      const nav = { initialUrl: serializer.parse(currentUrl) };
      mockRouter.getCurrentNavigation.mockReturnValue(nav);
    } else {
      mockRouter.getCurrentNavigation.mockReturnValue(null);
    }
    const route = buildRouteSnapshot(adapter);
    return runInInjectionContext(injector, () => adapterGuard(route, {} as never)) as boolean | UrlTree;
  }

  // ── Valid adapters pass through ──

  describe('valid adapter names', () => {
    it.each(['material', 'bootstrap', 'primeng', 'ionic', 'custom'])('should return true for "%s"', (name) => {
      const result = runGuard(name);
      expect(result).toBe(true);
    });
  });

  // ── Invalid adapter redirects to /material ──

  describe('invalid adapter names', () => {
    it('should redirect an unknown adapter to /material preserving the rest of the URL', () => {
      const result = runGuard('unknown', '/unknown/getting-started');
      expect(result).not.toBe(true);
      expect((result as UrlTree).toString()).toBe('/material/getting-started');
    });

    it('should redirect a misspelled adapter to /material', () => {
      const result = runGuard('materail', '/materail/field-types/text-inputs');
      expect(result).not.toBe(true);
      expect((result as UrlTree).toString()).toBe('/material/field-types/text-inputs');
    });

    it('should redirect an empty-string adapter to /material', () => {
      const result = runGuard('', '/');
      expect(result).not.toBe(true);
      // The initialUrl '/' has no segment to strip, so withoutAdapter = '/' → '/material/'
      expect((result as UrlTree).toString()).toBe('/material/');
    });
  });

  // ── Null adapter ──

  describe('null adapter', () => {
    it('should redirect to /material when no current navigation exists', () => {
      const result = runGuard(null);
      // getCurrentNavigation() returns null, so fullUrl = '/null'
      // regex strips first segment → '' → /material
      expect(result).not.toBe(true);
      expect((result as UrlTree).toString()).toContain('/material');
    });

    it('should redirect to /material preserving path when navigation exists', () => {
      const result = runGuard(null, '/null/validation/basics');
      expect(result).not.toBe(true);
      expect((result as UrlTree).toString()).toBe('/material/validation/basics');
    });
  });

  // ── URL preservation ──

  describe('URL path preservation', () => {
    it('should preserve deeply nested paths after replacing the adapter', () => {
      const result = runGuard('bad', '/bad/dynamic-behavior/derivation/values');
      expect((result as UrlTree).toString()).toBe('/material/dynamic-behavior/derivation/values');
    });

    it('should handle a root-only invalid adapter URL', () => {
      const result = runGuard('bad', '/bad');
      expect((result as UrlTree).toString()).toBe('/material');
    });

    it('should preserve query params in the redirect', () => {
      const result = runGuard('bad', '/bad/page?tab=install');
      expect((result as UrlTree).toString()).toBe('/material/page?tab=install');
    });
  });
});
