import { describe, expect, it, vi } from 'vitest';
import type { EvaluationContext } from '../../models/expressions/evaluation-context';
import type { Logger } from '../../providers/features/logger/logger.interface';
import { computeValueFromEntry } from './compute-derived-value';

// A sync derivation slot ('fn' / 'functionName' / 'expression') must return a plain
// value. If a user wires an async function into the sync slot, the returned Promise
// (or Observable) would otherwise be written into the field as its value, surfacing as
// `[object Promise]`. The 'asyncDerivations' / HTTP-derivation paths exist for async
// logic. These tests pin that the sync compute path refuses an async result.

const makeLogger = (): Logger => ({ warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() });

function makeContext(logger: Logger): EvaluationContext {
  return {
    fieldValue: undefined,
    formValue: {},
    fieldPath: 'total',
    customFunctions: {},
    logger,
  };
}

describe('computeValueFromEntry — async result misuse in the sync slot', () => {
  it('returns undefined (not the Promise) and warns when an inline fn returns a Promise', () => {
    const logger = makeLogger();
    const result = computeValueFromEntry({ fn: () => Promise.resolve(42) }, makeContext(logger), { subject: 'total' });

    expect(result).toBeUndefined();
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Promise or Observable'));
  });

  it('returns undefined and warns when an inline fn returns an Observable-like value', () => {
    const logger = makeLogger();
    const observableLike = { subscribe: () => ({ unsubscribe: () => undefined }) };
    const result = computeValueFromEntry({ fn: () => observableLike }, makeContext(logger), { subject: 'total' });

    expect(result).toBeUndefined();
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Promise or Observable'));
  });

  it('returns a plain object result unchanged (no false positive)', () => {
    const logger = makeLogger();
    const value = { amount: 10 };
    const result = computeValueFromEntry({ fn: () => value }, makeContext(logger), { subject: 'total' });

    expect(result).toBe(value);
    expect(logger.warn).not.toHaveBeenCalled();
  });
});
