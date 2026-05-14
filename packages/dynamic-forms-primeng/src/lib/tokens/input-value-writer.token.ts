import { InjectionToken } from '@angular/core';

/**
 * Per-field writer that pushes a new value into the host input's
 * `FieldTree`. Provided at the `prime-input` field component level so addon
 * kinds (notably `pi-button` with `preset: 'clear' | 'reset' | 'paste'`)
 * can mutate the field value without re-deriving the form path themselves.
 *
 * The host component calls `bind(sink)` once during construction to supply
 * the writer with its `FieldTree`-aware sink — the closure stays internal
 * to the writer rather than mutating a public field on it.
 */
export interface PrimeInputValueWriter {
  /** Dispatch to the bound sink. No-op until `bind(...)` is called. */
  write(value: unknown): void;
  /**
   * @internal — called by `PrimeInputFieldComponent.constructor` to wire
   * the writer to the host's field signal. Calls happen at click time, by
   * which point the field signal is bound.
   */
  bind(sink: (value: unknown) => void): void;
}

/** Factory used by `PrimeInputFieldComponent.providers`. Returns an unbound writer; the host binds it. */
export function createPrimeInputValueWriter(): PrimeInputValueWriter {
  let sink: (value: unknown) => void = () => undefined;
  return {
    write: (value) => sink(value),
    bind: (next) => {
      sink = next;
    },
  };
}

export const PRIME_INPUT_VALUE_WRITER = new InjectionToken<PrimeInputValueWriter>('PRIME_INPUT_VALUE_WRITER');
