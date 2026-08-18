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

  it('matches on the path, not the message', () => {
    // An unknown-field-type message enumerates the valid types, which used to
    // drag in the hidden, container and array pages at once.
    const hints = collectRelatedDocs([
      { path: 'fields.0', message: 'Unknown field type "x". Valid types: input, hidden, text, row, group, array' },
    ]);

    expect(hints).toEqual([]);
  });

  it('emits at most one link per error', () => {
    const hints = collectRelatedDocs([{ path: 'fields[0].props.options', message: 'options must be at field level' }]);
    expect(hints).toHaveLength(1);
  });

  it('maps distinct paths to distinct pages', () => {
    const hints = collectRelatedDocs([
      { path: 'fields[0].props.options', message: 'x' },
      { path: 'fields[1].logic', message: 'x' },
    ]);

    expect(hints).toHaveLength(2);
    expect(hints[0]).toContain('schema-fields/field-types');
    expect(hints[1]).toContain('conditional-logic');
  });

  it('gives no link when the path names nothing mapped, even if the message does', () => {
    // Cost of matching the path only: a hidden-field error reads as
    // `fields[N].value`, so its doc page is not reachable from the path. The
    // fix suggestion still fires, so the guidance survives without the URL.
    expect(collectRelatedDocs([{ path: 'fields[2].value', message: 'Hidden field "token" is missing value' }])).toEqual([]);
  });
});
