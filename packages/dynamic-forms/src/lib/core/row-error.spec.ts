import { TestBed } from '@angular/core/testing';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { form, schema, validateTree } from '@angular/forms/signals';
import { rowError } from '@ng-forge/dynamic-forms/internal';

/**
 * `rowError` exists so a per-row rule does not force a double cast into every config.
 * These run it through a real array schema rather than a stand-in context.
 */
describe('rowError', () => {
  let injector: Injector;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    injector = TestBed.inject(Injector);
  });

  function buildForm(rows: { from: string; to: string }[], target: { index: number; key: string }) {
    return runInInjectionContext(injector, () => {
      const value = signal({ periods: rows });
      return form(
        value,
        schema<{ periods: { from: string; to: string }[] }>((path) => {
          validateTree(path.periods, (ctx) => {
            const list = ctx.value() as { from: string; to: string }[];
            return list.flatMap((row, i) =>
              row.to < row.from ? [rowError(ctx as never, target.index, target.key, { kind: 'periodOrder' })] : [],
            ) as never;
          });
        }),
      );
    });
  }

  const kindsOf = (node: unknown) =>
    (node as () => { errors: () => { kind: string }[] })()
      .errors()
      .map((e) => e.kind);

  it('lands the error on the addressed row and field', () => {
    const f = buildForm(
      [
        { from: '2026-01-01', to: '2026-01-02' },
        { from: '2026-01-02', to: '2026-01-01' },
      ],
      { index: 1, key: 'to' },
    );

    const rows = (f as never as Record<string, never>)['periods'] as never as Record<number, Record<string, unknown>>;
    expect(kindsOf(rows[1]['to'])).toContain('periodOrder');
    expect(kindsOf(rows[0]['to'])).not.toContain('periodOrder');
  });

  it('leaves the container clean when the error is targeted', () => {
    const f = buildForm([{ from: '2026-01-02', to: '2026-01-01' }], { index: 0, key: 'to' });

    const arrayNode = (f as never as Record<string, () => { errors: () => { kind: string }[] }>)['periods'];
    expect(kindsOf(arrayNode)).not.toContain('periodOrder');
  });

  it('falls back to the container when the row cannot be resolved', () => {
    // An out-of-range index must not swallow the error silently.
    const f = buildForm([{ from: '2026-01-02', to: '2026-01-01' }], { index: 99, key: 'to' });

    const arrayNode = (f as never as Record<string, () => { errors: () => { kind: string }[] }>)['periods'];
    expect(kindsOf(arrayNode)).toContain('periodOrder');
  });

  it('falls back to the container when the field key does not exist', () => {
    const f = buildForm([{ from: '2026-01-02', to: '2026-01-01' }], { index: 0, key: 'nope' });

    const arrayNode = (f as never as Record<string, () => { errors: () => { kind: string }[] }>)['periods'];
    expect(kindsOf(arrayNode)).toContain('periodOrder');
  });
});
