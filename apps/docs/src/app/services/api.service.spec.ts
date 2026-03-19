import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APP_BASE_HREF } from '@angular/common';
import { of, throwError } from 'rxjs';
import { getKindMeta, groupByKind, ApiService, ApiDeclaration, ApiPackage, DeclarationKind } from './api.service';

// ─── Pure function tests ──────────────────────────────────────────────────────

describe('getKindMeta', () => {
  it('should return correct metadata for "class"', () => {
    const meta = getKindMeta('class');
    expect(meta.label).toBe('Class');
    expect(meta.pluralLabel).toBe('Classes');
    expect(meta.cssClass).toBe('kind--class');
  });

  it('should return correct metadata for "component"', () => {
    const meta = getKindMeta('component');
    expect(meta.label).toBe('Component');
    expect(meta.pluralLabel).toBe('Components');
    expect(meta.cssClass).toBe('kind--component');
  });

  it('should return correct metadata for each kind', () => {
    const kinds: DeclarationKind[] = [
      'class',
      'interface',
      'type',
      'function',
      'const',
      'enum',
      'component',
      'directive',
      'injectable',
      'pipe',
    ];
    for (const kind of kinds) {
      const meta = getKindMeta(kind);
      expect(meta).toBeDefined();
      expect(meta.label).toBeTruthy();
      expect(meta.pluralLabel).toBeTruthy();
      expect(meta.cssClass).toBeTruthy();
    }
  });
});

describe('groupByKind', () => {
  function makeDecl(name: string, kind: DeclarationKind): ApiDeclaration {
    return { name, kind } as ApiDeclaration;
  }

  it('should group declarations by kind in display order', () => {
    const declarations = [
      makeDecl('MyFunc', 'function'),
      makeDecl('MyClass', 'class'),
      makeDecl('MyComp', 'component'),
      makeDecl('MyInterface', 'interface'),
    ];
    const groups = groupByKind(declarations);

    expect(groups[0].kind).toBe('component');
    expect(groups[0].items).toEqual([declarations[2]]);
    expect(groups[1].kind).toBe('class');
    expect(groups[1].items).toEqual([declarations[1]]);
    expect(groups[2].kind).toBe('interface');
    expect(groups[2].items).toEqual([declarations[3]]);
    expect(groups[3].kind).toBe('function');
    expect(groups[3].items).toEqual([declarations[0]]);
  });

  it('should omit kinds with no items', () => {
    const declarations = [makeDecl('MyFunc', 'function')];
    const groups = groupByKind(declarations);
    expect(groups).toHaveLength(1);
    expect(groups[0].kind).toBe('function');
  });

  it('should handle an empty array', () => {
    const groups = groupByKind([]);
    expect(groups).toEqual([]);
  });

  it('should include meta for each group', () => {
    const declarations = [makeDecl('MyEnum', 'enum')];
    const groups = groupByKind(declarations);
    expect(groups[0].meta.label).toBe('Enum');
    expect(groups[0].meta.pluralLabel).toBe('Enums');
  });
});

// ─── ApiService tests (manual DI — avoids TestBed initTestEnvironment conflict) ───

/**
 * Create an ApiService instance with a mock HttpClient injected manually.
 * This avoids the BrowserTestingModule conflict in the test-setup.
 */
function createApiService(httpMock: Partial<HttpClient>, baseHref = '/'): ApiService {
  const injector = Injector.create({
    providers: [
      { provide: HttpClient, useValue: httpMock },
      { provide: 'APP_BASE_HREF_TOKEN', useValue: baseHref },
    ],
  });
  // ApiService uses inject() so we need an injection context.
  // We create the service manually since it's providedIn: 'root'.
  return runInInjectionContext(injector, () => {
    // Manually construct ApiService-like behavior by calling the class.
    // Since inject() needs to resolve HttpClient and APP_BASE_HREF,
    // we need to provide them through a proper injector.
    return new (ApiService as unknown as new () => ApiService)();
  });
}

