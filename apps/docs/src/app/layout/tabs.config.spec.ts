import { findTabGroup, findTabEntry } from './tabs.config';

describe('findTabGroup', () => {
  it('should return the correct TabGroup for a known tab slug', () => {
    const group = findTabGroup('dynamic-behavior/derivation/values');
    expect(group).toBeDefined();
    expect(group!.navPath).toBe('dynamic-behavior/derivation');
    expect(group!.tabs).toHaveLength(3);
  });

  it('should return the same TabGroup instance for all slugs in a group', () => {
    const group1 = findTabGroup('dynamic-behavior/derivation/values');
    const group2 = findTabGroup('dynamic-behavior/derivation/property');
    const group3 = findTabGroup('dynamic-behavior/derivation/async');
    expect(group1).toBe(group2);
    expect(group2).toBe(group3);
  });

  it('should return undefined for an unknown slug', () => {
    expect(findTabGroup('non-existent/slug')).toBeUndefined();
  });
});

describe('findTabEntry', () => {
  it('should return the matching TabEntry for a known slug', () => {
    const entry = findTabEntry('dynamic-behavior/derivation/property');
    expect(entry).toBeDefined();
    expect(entry!.label).toBe('Properties');
    expect(entry!.slug).toBe('dynamic-behavior/derivation/property');
  });

  it('should return undefined for an unknown slug', () => {
    expect(findTabEntry('non-existent/slug')).toBeUndefined();
  });

  it('should return the correct entry among siblings', () => {
    const values = findTabEntry('dynamic-behavior/derivation/values');
    const async_ = findTabEntry('dynamic-behavior/derivation/async');
    expect(values!.label).toBe('Values');
    expect(async_!.label).toBe('Async');
  });
});
