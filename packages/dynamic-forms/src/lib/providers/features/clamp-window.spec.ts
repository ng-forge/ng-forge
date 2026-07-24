import { describe, it, expect } from 'vitest';
import { clampWindowSize } from './clamp-window';

describe('clampWindowSize', () => {
  it('floors and passes through finite non-negative values', () => {
    expect(clampWindowSize(0, 1)).toBe(0);
    expect(clampWindowSize(3, 1)).toBe(3);
    expect(clampWindowSize(2.9, 1)).toBe(2);
  });

  it('clamps negatives to 0', () => {
    expect(clampWindowSize(-5, 1)).toBe(0);
    expect(clampWindowSize(-Infinity, 1)).toBe(1); // non-finite → fallback, not 0
  });

  it('falls back on undefined', () => {
    expect(clampWindowSize(undefined, 7)).toBe(7);
  });

  it('falls back on NaN (would otherwise mount nothing)', () => {
    expect(clampWindowSize(NaN, 1)).toBe(1);
  });

  it('falls back on Infinity (would otherwise mount everything)', () => {
    expect(clampWindowSize(Infinity, 1)).toBe(1);
  });
});
