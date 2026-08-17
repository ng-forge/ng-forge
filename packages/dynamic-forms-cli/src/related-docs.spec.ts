import { describe, it, expect } from 'vitest';
import { collectRelatedDocs } from './related-docs.js';

describe('collectRelatedDocs', () => {
  it('maps errors to documentation links', () => {
    const hints = collectRelatedDocs([{ path: 'fields[0].props.options', message: 'options must be at field level' }]);

    expect(hints.length).toBeGreaterThan(0);
    expect(hints[0]).toContain('https://ng-forge.com/dynamic-forms/');
  });

  it('deduplicates repeated topics', () => {
    const error = { path: 'fields[0].props.options', message: 'options must be at field level' };
    const hints = collectRelatedDocs([error, error, error]);
    const paths = hints.map((h) => h.split(' ').at(-1));

    expect(new Set(paths).size).toBe(paths.length);
  });

  it('returns nothing for errors with no mapped topic', () => {
    expect(collectRelatedDocs([{ path: 'zzz', message: 'zzz' }])).toEqual([]);
  });

  it('emits a link for every documented topic pattern', () => {
    const hints = collectRelatedDocs([
      { path: 'fields[0].props.options', message: 'options' },
      { path: 'fields[1]', message: 'hidden field requires value' },
      { path: 'fields[2].logic', message: 'conditional logic' },
      { path: 'fields[3].validators', message: 'required validator' },
      { path: 'fields[4].derivation', message: 'derivation expression' },
    ]);

    expect(hints.length).toBeGreaterThanOrEqual(5);
    for (const hint of hints) {
      expect(hint).toMatch(/^.+: https:\/\/ng-forge\.com\/dynamic-forms\/\S+$/);
    }
  });
});
