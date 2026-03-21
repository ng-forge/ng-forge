import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { DefaultUrlSerializer, Router, UrlSegment, UrlTree } from '@angular/router';
import { contentRedirectGuard } from './content-redirect.guard';

const serializer = new DefaultUrlSerializer();

/**
 * Build a minimal ActivatedRouteSnapshot-like object that satisfies
 * what contentRedirectGuard reads: pathFromRoot (with url segments)
 * and paramMap on the second entry (index 1) for the adapter name.
 */
function buildRouteSnapshot(adapter: string, slugSegments: string[]) {
  const adapterEntry = {
    url: [new UrlSegment(adapter, {})],
    paramMap: {
      get: (key: string) => (key === 'adapter' ? adapter : null),
      has: (key: string) => key === 'adapter',
      getAll: () => [],
      keys: ['adapter'],
    },
  };

  const slugEntries = slugSegments.map((seg) => ({
    url: [new UrlSegment(seg, {})],
    paramMap: { get: () => null, has: () => false, getAll: () => [], keys: [] },
  }));

  const root = {
    url: [] as UrlSegment[],
    paramMap: { get: () => null, has: () => false, getAll: () => [], keys: [] },
  };

  return { pathFromRoot: [root, adapterEntry, ...slugEntries] } as unknown as Parameters<typeof contentRedirectGuard>[0];
}

function createMockRouter(): Partial<Router> {
  return {
    parseUrl: (url: string) => serializer.parse(url),
  };
}

