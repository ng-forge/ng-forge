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

  it('treats duplicate signatures as a multiset (identical lists compare equal)', () => {
    const a: FakeEntry[] = [
      { fieldKey: 'x', payload: '1' },
      { fieldKey: 'x', payload: '1' },
    ];
    const b: FakeEntry[] = [
      { fieldKey: 'x', payload: '1' },
      { fieldKey: 'x', payload: '1' },
    ];
    expect(entrySetsEqual(a, b, sig)).toBe(true);
  });

  it('distinguishes [A, B] from [A, A] (multiset, not set)', () => {
    // Regression: a Set-based comparison would falsely report these equal
    // (same length, both contain "x:1"). Multiset semantics catches the
    // duplicate so streams rebuild when an entry is added or replaced with a
    // duplicate of another.
    const ab: FakeEntry[] = [
      { fieldKey: 'x', payload: '1' },
      { fieldKey: 'y', payload: '1' },
    ];
    const aa: FakeEntry[] = [
      { fieldKey: 'x', payload: '1' },
      { fieldKey: 'x', payload: '1' },
    ];
    expect(entrySetsEqual(ab, aa, sig)).toBe(false);
    expect(entrySetsEqual(aa, ab, sig)).toBe(false);
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
