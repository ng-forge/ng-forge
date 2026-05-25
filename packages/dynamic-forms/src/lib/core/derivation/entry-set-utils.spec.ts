import { BehaviorSubject, Subject, of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { buildEntryStreamPipeline, entrySetsEqual } from './entry-set-utils';

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

describe('buildEntryStreamPipeline', () => {
  it('only re-invokes createStream for entries that actually changed', () => {
    // Simulates the orchestrator's behavior: when the collection changes,
    // entries whose signature is unchanged should not be re-built. Verifies
    // distinctUntilChanged + multiset comparison + switchMap.
    const collection$ = new BehaviorSubject<FakeEntry[] | null>([
      { fieldKey: 'a', payload: '1' },
      { fieldKey: 'b', payload: '1' },
    ]);

    const createStream = vi.fn().mockImplementation((entry: FakeEntry) => of(`built:${sig(entry)}`));

    const pipeline$ = buildEntryStreamPipeline<FakeEntry[] | null, FakeEntry>({
      collection$,
      selectEntries: (c) => c ?? [],
      entrySignature: sig,
      createStream,
    });

    const emissions: unknown[] = [];
    const sub = pipeline$.subscribe((v) => emissions.push(v));

    expect(createStream).toHaveBeenCalledTimes(2);
    expect(createStream).toHaveBeenCalledWith({ fieldKey: 'a', payload: '1' });
    expect(createStream).toHaveBeenCalledWith({ fieldKey: 'b', payload: '1' });
    expect(emissions).toEqual(['built:a:1', 'built:b:1']);

    // Same content, reordered — should NOT recreate streams (multiset equality).
    createStream.mockClear();
    emissions.length = 0;
    collection$.next([
      { fieldKey: 'b', payload: '1' },
      { fieldKey: 'a', payload: '1' },
    ]);
    expect(createStream).not.toHaveBeenCalled();
    expect(emissions).toEqual([]);

    // Change 'b' content only — switchMap tears down the whole merged inner
    // stream and re-creates BOTH entries (this is the documented behavior of
    // the orchestrator's switchMap-based pipeline). The fact that the multiset
    // signature changed at all is what triggers the rebuild; per-entry-diff
    // re-use is out of scope.
    createStream.mockClear();
    emissions.length = 0;
    collection$.next([
      { fieldKey: 'a', payload: '1' },
      { fieldKey: 'b', payload: '2' },
    ]);
    expect(createStream).toHaveBeenCalledTimes(2);
    expect(emissions).toEqual(['built:a:1', 'built:b:2']);

    sub.unsubscribe();
  });

  it('returns EMPTY (no emissions) when the entry list is empty', () => {
    const collection$ = of<FakeEntry[]>([]);
    const createStream = vi.fn();
    const pipeline$ = buildEntryStreamPipeline<FakeEntry[], FakeEntry>({
      collection$,
      selectEntries: (c) => c,
      entrySignature: sig,
      createStream,
    });

    const emissions: unknown[] = [];
    pipeline$.subscribe((v) => emissions.push(v));

    expect(createStream).not.toHaveBeenCalled();
    expect(emissions).toEqual([]);
  });

  it('skips entries when createStream returns null (e.g., missing prerequisite)', () => {
    const collection$ = of<FakeEntry[]>([
      { fieldKey: 'a', payload: '1' },
      { fieldKey: 'b', payload: '1' },
    ]);
    const createStream = vi.fn().mockImplementation((entry: FakeEntry) => (entry.fieldKey === 'a' ? null : of(`built:${sig(entry)}`)));

    const pipeline$ = buildEntryStreamPipeline<FakeEntry[], FakeEntry>({
      collection$,
      selectEntries: (c) => c,
      entrySignature: sig,
      createStream,
    });

    const emissions: unknown[] = [];
    pipeline$.subscribe((v) => emissions.push(v));

    expect(createStream).toHaveBeenCalledTimes(2);
    expect(emissions).toEqual(['built:b:1']);
  });

  it('treats null collection as empty (no emissions)', () => {
    const collection$ = new Subject<FakeEntry[] | null>();
    const createStream = vi.fn();

    const pipeline$ = buildEntryStreamPipeline<FakeEntry[] | null, FakeEntry>({
      collection$,
      selectEntries: (c) => c ?? [],
      entrySignature: sig,
      createStream,
    });

    const emissions: unknown[] = [];
    pipeline$.subscribe((v) => emissions.push(v));

    collection$.next(null);
    expect(createStream).not.toHaveBeenCalled();
    expect(emissions).toEqual([]);
  });
});