describe('contentRedirectGuard', () => {
  let injector: Injector;

  beforeEach(() => {
    injector = Injector.create({
      providers: [{ provide: Router, useValue: createMockRouter() }],
    });
  });

  function runGuard(adapter: string, slugSegments: string[]): boolean | UrlTree {
    const route = buildRouteSnapshot(adapter, slugSegments);
    return runInInjectionContext(injector, () => contentRedirectGuard(route, {} as never)) as boolean | UrlTree;
  }

  // ── Category redirects ──

  describe('CATEGORY_REDIRECTS', () => {
    it('should redirect "field-types" to "field-types/text-inputs"', () => {
      const result = runGuard('material', ['field-types']);
      expect(result.toString()).toBe('/material/field-types/text-inputs');
    });

    it('should redirect "validation" to "validation/basics"', () => {
      const result = runGuard('material', ['validation']);
      expect(result.toString()).toBe('/material/validation/basics');
    });

    it('should redirect "schema-validation" to "schema-validation/overview"', () => {
      const result = runGuard('bootstrap', ['schema-validation']);
      expect(result.toString()).toBe('/bootstrap/schema-validation/overview');
    });

    it('should redirect "dynamic-behavior" to "dynamic-behavior/conditional-logic"', () => {
      const result = runGuard('primeng', ['dynamic-behavior']);
      expect(result.toString()).toBe('/primeng/dynamic-behavior/conditional-logic');
    });

    it('should redirect "dynamic-behavior/derivation" to "dynamic-behavior/derivation/values"', () => {
      const result = runGuard('ionic', ['dynamic-behavior', 'derivation']);
      expect(result.toString()).toBe('/ionic/dynamic-behavior/derivation/values');
    });

    it('should redirect "dynamic-behavior/value-derivation" to "dynamic-behavior/derivation/values"', () => {
      const result = runGuard('material', ['dynamic-behavior', 'value-derivation']);
      expect(result.toString()).toBe('/material/dynamic-behavior/derivation/values');
    });

    it('should redirect "prebuilt" to "prebuilt/form-groups"', () => {
      const result = runGuard('material', ['prebuilt']);
      expect(result.toString()).toBe('/material/prebuilt/form-groups');
    });

    it('should redirect "prebuilt/form-arrays" to "prebuilt/form-arrays/simplified"', () => {
      const result = runGuard('material', ['prebuilt', 'form-arrays']);
      expect(result.toString()).toBe('/material/prebuilt/form-arrays/simplified');
    });

    it('should redirect "recipes" to "recipes/custom-fields"', () => {
      const result = runGuard('material', ['recipes']);
      expect(result.toString()).toBe('/material/recipes/custom-fields');
    });
  });

  // ── Route renames ──

  describe('ROUTE_RENAMES', () => {
    it('should redirect "installation" to "getting-started"', () => {
      const result = runGuard('material', ['installation']);
      expect(result.toString()).toBe('/material/getting-started');
    });

    it('should redirect "ui-libs-integrations" to "configuration"', () => {
      const result = runGuard('material', ['ui-libs-integrations']);
      expect(result.toString()).toBe('/material/configuration');
    });

    it('should redirect "custom-integrations" to "building-an-adapter"', () => {
      const result = runGuard('bootstrap', ['custom-integrations']);
      expect(result.toString()).toBe('/bootstrap/building-an-adapter');
    });

    it('should redirect "api" to "api-reference"', () => {
      const result = runGuard('primeng', ['api']);
      expect(result.toString()).toBe('/primeng/api-reference');
    });

    it('should redirect "ui-libs-integrations/material" to "configuration"', () => {
      const result = runGuard('material', ['ui-libs-integrations', 'material']);
      expect(result.toString()).toBe('/material/configuration');
    });

    it('should redirect "ui-libs-integrations/bootstrap" to "configuration"', () => {
      const result = runGuard('material', ['ui-libs-integrations', 'bootstrap']);
      expect(result.toString()).toBe('/material/configuration');
    });

    it('should redirect "ui-libs-integrations/primeng" to "configuration"', () => {
      const result = runGuard('material', ['ui-libs-integrations', 'primeng']);
      expect(result.toString()).toBe('/material/configuration');
    });

    it('should redirect "ui-libs-integrations/ionic" to "configuration"', () => {
      const result = runGuard('material', ['ui-libs-integrations', 'ionic']);
      expect(result.toString()).toBe('/material/configuration');
    });

    it('should redirect "schema-fields" to "field-types/text-inputs"', () => {
      const result = runGuard('material', ['schema-fields']);
      expect(result.toString()).toBe('/material/field-types/text-inputs');
    });

    it('should redirect "schema-fields/field-types" to "field-types/text-inputs"', () => {
      const result = runGuard('material', ['schema-fields', 'field-types']);
      expect(result.toString()).toBe('/material/field-types/text-inputs');
    });

    it('should redirect "schema-fields/field-types/text-inputs" to "field-types/text-inputs"', () => {
      const result = runGuard('material', ['schema-fields', 'field-types', 'text-inputs']);
      expect(result.toString()).toBe('/material/field-types/text-inputs');
    });

    it('should redirect "schema-fields/field-types/selection" to "field-types/selection"', () => {
      const result = runGuard('ionic', ['schema-fields', 'field-types', 'selection']);
      expect(result.toString()).toBe('/ionic/field-types/selection');
    });

    it('should redirect "schema-fields/field-types/buttons" to "field-types/buttons"', () => {
      const result = runGuard('material', ['schema-fields', 'field-types', 'buttons']);
      expect(result.toString()).toBe('/material/field-types/buttons');
    });

    it('should redirect "schema-fields/field-types/utility" to "field-types/utility"', () => {
      const result = runGuard('material', ['schema-fields', 'field-types', 'utility']);
      expect(result.toString()).toBe('/material/field-types/utility');
    });

    it('should redirect "schema-fields/field-types/advanced-controls" to "field-types/advanced-controls"', () => {
      const result = runGuard('material', ['schema-fields', 'field-types', 'advanced-controls']);
      expect(result.toString()).toBe('/material/field-types/advanced-controls');
    });

    it('should redirect "dynamic-behavior/overview" to "dynamic-behavior/conditional-logic"', () => {
      const result = runGuard('material', ['dynamic-behavior', 'overview']);
      expect(result.toString()).toBe('/material/dynamic-behavior/conditional-logic');
    });

    it('should redirect "advanced/basics" to "recipes/type-safety"', () => {
      const result = runGuard('material', ['advanced', 'basics']);
      expect(result.toString()).toBe('/material/recipes/type-safety');
    });

    it('should redirect "advanced/custom-integrations" to "building-an-adapter"', () => {
      const result = runGuard('material', ['advanced', 'custom-integrations']);
      expect(result.toString()).toBe('/material/building-an-adapter');
    });

    it('should redirect "advanced" to "recipes/custom-fields"', () => {
      const result = runGuard('material', ['advanced']);
      expect(result.toString()).toBe('/material/recipes/custom-fields');
    });

    it('should redirect "advanced/custom-fields" to "recipes/custom-fields"', () => {
      const result = runGuard('material', ['advanced', 'custom-fields']);
      expect(result.toString()).toBe('/material/recipes/custom-fields');
    });

    it('should redirect "advanced/events" to "recipes/events"', () => {
      const result = runGuard('material', ['advanced', 'events']);
      expect(result.toString()).toBe('/material/recipes/events');
    });
  });

  // ── Adapter prefix preservation ──

  describe('adapter prefix preservation', () => {
    it('should use the adapter from route params in category redirects', () => {
      const result = runGuard('ionic', ['field-types']);
      expect(result.toString()).toBe('/ionic/field-types/text-inputs');
    });

    it('should use the adapter from route params in route renames', () => {
      const result = runGuard('custom', ['installation']);
      expect(result.toString()).toBe('/custom/getting-started');
    });

    it('should use bootstrap adapter in redirect URL', () => {
      const result = runGuard('bootstrap', ['recipes']);
      expect(result.toString()).toBe('/bootstrap/recipes/custom-fields');
    });
  });

  // ── Non-matching slugs ──

  describe('non-matching slugs', () => {
    it('should return true for a known leaf page', () => {
      const result = runGuard('material', ['getting-started']);
      expect(result).toBe(true);
    });

    it('should return true for an unknown path', () => {
      const result = runGuard('material', ['some', 'random', 'path']);
      expect(result).toBe(true);
    });

    it('should return true for an empty slug (adapter root)', () => {
      const result = runGuard('material', []);
      expect(result).toBe(true);
    });

    it('should return true for a leaf page under a known category', () => {
      const result = runGuard('material', ['field-types', 'text-inputs']);
      expect(result).toBe(true);
    });
  });

  // ── Priority: category redirects before renames ──

  describe('priority', () => {
    it('should match category redirects before checking renames', () => {
      const result = runGuard('material', ['dynamic-behavior']);
      expect(result.toString()).toBe('/material/dynamic-behavior/conditional-logic');
    });
  });

  // ── Default adapter fallback ──

  describe('default adapter fallback', () => {
    it('should fall back to "material" when adapter segment has no paramMap entry', () => {
      const root = {
        url: [] as UrlSegment[],
        paramMap: { get: () => null, has: () => false, getAll: () => [], keys: [] },
      };
      const adapterEntry = {
        url: [new UrlSegment('material', {})],
        paramMap: { get: () => null, has: () => false, getAll: () => [], keys: [] },
      };
      const slugEntry = {
        url: [new UrlSegment('field-types', {})],
        paramMap: { get: () => null, has: () => false, getAll: () => [], keys: [] },
      };
      const route = {
        pathFromRoot: [root, adapterEntry, slugEntry],
      } as unknown as Parameters<typeof contentRedirectGuard>[0];

      const result = runInInjectionContext(injector, () => contentRedirectGuard(route, {} as never)) as UrlTree;
      expect(result.toString()).toBe('/material/field-types/text-inputs');
    });
  });
});
