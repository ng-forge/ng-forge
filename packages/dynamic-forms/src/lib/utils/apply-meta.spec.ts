import { applyMetaToElement } from './apply-meta';

describe('applyMetaToElement', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('input');
  });

  describe('adding attributes', () => {
    it('should add string attributes', () => {
      const meta = { 'data-testid': 'my-input', autocomplete: 'email' };
      const applied = applyMetaToElement(element, meta, new Set());

      expect(element.getAttribute('data-testid')).toBe('my-input');
      expect(element.getAttribute('autocomplete')).toBe('email');
      expect(applied).toEqual(new Set(['data-testid', 'autocomplete']));
    });

    it('should add numeric attributes as strings', () => {
      const meta = { tabindex: 5 } as Record<string, unknown>;
      const applied = applyMetaToElement(element, meta, new Set());

      expect(element.getAttribute('tabindex')).toBe('5');
      expect(applied).toEqual(new Set(['tabindex']));
    });

    it('should convert true boolean to "true" string', () => {
      const meta = { 'aria-required': true } as Record<string, unknown>;
      const applied = applyMetaToElement(element, meta, new Set());

      expect(element.getAttribute('aria-required')).toBe('true');
      expect(applied).toEqual(new Set(['aria-required']));
    });

    it('should convert false boolean to "false" string', () => {
      const meta = { 'aria-disabled': false } as Record<string, unknown>;
      const applied = applyMetaToElement(element, meta, new Set());

      expect(element.getAttribute('aria-disabled')).toBe('false');
      expect(applied).toEqual(new Set(['aria-disabled']));
    });
  });

  describe('removing attributes', () => {
    it('should remove previously applied attributes not in new meta', () => {
      element.setAttribute('data-testid', 'old-value');
      element.setAttribute('data-old', 'should-be-removed');

      const previouslyApplied = new Set(['data-testid', 'data-old']);
      const meta = { 'data-testid': 'new-value' };

      applyMetaToElement(element, meta, previouslyApplied);

      expect(element.getAttribute('data-testid')).toBe('new-value');
      expect(element.hasAttribute('data-old')).toBe(false);
    });

    it('should remove all previously applied attributes when meta is undefined', () => {
      element.setAttribute('data-testid', 'value');
      element.setAttribute('autocomplete', 'email');

      const previouslyApplied = new Set(['data-testid', 'autocomplete']);
      applyMetaToElement(element, undefined, previouslyApplied);

      expect(element.hasAttribute('data-testid')).toBe(false);
      expect(element.hasAttribute('autocomplete')).toBe(false);
    });

    it('should remove attributes set to undefined in new meta', () => {
      element.setAttribute('data-testid', 'value');

      const previouslyApplied = new Set(['data-testid']);
      const meta = { 'data-testid': undefined } as Record<string, unknown>;

      applyMetaToElement(element, meta, previouslyApplied);

      expect(element.hasAttribute('data-testid')).toBe(false);
    });
  });

  describe('null/undefined handling', () => {
    it('should skip null values', () => {
      const meta = { 'data-testid': null } as Record<string, unknown>;
      const applied = applyMetaToElement(element, meta, new Set());

      expect(element.hasAttribute('data-testid')).toBe(false);
      expect(applied.size).toBe(0);
    });

    it('should skip undefined values', () => {
      const meta = { 'data-testid': undefined } as Record<string, unknown>;
      const applied = applyMetaToElement(element, meta, new Set());

      expect(element.hasAttribute('data-testid')).toBe(false);
      expect(applied.size).toBe(0);
    });

    it('should return empty set when meta is undefined', () => {
      const applied = applyMetaToElement(element, undefined, new Set());
      expect(applied.size).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle empty meta object', () => {
      const meta = {};
      const applied = applyMetaToElement(element, meta, new Set());

      expect(applied.size).toBe(0);
    });

    it('should handle empty previouslyApplied set', () => {
      const meta = { 'data-testid': 'value' };
      const applied = applyMetaToElement(element, meta, new Set());

      expect(element.getAttribute('data-testid')).toBe('value');
      expect(applied).toEqual(new Set(['data-testid']));
    });

    it('should preserve attributes not tracked in previouslyApplied', () => {
      element.setAttribute('id', 'my-id');
      element.setAttribute('class', 'my-class');

      const meta = { 'data-testid': 'value' };
      applyMetaToElement(element, meta, new Set());

      expect(element.getAttribute('id')).toBe('my-id');
      expect(element.getAttribute('class')).toBe('my-class');
    });

    it('should update existing attributes with new values', () => {
      element.setAttribute('data-testid', 'old-value');

      const previouslyApplied = new Set(['data-testid']);
      const meta = { 'data-testid': 'new-value' };

      const applied = applyMetaToElement(element, meta, previouslyApplied);

      expect(element.getAttribute('data-testid')).toBe('new-value');
      expect(applied).toEqual(new Set(['data-testid']));
    });
  });
});
