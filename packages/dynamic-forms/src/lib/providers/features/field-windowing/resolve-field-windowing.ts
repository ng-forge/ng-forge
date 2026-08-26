import { FieldParkingConfig, FieldWindowingConfig } from './field-windowing.token';
import { clampWindowSize } from '../clamp-window';

/** Per-form override shape for parking. `false` opts out; an object tunes the margin. */
export type FieldParkingOption = boolean | { margin?: string };

/** Per-form override shape for `FormOptions.fieldWindowing`. */
export type FieldWindowingOption = boolean | { eager?: number; placeholderHeight?: string; park?: FieldParkingOption };

/**
 * Resolves the effective field-windowing config for a form: per-form
 * `FormOptions.fieldWindowing` wins over the global `withFieldWindowing()`
 * default (`global`, the injected `FIELD_WINDOWING` value).
 *
 * - `undefined` — use `global` as-is
 * - `false` — force-disable for this form
 * - `true` — force-enable, using `global`'s `eager` / `placeholderHeight` / `park`
 * - object — force-enable; per-form keys win over `global`'s
 *
 * A `park`-only object is the one exception: parking and progressive mounting
 * are independent, so tuning parking must not silently switch a form over to
 * deferred mounting. `{ park: false }` means "don't park", not "start
 * deferring everything".
 */
export function resolveFieldWindowing(global: FieldWindowingConfig, perForm: FieldWindowingOption | undefined): FieldWindowingConfig {
  if (perForm === undefined) {
    return global;
  }

  if (typeof perForm === 'boolean') {
    return { ...global, enabled: perForm };
  }

  const configuresMounting = perForm.eager !== undefined || perForm.placeholderHeight !== undefined || Object.keys(perForm).length === 0;

  return {
    enabled: configuresMounting ? true : global.enabled,
    eager: clampWindowSize(perForm.eager, global.eager),
    placeholderHeight: perForm.placeholderHeight ?? global.placeholderHeight,
    park: resolveFieldParking(global.park, perForm.park),
  };
}

/** Parking stays on unless a form explicitly turns it off — it costs nothing to keep. */
export function resolveFieldParking(global: FieldParkingConfig, perForm: FieldParkingOption | undefined): FieldParkingConfig {
  if (perForm === undefined) return global;
  if (typeof perForm === 'boolean') return { ...global, enabled: perForm };
  return { enabled: true, margin: perForm.margin ?? global.margin };
}
