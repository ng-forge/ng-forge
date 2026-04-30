import { InjectionToken } from '@angular/core';

/**
 * Per-field writer that pushes a new value into the host input's
 * `FieldTree`. Provided at the `prime-input` field component level so addon
 * kinds (notably `pi-button` with `preset: 'clear' | 'reset' | 'paste'`)
 * can mutate the field value without re-deriving the form path themselves.
 *
 * Implemented as a thin holder so the writer can be patched after DI runs
 * (the `field` input isn't bound at construction time). The field component
 * sets `write` in its constructor to delegate to its bound `FieldTree`.
 */
export interface PrimeInputValueWriter {
  write: (value: unknown) => void;
}

/** Factory used by `PrimeInputFieldComponent.providers`. Sentinel write is replaced at construction. */
export function createPrimeInputValueWriter(): PrimeInputValueWriter {
  return { write: () => undefined };
}

export const PRIME_INPUT_VALUE_WRITER = new InjectionToken<PrimeInputValueWriter>('PRIME_INPUT_VALUE_WRITER');
