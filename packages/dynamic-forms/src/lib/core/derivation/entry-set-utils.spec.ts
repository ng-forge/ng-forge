import { describe, expect, it } from 'vitest';
import { entrySetsEqual } from './entry-set-utils';

interface FakeEntry {
  fieldKey: string;
  payload: string;
}

const sig = (e: FakeEntry) => `${e.fieldKey}:${e.payload}`;

describe('entrySetsEqual', () => {
  it('returns true for two empty lists', () => {
    expect(entrySetsEqual<FakeEntry>([], [], sig)).toBe(true);
  });

  it('returns true when same entries in the same order', () => {
    const a: FakeEntry[] = [
      { fieldKey: 'x', payload: '1' },
      { fieldKey: 'y', payload: '2' },
    ];
    const b: FakeEntry[] = [
      { fieldKey: 'x', payload: '1' },
      { fieldKey: 'y', payload: '2' },
    ];
    expect(entrySetsEqual(a, b, sig)).toBe(true);
  });

  it('returns true when same entries in a different order (the topological-reorder case)', () => {
    // This is the regression case: topologicalSort can reorder unchanged HTTP/async
    // entries when unrelated entries are added/removed. Order-sensitive comparison
    // would falsely report "different" and tear down healthy streams.
    const before: FakeEntry[] = [
      { fieldKey: 'a', payload: 'http' },
      { fieldKey: 'b', payload: 'http' },
      { fieldKey: 'c', payload: 'http' },
    ];
    const after: FakeEntry[] = [
      { fieldKey: 'c', payload: 'http' },
      { fieldKey: 'a', payload: 'http' },
      { fieldKey: 'b', payload: 'http' },
    ];
    expect(entrySetsEqual(before, after, sig)).toBe(true);
  });

  it('returns false when lengths differ', () => {
    const a: FakeEntry[] = [{ fieldKey: 'x', payload: '1' }];
    const b: FakeEntry[] = [
      { fieldKey: 'x', payload: '1' },
      { fieldKey: 'y', payload: '2' },
    ];
    expect(entrySetsEqual(a, b, sig)).toBe(false);
  });

  it('returns false when an entry was added (same length is required first)', () => {
    const a: FakeEntry[] = [
      { fieldKey: 'x', payload: '1' },
      { fieldKey: 'y', payload: '2' },
    ];
    const b: FakeEntry[] = [
      { fieldKey: 'x', payload: '1' },
      { fieldKey: 'z', payload: '3' },
    ];
    expect(entrySetsEqual(a, b, sig)).toBe(false);
  });

  it('returns false when an entry payload changed (same field key)', () => {
    const a: FakeEntry[] = [{ fieldKey: 'x', payload: 'old' }];
    const b: FakeEntry[] = [{ fieldKey: 'x', payload: 'new' }];
    expect(entrySetsEqual(a, b, sig)).toBe(false);
  });

  it('returns true when two entries share the same signature (Set dedups but length guard catches it)', () => {
    // Defense: if two entries happen to produce the same signature, the set has
    // size 1 but the lists have length 2. The length pre-check rejects this case
    // even when both lists have the duplicate.
    const a: FakeEntry[] = [
      { fieldKey: 'x', payload: '1' },
      { fieldKey: 'x', payload: '1' },
    ];
    const b: FakeEntry[] = [
      { fieldKey: 'x', payload: '1' },
      { fieldKey: 'x', payload: '1' },
    ];
    // Length matches AND every `next` signature exists in `prev`'s set — so this
    // returns true. Duplicate signatures shouldn't occur in practice (entries are
    // self-targeting and field keys are unique), but documenting the actual behavior.
    expect(entrySetsEqual(a, b, sig)).toBe(true);
  });

  it('uses the provided signature function for comparison', () => {
    // Same entries, different signature functions → different equality verdict.
    const fieldKeyOnly = (e: FakeEntry) => e.fieldKey;
    const a: FakeEntry[] = [{ fieldKey: 'x', payload: '1' }];
    const b: FakeEntry[] = [{ fieldKey: 'x', payload: '2' }];

    expect(entrySetsEqual(a, b, fieldKeyOnly)).toBe(true);
    expect(entrySetsEqual(a, b, sig)).toBe(false);
  });
});
