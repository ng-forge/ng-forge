/**
 * Normalizes a preload/eager window size to a non-negative integer.
 *
 * Guards the non-finite cases `Math.floor` lets through: `NaN` (which would make
 * every `<= window` comparison false, mounting nothing) and `Infinity` (which
 * would remove the bound, mounting everything). Both fall back to `fallback`, as
 * does `undefined`.
 */
export function clampWindowSize(value: number | undefined, fallback: number): number {
  if (value === undefined || !Number.isFinite(value)) return fallback;
  return Math.max(0, Math.floor(value));
}
