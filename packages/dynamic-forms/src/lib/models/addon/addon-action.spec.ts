import { describe, expect, it } from 'vitest';
import {
  type AddonActionContext,
  type FieldBoundAddonActionContext,
  isFieldBoundContext,
  type OrphanAddonActionContext,
} from './addon-action';

describe('isFieldBoundContext', () => {
  it('narrows to FieldBoundAddonActionContext when form !== null', () => {
    const ctx: AddonActionContext<string> = {
      field: { key: 'q', type: 'input' },
      form: {} as FieldBoundAddonActionContext<string>['form'],
      value: 'hello',
      setValue: () => undefined,
    };
    if (isFieldBoundContext(ctx)) {
      // Inside the guard, setValue is non-optional. The assertion below
      // would be a type error if narrowing did not occur.
      const writer: (next: string) => void = ctx.setValue;
      expect(typeof writer).toBe('function');
    } else {
      throw new Error('expected isFieldBoundContext to return true');
    }
  });

  it('returns false for orphan context (form === null) and the union keeps setValue?: undefined', () => {
    const orphan: OrphanAddonActionContext<string> = {
      field: { key: 'q', type: 'input' },
      form: null,
      value: undefined,
    };
    expect(isFieldBoundContext(orphan)).toBe(false);
    // setValue is `undefined` on the orphan branch — the type guard refuses to
    // narrow it to a callable, so any write-back path must short-circuit.
    expect(orphan.setValue).toBeUndefined();
  });
});
