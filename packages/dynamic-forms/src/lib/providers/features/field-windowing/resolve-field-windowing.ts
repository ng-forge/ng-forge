import { FieldWindowingConfig } from './field-windowing.token';

/** Per-form override shape for `FormOptions.fieldWindowing`. */
export type FieldWindowingOption = boolean | { eager?: number; placeholderHeight?: string };

/**
 * Resolves the effective field-windowing config for a form: per-form
 * `FormOptions.fieldWindowing` wins over the global `withFieldWindowing()`
 * default (`global`, the injected `FIELD_WINDOWING` value).
 *
 * - `undefined` — use `global` as-is
 * - `false` — force-disable for this form
 * - `true` — force-enable, using `global`'s `eager` / `placeholderHeight`
 * - object — force-enable; per-form `eager` / `placeholderHeight` win over `global`'s
 */
export function resolveFieldWindowing(global: FieldWindowingConfig, perForm: FieldWindowingOption | undefined): FieldWindowingConfig {
  if (perForm === undefined) {
    return global;
  }

  if (typeof perForm === 'boolean') {
    return { ...global, enabled: perForm };
  }

  return {
    enabled: true,
    eager: perForm.eager !== undefined ? Math.max(0, Math.floor(perForm.eager)) : global.eager,
    placeholderHeight: perForm.placeholderHeight ?? global.placeholderHeight,
  };
}
