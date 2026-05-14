import { inject, InjectionToken, isDevMode } from '@angular/core';
import { DynamicFormLogger } from '@ng-forge/dynamic-forms';

/**
 * Per-field writer that pushes a value into the host input's `FieldTree`.
 * `pi-button` presets (`clear` / `reset` / `paste`) call `write(...)`;
 * the host component binds the sink once in its constructor.
 */
export interface PrimeInputValueWriter {
  write(value: unknown): void;
  /** Single-bind. Last-write-wins; dev mode warns on double-bind. */
  bind(sink: (value: unknown) => void): void;
}

export function createPrimeInputValueWriter(): PrimeInputValueWriter {
  const logger = inject(DynamicFormLogger, { optional: true });
  let sink: (value: unknown) => void = () => undefined;
  let bound = false;
  return {
    write: (value) => sink(value),
    bind: (next) => {
      if (isDevMode() && bound) {
        logger?.warn('PrimeInputValueWriter.bind() called more than once — last sink wins.');
      }
      sink = next;
      bound = true;
    },
  };
}

export const PRIME_INPUT_VALUE_WRITER = new InjectionToken<PrimeInputValueWriter>('PRIME_INPUT_VALUE_WRITER');
