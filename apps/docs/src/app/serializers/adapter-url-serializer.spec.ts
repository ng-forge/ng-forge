import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { AdapterAwareUrlSerializer } from './adapter-url-serializer';

function createMockDocument(pathname: string): Partial<Document> {
  return {
    location: { pathname } as Location,
  };
}

function createSerializer(pathname = '/material/getting-started'): AdapterAwareUrlSerializer {
  const injector = Injector.create({
    providers: [{ provide: DOCUMENT, useValue: createMockDocument(pathname) }],
  });
  return runInInjectionContext(injector, () => new AdapterAwareUrlSerializer());
}

describe('AdapterAwareUrlSerializer', () => {
  // ── URLs with valid adapter prefix are unchanged ──

  describe('URLs with valid adapter prefix', () => {
    it('should leave a /material URL unchanged', () => {
      const s = createSerializer();
      const tree = s.parse('/material/getting-started');
      expect(tree.toString()).toBe('/material/getting-started');
    });

    it('should leave a /bootstrap URL unchanged', () => {
      const s = createSerializer('/bootstrap/something');
      const tree = s.parse('/bootstrap/field-types');
      expect(tree.toString()).toBe('/bootstrap/field-types');
    });

    it('should leave a /primeng URL unchanged', () => {
      const s = createSerializer();
      const tree = s.parse('/primeng/validation/basics');
      expect(tree.toString()).toBe('/primeng/validation/basics');
    });

    it('should leave a /ionic URL unchanged', () => {
      const s = createSerializer();
      const tree = s.parse('/ionic/advanced');
      expect(tree.toString()).toBe('/ionic/advanced');
    });

    it('should leave a /custom URL unchanged', () => {
      const s = createSerializer();
      const tree = s.parse('/custom/something');
      expect(tree.toString()).toBe('/custom/something');
    });
  });

  // ── Bare URLs get current adapter prepended ──

  describe('bare URLs (no adapter prefix)', () => {
    it('should prepend /material when current location is /material', () => {
      const s = createSerializer('/material/something');
      const tree = s.parse('/getting-started');
      expect(tree.toString()).toBe('/material/getting-started');
    });

    it('should prepend /bootstrap when current location is /bootstrap', () => {
      const s = createSerializer('/bootstrap/something');
      const tree = s.parse('/field-types/text-inputs');
      expect(tree.toString()).toBe('/bootstrap/field-types/text-inputs');
    });

    it('should prepend /primeng when current location is /primeng', () => {
      const s = createSerializer('/primeng/validation');
      const tree = s.parse('/validation/basics');
      expect(tree.toString()).toBe('/primeng/validation/basics');
    });

    it('should prepend /ionic when current location is /ionic', () => {
      const s = createSerializer('/ionic/docs');
      const tree = s.parse('/advanced/custom-fields');
      expect(tree.toString()).toBe('/ionic/advanced/custom-fields');
    });
  });

  // ── Pass-through cases ──

  describe('pass-through URLs', () => {
    it('should pass through root URL "/"', () => {
      const s = createSerializer();
      const tree = s.parse('/');
      expect(tree.toString()).toBe('/');
    });

    it('should pass through hash URLs starting with "/#"', () => {
      const s = createSerializer();
      // normalize() returns '/#...' unchanged, DefaultUrlSerializer treats '#' as fragment
      const tree = s.parse('/#/some/path');
      expect(tree).toBeDefined();
    });

    it('should pass through empty URL', () => {
      const s = createSerializer();
      const tree = s.parse('');
      expect(tree.toString()).toBe('/');
    });
  });

  // ── Query params and fragments ──

  describe('query params and fragments', () => {
    it('should preserve query params on adapter-prefixed URLs', () => {
      const s = createSerializer();
      const tree = s.parse('/material/getting-started?tab=install');
      expect(tree.toString()).toBe('/material/getting-started?tab=install');
    });

    it('should preserve query params when prepending adapter', () => {
      const s = createSerializer('/bootstrap/page');
      const tree = s.parse('/getting-started?tab=install');
      expect(tree.toString()).toBe('/bootstrap/getting-started?tab=install');
    });

    it('should preserve fragments on adapter-prefixed URLs', () => {
      const s = createSerializer();
      const tree = s.parse('/material/getting-started#section');
      expect(tree.toString()).toBe('/material/getting-started#section');
    });

    it('should preserve fragments when prepending adapter', () => {
      const s = createSerializer('/ionic/page');
      const tree = s.parse('/getting-started#section');
      expect(tree.toString()).toBe('/ionic/getting-started#section');
    });

    it('should preserve both query params and fragments', () => {
      const s = createSerializer('/material/page');
      const tree = s.parse('/field-types?view=grid#advanced');
      expect(tree.toString()).toBe('/material/field-types?view=grid#advanced');
    });
  });

  // ── Fallback to 'material' ──

  describe('fallback to material', () => {
    it('should fall back to "material" when document.location has no valid adapter', () => {
      const s = createSerializer('/');
      const tree = s.parse('/getting-started');
      expect(tree.toString()).toBe('/material/getting-started');
    });

    it('should fall back to "material" when document.location has an invalid adapter segment', () => {
      const s = createSerializer('/unknown/page');
      const tree = s.parse('/getting-started');
      expect(tree.toString()).toBe('/material/getting-started');
    });

    it('should fall back to "material" when document.location.pathname is empty-like', () => {
      const s = createSerializer('');
      const tree = s.parse('/getting-started');
      expect(tree.toString()).toBe('/material/getting-started');
    });
  });

  // ── Edge cases ──

  describe('edge cases', () => {
    it('should handle URL with only adapter prefix', () => {
      const s = createSerializer();
      const tree = s.parse('/material');
      expect(tree.toString()).toBe('/material');
    });

    it('should not double-prepend adapter for already-prefixed URLs', () => {
      const s = createSerializer('/bootstrap/page');
      const tree = s.parse('/bootstrap/field-types');
      expect(tree.toString()).toBe('/bootstrap/field-types');
    });

    it('should handle deeply nested bare URL', () => {
      const s = createSerializer('/primeng/whatever');
      const tree = s.parse('/a/b/c/d');
      expect(tree.toString()).toBe('/primeng/a/b/c/d');
    });
  });
});
