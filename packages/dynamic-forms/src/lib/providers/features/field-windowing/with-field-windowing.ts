import { createFeature, DynamicFormFeature } from '../dynamic-form-feature';
import { FIELD_WINDOWING, FieldWindowingConfig } from './field-windowing.token';

/**
 * Configures global progressive field mounting ("field windowing") for large
 * flat (single-page) forms.
 *
 * @remarks
 * A flat form mounts every field eagerly, so a large form pays the full
 * initial-render cost up front and every keystroke walks all N live views —
 * even for fields far off-screen. Field windowing bounds how much is mounted:
 * the first `eager` fields render immediately, and the rest render as a
 * lightweight placeholder that mounts the moment it scrolls near/into view.
 * Validators, derivations, and values live at the Signal Forms schema level
 * (not the DOM), so unmounted fields keep full form semantics.
 *
 * **Precedence:**
 * 1. Per-form `fieldWindowing` on `FormOptions` — wins for that form
 * 2. Global `withFieldWindowing(...)` — baseline default for all forms
 * 3. No feature — token default (disabled, i.e. fully eager)
 *
 * @param config - `eager` (default `12`) and `placeholderHeight` (default `'4rem'`)
 *   overrides. `eager` is clamped to a non-negative integer.
 * @returns A DynamicFormFeature that enables the global field windowing default
 *
 * @example
 * ```typescript
 * provideDynamicForm(...withMaterialFields(), withFieldWindowing({ eager: 20 }));
 * ```
 */
export function withFieldWindowing(config?: { eager?: number; placeholderHeight?: string }): DynamicFormFeature<'field-windowing'> {
  const resolved: FieldWindowingConfig = {
    enabled: true,
    eager: config?.eager !== undefined ? Math.max(0, Math.floor(config.eager)) : 12,
    placeholderHeight: config?.placeholderHeight ?? '4rem',
  };

  return createFeature('field-windowing', [{ provide: FIELD_WINDOWING, useValue: resolved }]);
}
