import { describe, expect, it } from 'vitest';
import { withLegacyStatusClasses } from './with-legacy-status-classes';
import { isDynamicFormFeature } from '../dynamic-form-feature';

describe('withLegacyStatusClasses', () => {
  it('returns a DynamicFormFeature with the legacy-status-classes kind', () => {
    const feature = withLegacyStatusClasses();

    expect(isDynamicFormFeature(feature)).toBe(true);
    expect(feature.ɵkind).toBe('legacy-status-classes');
  });

  it('provides a non-empty providers array', () => {
    const feature = withLegacyStatusClasses();

    expect(Array.isArray(feature.ɵproviders)).toBe(true);
    expect(feature.ɵproviders.length).toBeGreaterThan(0);
  });
});