describe('ApiService', () => {
  // For methods that don't use HTTP, we can test with minimal setup
  describe('getAdapterPackageSlug', () => {
    let service: ApiService;

    beforeEach(() => {
      // ApiService reads APP_BASE_HREF optionally and HttpClient.
      // For non-HTTP tests, mock is sufficient.
      const injector = Injector.create({
        providers: [{ provide: HttpClient, useValue: {} }],
      });
      service = runInInjectionContext(injector, () => new (ApiService as unknown as new () => ApiService)());
    });

    it('should return correct slug for known adapters', () => {
      expect(service.getAdapterPackageSlug('material')).toBe('material');
      expect(service.getAdapterPackageSlug('bootstrap')).toBe('bootstrap');
      expect(service.getAdapterPackageSlug('primeng')).toBe('primeng');
      expect(service.getAdapterPackageSlug('ionic')).toBe('ionic');
    });

    it('should return undefined for "custom"', () => {
      expect(service.getAdapterPackageSlug('custom')).toBeUndefined();
    });

    it('should return undefined for unknown adapters', () => {
      expect(service.getAdapterPackageSlug('unknown')).toBeUndefined();
    });
  });

  describe('findSymbol', () => {
    let service: ApiService;

    beforeEach(() => {
      const injector = Injector.create({
        providers: [{ provide: HttpClient, useValue: {} }],
      });
      service = runInInjectionContext(injector, () => new (ApiService as unknown as new () => ApiService)());
    });

    const coreDecl = { name: 'FormConfig', kind: 'interface' } as ApiDeclaration;
    const adapterDecl = { name: 'MatInput', kind: 'component' } as ApiDeclaration;
    const corePkg: ApiPackage = { name: 'core', slug: 'core', declarations: [coreDecl] };
    const adapterPkg: ApiPackage = { name: 'material', slug: 'material', declarations: [adapterDecl] };

    it('should find a symbol in core first', () => {
      const result = service.findSymbol('FormConfig', corePkg, adapterPkg);
      expect(result).toBeDefined();
      expect(result!.pkg).toBe(corePkg);
      expect(result!.declaration).toBe(coreDecl);
    });

    it('should find a symbol in adapter when not in core', () => {
      const result = service.findSymbol('MatInput', corePkg, adapterPkg);
      expect(result).toBeDefined();
      expect(result!.pkg).toBe(adapterPkg);
      expect(result!.declaration).toBe(adapterDecl);
    });

    it('should return undefined when symbol is not found anywhere', () => {
      const result = service.findSymbol('NonExistent', corePkg, adapterPkg);
      expect(result).toBeUndefined();
    });

    it('should search core only when no adapter package is provided', () => {
      const result = service.findSymbol('MatInput', corePkg);
      expect(result).toBeUndefined();
    });

    it('should prefer core over adapter when symbol exists in both', () => {
      const sharedDecl = { name: 'Shared', kind: 'class' } as ApiDeclaration;
      const coreWithShared: ApiPackage = { name: 'core', slug: 'core', declarations: [sharedDecl] };
      const adapterWithShared: ApiPackage = {
        name: 'material',
        slug: 'material',
        declarations: [{ name: 'Shared', kind: 'function' } as ApiDeclaration],
      };
      const result = service.findSymbol('Shared', coreWithShared, adapterWithShared);
      expect(result!.pkg).toBe(coreWithShared);
      expect(result!.declaration).toBe(sharedDecl);
    });
  });

  describe('loadPackage', () => {
    it('should make an HTTP request and return the result', () => {
      const mockPkg: ApiPackage = { name: 'core', slug: 'core', declarations: [] };
      const httpMock = { get: vi.fn().mockReturnValue(of(mockPkg)) };
      const injector = Injector.create({
        providers: [{ provide: HttpClient, useValue: httpMock }],
      });
      const service = runInInjectionContext(injector, () => new (ApiService as unknown as new () => ApiService)());

      service.loadPackage('core').subscribe((pkg) => {
        expect(pkg).toEqual(mockPkg);
      });
      expect(httpMock.get).toHaveBeenCalledWith('/content/api/core.json');
    });

    it('should cache the result and return cached observable on second call', () => {
      const mockPkg: ApiPackage = { name: 'core', slug: 'core', declarations: [] };
      const httpMock = { get: vi.fn().mockReturnValue(of(mockPkg)) };
      const injector = Injector.create({
        providers: [{ provide: HttpClient, useValue: httpMock }],
      });
      const service = runInInjectionContext(injector, () => new (ApiService as unknown as new () => ApiService)());

      // First call
      service.loadPackage('core').subscribe();
      // Second call — should return cached
      service.loadPackage('core').subscribe((pkg) => {
        expect(pkg).toEqual(mockPkg);
      });
      // HTTP should only be called once
      expect(httpMock.get).toHaveBeenCalledTimes(1);
    });

    it('should return empty package on HTTP error', () => {
      const httpMock = { get: vi.fn().mockReturnValue(throwError(() => new Error('404'))) };
      const injector = Injector.create({
        providers: [{ provide: HttpClient, useValue: httpMock }],
      });
      const service = runInInjectionContext(injector, () => new (ApiService as unknown as new () => ApiService)());

      service.loadPackage('missing').subscribe((pkg) => {
        expect(pkg.name).toBe('missing');
        expect(pkg.slug).toBe('missing');
        expect(pkg.declarations).toEqual([]);
      });
    });
  });

  describe('loadManifest', () => {
    it('should make an HTTP request for the manifest', () => {
      const mockManifest = [{ name: 'core', slug: 'core', count: 10 }];
      const httpMock = { get: vi.fn().mockReturnValue(of(mockManifest)) };
      const injector = Injector.create({
        providers: [{ provide: HttpClient, useValue: httpMock }],
      });
      const service = runInInjectionContext(injector, () => new (ApiService as unknown as new () => ApiService)());

      service.loadManifest().subscribe((manifest) => {
        expect(manifest).toEqual(mockManifest);
      });
      expect(httpMock.get).toHaveBeenCalledWith('/content/api/manifest.json');
    });
  });
});
