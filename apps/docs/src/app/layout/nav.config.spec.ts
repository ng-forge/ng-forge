import { findNavLabel, findBreadcrumbTrail, NAV_ITEMS, NavItem } from './nav.config';

describe('findNavLabel', () => {
  it('should find a top-level item', () => {
    expect(findNavLabel('getting-started')).toBe('Getting Started');
  });

  it('should find a nested child item', () => {
    expect(findNavLabel('field-types/text-inputs')).toBe('Text Inputs');
  });

  it('should find a deeply nested grandchild item', () => {
    expect(findNavLabel('prebuilt/form-arrays/simplified')).toBe('Simplified API');
  });

  it('should return undefined for a non-existent path', () => {
    expect(findNavLabel('does-not-exist')).toBeUndefined();
  });

  it('should accept a custom items array', () => {
    const items: NavItem[] = [{ label: 'Custom', path: 'custom-path' }];
    expect(findNavLabel('custom-path', items)).toBe('Custom');
    expect(findNavLabel('getting-started', items)).toBeUndefined();
  });
});

describe('findBreadcrumbTrail', () => {
  it('should return a single breadcrumb for a top-level item', () => {
    const trail = findBreadcrumbTrail('getting-started');
    expect(trail).toEqual([{ label: 'Getting Started', path: 'getting-started' }]);
  });

  it('should return parent + child breadcrumbs for a nested item', () => {
    const trail = findBreadcrumbTrail('validation/basics');
    expect(trail).toEqual([
      { label: 'Validation', path: 'validation' },
      { label: 'Basics', path: 'validation/basics' },
    ]);
  });

  it('should return full trail for a deeply nested item', () => {
    const trail = findBreadcrumbTrail('prebuilt/form-arrays/simplified');
    expect(trail).toEqual([
      { label: 'Layout Components', path: 'prebuilt' },
      { label: 'Form Arrays', path: 'prebuilt/form-arrays' },
      { label: 'Simplified API', path: 'prebuilt/form-arrays/simplified' },
    ]);
  });

  it('should return an empty array for a non-existent path', () => {
    const trail = findBreadcrumbTrail('does-not-exist');
    expect(trail).toEqual([]);
  });

  it('should resolve tab sub-pages via the tab group navPath', () => {
    // 'dynamic-behavior/derivation/values' is a tab slug registered
    // under the navPath 'dynamic-behavior/derivation'
    const trail = findBreadcrumbTrail('dynamic-behavior/derivation/values');
    expect(trail.length).toBeGreaterThan(0);
    // Last entry should be the tab itself
    expect(trail[trail.length - 1]).toEqual({
      label: 'Values',
      path: 'dynamic-behavior/derivation/values',
    });
    // Parent trail should include Dynamic Behavior > Value Derivation
    expect(trail).toEqual([
      { label: 'Dynamic Behavior', path: 'dynamic-behavior' },
      { label: 'Value Derivation', path: 'dynamic-behavior/derivation' },
      { label: 'Values', path: 'dynamic-behavior/derivation/values' },
    ]);
  });
});
