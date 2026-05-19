import { describe, expect, it } from 'vitest';
import { NG_STATUS_CLASSES } from '@angular/forms/signals/compat';
import { withLegacyStatusClasses } from './with-legacy-status-classes';
import { isDynamicFormFeature } from '../dynamic-form-feature';

describe('withLegacyStatusClasses', () => {
  it('returns a DynamicFormFeature with the legacy-status-classes kind', () => {
    const feature = withLegacyStatusClasses();

    expect(isDynamicFormFeature(feature)).toBe(true);
    expect(feature.ɵkind).toBe('legacy-status-classes');
  });

  it('wires Angular Signal Forms with NG_STATUS_CLASSES', () => {
    const feature = withLegacyStatusClasses();

    // Walk every provider the feature contributes and assert at least one carries the
    // NG_STATUS_CLASSES reference. Catches refactors that swap the compat strategy
    // for the modern one (current test passing means provideSignalFormsConfig was
    // called with { classes: NG_STATUS_CLASSES }).
    const usesCompatClasses = feature.ɵproviders.some((p) => {
      const provider = p as { useValue?: { classes?: unknown } };
      return provider.useValue?.classes === NG_STATUS_CLASSES;
    });

    expect(usesCompatClasses).toBe(true);
  });
});
