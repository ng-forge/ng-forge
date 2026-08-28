import { createFeature, DynamicFormFeature } from '../dynamic-form-feature';
import { clampWindowSize } from '../clamp-window';
import { FIELD_WINDOWING, FieldWindowingConfig } from './field-windowing.token';
import { FieldParkingOption, resolveFieldParking } from './resolve-field-windowing';

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
 * Mounting is one-way — `@defer (on viewport)` never unmounts — so on its own
 * that bound is temporary: scroll a long form once and every field is live
 * again for the rest of the session. **Parking** closes the gap and comes on
 * with this feature (it is off when the feature is not used, since it changes
 * rendering behaviour). A field scrolled outside `park.margin` leaves change detection but
 * keeps its DOM, so it costs nothing per keystroke while staying findable by
 * browser search, fillable by autofill, and reachable by assistive tech. Its
 * own edits still reach the model: Angular binds `input` / `blur` with plain
 * DOM listeners, which keep firing on a detached view.
 *
 * **Precedence:**
 * 1. Per-form `fieldWindowing` on `FormOptions` — wins for that form
 * 2. Global `withFieldWindowing(...)` — baseline default for all forms
 * 3. No feature — token default (disabled, i.e. fully eager)
 *
 * @param config - `eager` (default `12`), `placeholderHeight` (default `'4rem'`)
 *   and `park` (default on, margin `'100%'`) overrides. `eager` is clamped to a
 *   non-negative integer.
 * @returns A DynamicFormFeature that enables the global field windowing default
 *
 * @example
 * ```typescript
 * provideDynamicForm(...withMaterialFields(), withFieldWindowing({ eager: 20 }));
 * ```
 */
export function withFieldWindowing(config?: {
  eager?: number;
  placeholderHeight?: string;
  park?: FieldParkingOption;
}): DynamicFormFeature<'field-windowing'> {
  const resolved: FieldWindowingConfig = {
    enabled: true,
    eager: clampWindowSize(config?.eager, 12),
    placeholderHeight: config?.placeholderHeight ?? '4rem',
    park: resolveFieldParking({ enabled: true, margin: '100%' }, config?.park),
  };

  return createFeature('field-windowing', [{ provide: FIELD_WINDOWING, useValue: resolved }]);
}
